import os
import requests

def get_crop_price_tool(
    state: str,
    commodity: str = None,
    district: str = None,
    market: str = None,
    variety: str = None,
    grade: str = None,
    limit: int = 10
) -> str:

    """
    Fetches crop price data from the Indian government API based on location and crop details.
    Works if just the state is provided.
    1. If only state is provided, it fetches all crop prices for that state.
    2. If commodity, district, market, variety, or grade are provided, it filters the results accordingly.

    Args:
    Required:
        state: The state in which to search for crop prices. (Required)
        

    Optional:
        district:  Specific district to filter data. (Optional)
        market:  Market name to filter prices. (Optional)
        variety:  Crop variety if applicable. (Optional)
        grade:  Grade of the commodity. (Optional)
        limit:  Number of results to return. Default is 10. (Optional)
        commodity: The name of the crop. (Optional)

    Returns:
        A JSON string with the crop price data.
    """

    print('CROP PRICE TOOL CALLED!')
    api_key = os.getenv("COMMODITY_API_KEY")
    url = "https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070"
    params = {
        "api-key": "579b464db66ec23bdd0000017407ced8140e46127d4945826103670f",
        "format": "json",
        "limit": limit,
        "filters[state.keyword]": state,
    }
    if commodity:
        params["filters[commodity]"] = commodity
    if district:
        params["filters[district]"] = district
    if market:
        params["filters[market]"] = market
    if variety:
        params["filters[variety]"] = variety
    if grade:
        params["filters[grade]"] = grade

    response = requests.get(url, params=params)

    if response.status_code == 200:
        return response.text  # You can change this to `response.json()` if LLM can handle dicts
    else:
        return f"Error fetching data: {response.status_code} - {response.text}"
    

# if __name__ == "__main__":
#     print(get_crop_price_tool("Madhya Pradesh"))