import os
import uuid
import httpx
import json
import calendar
from datetime import datetime
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional
from langgraph_supervisor import create_supervisor
from langgraph.prebuilt import create_react_agent
from langchain.chat_models import init_chat_model
from langgraph.checkpoint.memory import InMemorySaver
from dotenv import load_dotenv
from langchain_tavily import TavilySearch

# ---------- Import Required Tools ----------
from crop_management_tools.crop_calendar.crop_calendar_tool import get_crop_calendar, get_crops_by_month
from crop_management_tools.crop_cultivation_guide.crop_cultivation_tools import *
from open_meteo_weather_tool.weather_tool import get_weather, query_weather_variables
from crop_price_tool.commodity_daily_price_tool import get_crop_price_tool

load_dotenv()

###-------------- datetime information for the agent --------------
def get_date_time_info():
    now = datetime.now()
    day_name = calendar.day_name[now.weekday()]
    month_name = calendar.month_name[now.month]

    print("current time:", now.strftime("%H:%M:%S"), month_name)

    return {
        "current_date": now.strftime("%Y-%m-%d"),
        "day": day_name,
        "month": month_name,
        "year": now.year,
        "time": now.strftime("%H:%M:%S")
    }

# Example usage
date_time_info = get_date_time_info()

# ---------- Create FastAPI app ----------
app = FastAPI(title="Krishi Sewa AI")

# ✅ ADD CORS MIDDLEWARE IMMEDIATELY AFTER CREATING APP
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# ---------- Create the LLM ----------
llm = init_chat_model(model="gpt-4o")

# --------- Initialize tavily search -----------
tavily_search_tool = TavilySearch(
    max_results=3,
    topic="general",
    include_answer=True,
    include_raw_content=True,
    include_images=False,
    search_depth="basic",
    time_range="year"
)

# ---------- User Location --------------
class Coords(BaseModel):
    lat: float = Field(..., ge=-90, le=90)
    lon: float = Field(..., ge=-180, le=180)

async def reverse_geocode(lat: float, lon: float):
    url = "https://nominatim.openstreetmap.org/reverse"
    params = {
        "lat": lat,
        "lon": lon,
        "format": "json",
        "addressdetails": 1
    }
    headers = {"User-Agent": "KrishiSewaAI/1.0"}
    async with httpx.AsyncClient() as client:
        r = await client.get(url, params=params, headers=headers)
        r.raise_for_status()
        return r.json()

@app.post("/init")
async def initialize_user(coords: Coords):
    try:
        location_info = await reverse_geocode(coords.lat, coords.lon)
        address = location_info.get("address", {})

        # Build user info
        user_info = {
            "coords": {"lat": coords.lat, "lon": coords.lon},
            "location": {
                "city": address.get("city") or address.get("town") or address.get("village"),
                "district": address.get("county"),
                "state": address.get("state"),
                "country": address.get("country"),
            },
        }

        # Save user info separately
        os.makedirs(".user_info", exist_ok=True)
        user_info_path = os.path.join(".user_info", "user_info.json")
        with open(user_info_path, "w") as f:
            json.dump(user_info, f, indent=2)

        return {
            "status": "ok",
            "cached_info": "✅ saved at .user_info/user_info.json",
        }

    except Exception as e:
        return {"status": "error", "details": str(e)}

