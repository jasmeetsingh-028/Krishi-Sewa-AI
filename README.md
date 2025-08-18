# 🌱 Krishi Seva AI  

**Krishi Seva AI** is an **AI-powered assistant for agriculture** that helps farmers and researchers make informed decisions.  
It integrates multiple **agentic workflows** to provide insights on **weather, crop prices, crop management, and agricultural policies**.  

Built with **LangChain, LangGraph, and FastAPI**, this system demonstrates how **AI orchestration** can support the agriculture sector in India.  

---

## 🚀 Features  

- ✅ **Weather Forecasting** – Fetches real-time weather updates and 3-day forecasts using OpenMeteo API.  
- ✅ **Crop Price Insights** – Retrieves daily crop prices from [data.gov.in](https://data.gov.in) with filters for state, district, market, and commodity.  
- ✅ **Crop Management Tools** – Provides insights on crop diseases, irrigation, seed varieties, and more (experimental).  
- ✅ **Agricultural Policy Search** – Uses search integration to fetch the latest government schemes & policies.  
- ✅ **Memory Agent** – Stores user-specific details (location, preferences, reminders) for personalized responses.  
- ✅ **Supervisor Orchestration** – A top-level supervisor routes queries to the right expert agent (weather, price, policy, crop health).  
- ✅ **API-first Design** – Exposes endpoints with FastAPI for integration with apps, dashboards, or chat interfaces.  
