import os
import json
import time
import openmeteo_requests
import requests
import pandas as pd
import requests_cache
from retry_requests import retry

##chages:
# 1. added time interval for weather api
# 2. added variable query for weather data to fetech data for a specific variable


#---------------------function to get latitude and longitude from city name---------------------

def get_lat_lon_from_city(city_name):
    """Get latitude and longitude for a given city name using Nominatim API."""
    url = "https://nominatim.openstreetmap.org/search"
    params = {
        'q': f"{city_name}, India",
        'format': 'json',
        'limit': 1
    }
    headers = {
        'User-Agent': 'Mozilla/5.0 (compatible; MyWeatherApp/1.0; contact@example.com)'
    }
    
    response = requests.get(url, params=params, headers=headers)
    
    # Check if response is valid
    if response.status_code != 200:
        raise ValueError(f"Error fetching location: {response.status_code}")
    
    data = response.json()
    print(data)
    
    if not data:
        raise ValueError(f"City '{city_name}' not found.")
    
    lat = data[0]['lat']
    lon = data[0]['lon']
    return lat, lon


#---------------------function to fetch weather data---------------------

# def fetch_weather_from_api(lat, lon):
#     """Fetch weather data from Open-Meteo API."""
#     cache_session = requests_cache.CachedSession('.cache', expire_after=3600)
#     retry_session = retry(cache_session, retries=5, backoff_factor=0.2)
#     openmeteo = openmeteo_requests.Client(session=retry_session)

#     url = "https://api.open-meteo.com/v1/forecast"
#     params = {
#         "latitude": lat,
#         "longitude": lon,
#         "hourly": [
#             "temperature_2m", "relative_humidity_2m", "evapotranspiration",
#             "soil_temperature_0cm", "soil_temperature_6cm", "soil_temperature_18cm",
#             "precipitation", "precipitation_probability",
#             "soil_moisture_0_to_1cm", "soil_moisture_1_to_3cm",
#             "soil_moisture_3_to_9cm", "soil_moisture_9_to_27cm",
#             "wind_speed_10m"
#         ],
#         "forecast_days": 3,
#         "timezone": "auto"
#     }

#     responses = openmeteo.weather_api(url, params=params)
#     response = responses[0]
#     hourly = response.Hourly()

#     variables = {}
#     for idx, var_name in enumerate(params["hourly"]):
#         variables[var_name] = hourly.Variables(idx).ValuesAsNumpy().tolist()

#     timestamps = pd.date_range(
#         start=pd.to_datetime(hourly.Time(), unit="s", utc=True),
#         end=pd.to_datetime(hourly.TimeEnd(), unit="s", utc=True),
#         freq=pd.Timedelta(seconds=hourly.Interval()),
#         inclusive="left"
#     ).astype(str).tolist()

#     weather_json = {"date": timestamps}
#     weather_json.update(variables)
#     return weather_json


def fetch_weather_from_api(lat, lon, step_hours: int = 3):
    """Fetch weather data from Open-Meteo API, downsample to N hours if needed."""
    cache_session = requests_cache.CachedSession('.cache', expire_after=3600)
    retry_session = retry(cache_session, retries=5, backoff_factor=0.2)
    openmeteo = openmeteo_requests.Client(session=retry_session)

    url = "https://api.open-meteo.com/v1/forecast"
    params = {
        "latitude": lat,
        "longitude": lon,
        "hourly": [
            "temperature_2m", "relative_humidity_2m", "evapotranspiration",
            "soil_temperature_0cm", "soil_temperature_6cm", "soil_temperature_18cm",
            "precipitation", "precipitation_probability",
            "soil_moisture_0_to_1cm", "soil_moisture_1_to_3cm",
            "soil_moisture_3_to_9cm", "soil_moisture_9_to_27cm",
            "wind_speed_10m"
        ],
        "forecast_days": 3,
        "timezone": "auto"
    }

    responses = openmeteo.weather_api(url, params=params)
    response = responses[0]
    hourly = response.Hourly()

    variables = {}
    for idx, var_name in enumerate(params["hourly"]):
        variables[var_name] = hourly.Variables(idx).ValuesAsNumpy().tolist()

    timestamps = pd.date_range(
        start=pd.to_datetime(hourly.Time(), unit="s", utc=True),
        end=pd.to_datetime(hourly.TimeEnd(), unit="s", utc=True),
        freq=pd.Timedelta(seconds=hourly.Interval()),
        inclusive="left"
    ).astype(str).tolist()

    # ---- Downsample here ----
    step = step_hours  # e.g. 3 or 6
    indices = list(range(0, len(timestamps), step))

    weather_json = {"date": [timestamps[i] for i in indices]}
    for k, v in variables.items():
        weather_json[k] = [v[i] for i in indices]

    return weather_json


#---------------------function to initialize weather cache---------------------


def init_weather_cache(city_name: str):
    """Initialize weather cache for given city."""

    lat, lon = get_lat_lon_from_city(city_name)
    data = fetch_weather_from_api(lat, lon)

    CACHE_FILE = f".cache/{city_name.lower()}.json"
    with open(CACHE_FILE, "w") as f:
        json.dump({"city": city_name.lower(), "timestamp": time.time(), "data": data}, f)


#---------------------function to get weather data---------------------