# ------------------ Create Sub Agents ------------------------
def create_weather_agent():
    return create_react_agent(
        model=llm,
        tools=[get_weather, query_weather_variables],
        name="weather_expert",
        prompt="""
        You are a weather forecasting expert specialized in agricultural insights.

        You have access to two tools:
        IMP: USE EACH TOOL ONLY ONCE!

        1. `get_weather(city_name: str)`
           - Takes the name of an Indian city as input.
           - Fetches important weather variables from the local `.cache` (if available and fresh),
             or calls the Open-Meteo API to retrieve new data, then stores it in `.cache`.
           - Provides **3-hourly weather forecasts for the next 3 days**, tailored for agricultural needs.
           - Variables include: temperature, humidity, soil temperature, precipitation, soil moisture, wind speed.

        2. `query_weather_variables(city_name: str, variable: str)`
           - Fetches a **single weather variable with timestamps** for a given city.
           - Useful when the user only asks about one factor.

        Guidelines:
        - Always use these tools to get data instead of guessing.
        - Use `get_weather` when the user wants the **full forecast**.
        - Use `query_weather_variables` when the user wants **only one specific variable**.
        - Summarize results in a farmer-friendly format.
        - If the city name is missing or unclear, politely ask the user to clarify before fetching data.
        """
    )

def create_crop_cultivation_agent():
    return create_react_agent(
        model=llm,
        tools=[search_filename, get_keys, get_context, get_crop_calendar, get_crops_by_month],
        name="crop_agent",
        prompt="""
        You are an agricultural crop cultivation and crop calendar expert.
        You have access to the following tools:

        1. Use these tools to find and retrieve information about crop cultivation
                1. `search_filename(crop_name: str) -> str`
                - Finds the JSON file for a given crop.
                - If crop name is in another language, check for translations.
                - Returns filename or None.

                2. `get_keys(filename: str) -> list`
                - Gets all available section keys for a crop's guide.

                3. `get_context(filename: str, key: str) -> str`
                - Extracts detailed content under the given section key.

        2. use the following tools to get crop calendar information: (eg: what crops can i grow in this month, what crops are suitable for this season)

                1. `get_crop_calendar(crop_name: str) -> dict`
                - Returns crop calendar information (planting, sowing, growth, arrival months) for the crop in India.
                - Example output: {"planting": ["June", "July"], "sowing": ["August"], ...}

                2. `get_crops_by_month(month: int) -> dict`
                - Returns all crops categorized by stage (planting, sowing, growth, arrival) for a given month.
                - Input: integer (1–12). Example: 7 -> July.
                - Output includes stage-wise crops for that month.

        Guidelines:
        - First, understand the user's query.
        - If the user asks about general crop cultivation (e.g., "How to grow rice?"), use `search_filename → get_keys → get_context`.
        - If the user asks about crop timelines or stages (e.g., "When is wheat planted?" or "Which crops are sown in July?"):
            * Use `get_crop_calendar` when the query mentions a specific crop.
            * Use `get_crops_by_month` when the query mentions a specific month.
        - Always present the information in simple, farmer-friendly language.
        - If the crop name, month, or section is unclear, politely ask the user to clarify.
        """
    )

def create_policy_agent():
    return create_react_agent(
        model=llm,
        tools=[tavily_search_tool],
        name="policy_agent",
        prompt="""
        You are an expert in agricultural government policies and schemes.
        Your goal is to provide farmers with accurate, up-to-date, and actionable information.

        Guidelines:
        - Use the Tavily Search tool to fetch relevant policies and schemes.
        - Focus only on official and credible government sources.
        - Present the answer in simple, farmer-friendly language.
        - If the user query is unclear, ask politely for clarification.
        - Return the output as plain text that can be directly used by a farmer.
        """
    )

def create_crop_price_agent():
    return create_react_agent(
        model=llm,
        tools=[get_crop_price_tool],
        name="crop_price_agent",
        prompt="""
        You are a farmer's helper. Your job is to find and explain crop prices in the simplest way a farmer could understand.

        Guidelines:
        - Always respond in the same language as the user's message.
        - Extract the state from the user's query. State is always required.
        - If the user also mentions crop, district, market, variety, or grade, use that too.
        - Do not ask for additional information unless absolutely necessary.
        - Use the `Crop Price Tool` to fetch mandi prices.
        - Summarize results in farmer-friendly language, showing lowest, highest, and average price if available.
        - If data is missing or unclear, politely ask the user for clarification.
        """
    )

