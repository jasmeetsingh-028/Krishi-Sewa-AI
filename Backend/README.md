## 📂 Repository Structure  

Krishi-Seva-AI/
│── app.py # Main FastAPI application (entrypoint)
│── test-application.py # Testing script for the app
│── requirements.txt # Python dependencies
│── .env # API keys and environment variables
│── .cache/ # Cached API responses (weather, crop data)
│── .user_info/ # Stores user-specific info (location, preferences)
│── crop_price_tool/ # Tool for fetching crop price data
│── crop_management_tools/ # Crop cultivation & management insights
│── open_meteo_weather_tool/# Weather forecast tool
│── pycache/ # Python cache files
│── .cache.sqlite # SQLite cache for responses

yaml
Copy
Edit

---

## ⚙️ Installation  

### 1. Clone the Repository  
```bash
git clone https://github.com/your-username/Krishi-Seva-AI.git
cd Krishi-Seva-AI
2. Create Virtual Environment
bash
Copy
Edit
python -m venv venv
source venv/bin/activate   # Linux / Mac
venv\Scripts\activate      # Windows
3. Install Dependencies
bash
Copy
Edit
pip install -r requirements.txt
4. Setup Environment Variables
Create a .env file and add your keys (OpenAI/Gemini API, Tavily API, etc.):

ini
Copy
Edit
OPENAI_API_KEY=your_key
GOOGLE_API_KEY=your_key
▶️ Running the Application
Start the FastAPI server:

bash
Copy
Edit
uvicorn app:app --reload
Now, visit http://127.0.0.1:8000/docs to test APIs.

📌 API Endpoints
Initialize User Session
http
Copy
Edit
POST /init
Accepts user coordinates (lat, lon)

Fetches weather and stores user info in .cache/

Query the Assistant
http
Copy
Edit
POST /query
Input:

json
Copy
Edit
{ "user_prompt": "What is the crop price of wheat in Punjab?" }
Output: AI response with relevant data from expert agents

🧠 Agents in the System
Weather Agent → Powered by OpenMeteo

Crop Price Agent → Uses data.gov.in datasets

Crop Management Agent → Experimental disease & crop care insights

Policy Search Agent → Fetches live info on govt. schemes

Memory Agent → Saves user info for personalized recommendations

Supervisor Agent → Manages which agent responds to the user query