def get_weather(city_name: str):

    """
    Fetches important weather variables from cache or Open-Meteo (if not available in cache) for a given location,
    for the next 3 days (hourly data) — tailored for agricultural needs.

    Parameters
    ----------
    city_name : str
        Name of the Indian city to fetch weather data for.

    Returns
    -------
    dict
        Hourly weather data in JSON format where:

    - temperature_2m (°C): Air temperature at 2 meters above ground — affects crop growth, pest activity, and heat stress.
    - relative_humidity_2m (%): Humidity at 2 meters above ground — influences disease risk (e.g., fungal infections) and crop transpiration.
    - evapotranspiration (mm): Combined water loss from soil evaporation and plant transpiration — key for irrigation scheduling.
    - soil_temperature_0cm (°C): Surface soil temperature — impacts seed germination, evaporation rate, and microbial activity.
    - soil_temperature_6cm (°C): Soil temperature at 6 cm depth — important for root zone conditions of young plants.
    - soil_temperature_18cm (°C): Soil temperature at 18 cm depth — relevant for deeper-rooted crops and moisture retention.
    - precipitation (mm): Rainfall amount — main natural water source for crops.
    - precipitation_probability (%): Probability of rain — helps plan irrigation, harvesting, and pesticide application.
    - soil_moisture_0_to_1cm (m³/m³): Moisture in top 1 cm of soil — critical for germination and seedling survival.
    - soil_moisture_1_to_3cm (m³/m³): Moisture in 1–3 cm soil layer — supports early root development.
    - soil_moisture_3_to_9cm (m³/m³): Moisture in 3–9 cm soil layer — reflects short-term water availability for most crops.
    - soil_moisture_9_to_27cm (m³/m³): Moisture in 9–27 cm soil layer — important for sustained crop water supply and drought resilience.
    - wind_speed_10m (m/s): Wind speed at 10 meters — affects pollination, lodging risk, pesticide drift, and greenhouse ventilation.
    """

    print('USING FULL WEATHER FORECAST')

    #1st check city name in .cache
    if os.path.exists(f".cache/{city_name.lower()}.json"):
        with open(f".cache/{city_name.lower()}.json", "r") as f:
            cache = json.load(f)
        age = time.time() - cache["timestamp"]

        # Use cache if same city and fresh
        if cache["city"].lower() == city_name.lower() and age < 3600:
            print("USING CACHED WEATHER DATA")
            return cache["data"]

    print("FETCHING NEW WEATHER DATA")
    init_weather_cache(city_name)

    with open(f".cache/{city_name.lower()}.json", "r") as f:
        cache = json.load(f)
    return cache["data"]

#---------------------function to get weather data from particular variables---------------------


def query_weather_variables(city_name: str, variable: str):
    """
    Query a specific weather variable for a given city.
    
    Parameters
    ----------
    city_name : str
        Name of the city (case-insensitive).
    variable : str
        Weather variable to fetch.

        Available variables:
        - temperature_2m (°C): Air temperature at 2 meters above ground — affects crop growth, pest activity, and heat stress.
        - relative_humidity_2m (%): Humidity at 2 meters above ground — influences disease risk (e.g., fungal infections) and crop transpiration.
        - evapotranspiration (mm): Combined water loss from soil evaporation and plant transpiration — key for irrigation scheduling.
        - soil_temperature_0cm (°C): Surface soil temperature — impacts seed germination, evaporation rate, and microbial activity.
        - soil_temperature_6cm (°C): Soil temperature at 6 cm depth — important for root zone conditions of young plants.
        - soil_temperature_18cm (°C): Soil temperature at 18 cm depth — relevant for deeper-rooted crops and moisture retention.
        - precipitation (mm): Rainfall amount — main natural water source for crops.
        - precipitation_probability (%): Probability of rain — helps plan irrigation, harvesting, and pesticide application.
        - soil_moisture_0_to_1cm (m³/m³): Moisture in top 1 cm of soil — critical for germination and seedling survival.
        - soil_moisture_1_to_3cm (m³/m³): Moisture in 1–3 cm soil layer — supports early root development.
        - soil_moisture_3_to_9cm (m³/m³): Moisture in 3–9 cm soil layer — reflects short-term water availability for most crops.
        - soil_moisture_9_to_27cm (m³/m³): Moisture in 9–27 cm soil layer — important for sustained crop water supply and drought resilience.
        - wind_speed_10m (m/s): Wind speed at 10 meters — affects pollination, lodging risk, pesticide drift, and greenhouse ventilation.

    Returns
    -------
    dict
        A dictionary with:
        - "date": list of ISO timestamps
        - variable: list of values for the requested variable
    """

    data = get_weather(city_name)  # ensures cache refresh if stale

    print("USING VARIABLE QUERY!")

    if variable not in data:
        raise ValueError(f"Variable '{variable}' not found in weather data.")
    return {
            "date": data["date"],
            variable: data[variable]
        }


# def query_user_weather_data():
#     """
#     Query weather data for the user's location.
#     """
#     print("USING USER WEATHER DATA QUERY!")
#     with open(f".cache/user_weather.json", "r") as f:
#         cache = json.load(f)
#     return cache


# def query_user_weather_variable(variable: str):
#     """
#     Query a specific weather variable for the user's location.
#     """
#     print("USING USER WEATHER VARIABLE QUERY!")
#     with open(f".cache/user_weather.json", "r") as f:
#         cache = json.load(f)
#     if variable not in cache:
#         raise ValueError(f"Variable '{variable}' not found in user weather data.")
#     return {
#         "date": cache["date"],
#         variable: cache[variable]
#     }