# ✅ FIXED: Handle missing user_info.json file gracefully
user_location_info = "No location info available"
try:
    with open(".user_info/user_info.json", "r") as f:
        user_location_info = str(json.load(f))
except FileNotFoundError:
    print("No user location info found. User should call /init endpoint first.")

checkpointer = InMemorySaver()
config = {"configurable": {"thread_id": uuid.uuid4().hex}}

weather_agent = create_weather_agent()
crop_agent = create_crop_cultivation_agent()
policy_agent = create_policy_agent()
crop_price_agent = create_crop_price_agent()

print(str(date_time_info))

##--------------------------- create super-visor workflow ---------------------------
workflow = create_supervisor(
    [weather_agent, crop_agent, policy_agent, crop_price_agent],
    model=llm,
    checkpointer=checkpointer,
    prompt=f"""
    You are a team supervisor managing four expert agents:

    ## User location Info:
    {user_location_info}

    ## Current Date & Time Info:
    {str(date_time_info)}

    (Use this when the user asks about "time", "today," "this month," "current_time," "current season," etc. Always resolve relative terms into actual dates/months before passing to agents.)

    1. Weather Agent
    - Specializes in providing location-based weather forecasts and atmospheric data.
    - Useful when the user asks about current conditions, upcoming forecasts, temperature, rainfall, or other weather-related insights.
    - Can return detailed hourly forecasts, so make sure to clarify the time range if needed.

    2. Crop Agent
    - Specializes in answering questions about crop cultivation practices and crop calendars in India.
    - Uses structured JSON guides stored in the system for each crop, along with crop calendar tools.

    3. Policy Agent
    - Specializes in providing accurate, up-to-date information about government agricultural policies and schemes.
    - Uses the Tavily Search tool to fetch official sources and present actionable insights.

    4. Crop Price Agent
    - Specializes in providing mandi prices for crops across India.
    - If the location is not provided by the user then use User location (user city or user state) Info to fetch mandi prices.
    - Uses the Crop Price Tool to fetch prices from government data sources.

    Your role as Supervisor:
    - Listen to the user's query and decide which expert is best suited to respond.
    - Do not mention that you have retrieved the information from tools.
    - Use the information retrieved from tools to craft your response.
    - If a query requires input from multiple experts (e.g., weather + crop calendar), coordinate their responses in sequence.
    - Always respond in the same language the user used in their query.
    - Ensure answers are clear, concise, and tailored for farmers or agricultural professionals.
    """,
    output_mode="last_message",
)

# Compile workflow with checkpointer
app_workflow = workflow.compile(
    checkpointer=checkpointer,
)

# ✅ FIXED: Match frontend payload structure
class Query(BaseModel):
    user_prompt: str
    coords: Optional[Coords] = None

# ---------- Endpoints ----------
@app.post("/query")
async def query_ai(request: Query):
    try:
        # 🔍 DEBUG: Print received data
        print(f"📡 Received query: {request.user_prompt}")
        
        if request.coords:
            print(f"📍 Location received: Lat={request.coords.lat}, Lon={request.coords.lon}")
        else:
            print("❌ No coordinates received")
        
        # Pass to workflow
        user_msg = {"role": "user", "content": request.user_prompt}
        if request.coords:
            user_msg["metadata"] = {
                "lat": request.coords.lat,
                "lon": request.coords.lon,
            }
            print(f"📋 Message with metadata: {user_msg}")

        result = app_workflow.invoke(
            {"messages": [user_msg]},
            config={"configurable": {"thread_id": uuid.uuid4().hex}},
        )
        
        print(f"✅ AI response generated successfully")
        return {"response": result["messages"][-1].content}
        
    except Exception as e:
        print(f"❌ Error in query_ai: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(500, "Internal error")

@app.get("/")
async def root():
    return {"message": "Krishi Sewa AI API is running!"}

# Test commands:
# curl -X POST "http://localhost:8000/query" \
# -H "Content-Type: application/json" \
# -d '{"user_prompt": "What is the crop calendar for wheat?"}'
