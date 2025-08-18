from collections import defaultdict

crop_calendar_india_data = {
    "castor seed": {
        "planting": [7], 
        "sowing": [7], 
        "growth": [8, 9, 10], 
        "arrival": [11, 12, 1]
    },
    "mustard seed": {
        "planting": [10], 
        "sowing": [10], 
        "growth": [11, 12, 1], 
        "arrival": [2, 3]
    },
    "soybean": {
        "planting": [6], 
        "sowing": [6], 
        "growth": [7, 8, 9], 
        "arrival": [10, 11]
    },
    "cotton": {
        "planting": [5], 
        "sowing": [5], 
        "growth": [6, 7, 8, 9], 
        "arrival": [10, 11, 12]
    },
    "guar": {
        "planting": [7], 
        "sowing": [7], 
        "growth": [8, 9], 
        "arrival": [10]
    },
    "barley": {
        "planting": [10], 
        "sowing": [10], 
        "growth": [11, 12, 1], 
        "arrival": [2, 3]
    },
    "maize": {
        "planting": [6], 
        "sowing": [6], 
        "growth": [7, 8, 9], 
        "arrival": [10]
    },
    "wheat": {
        "planting": [11], 
        "sowing": [11], 
        "growth": [12, 1, 2], 
        "arrival": [3, 4]
    },
    "chana": {
        "planting": [10], 
        "sowing": [10], 
        "growth": [11, 12, 1], 
        "arrival": [2, 3]
    },
    "bajra": {
        "planting": [6], 
        "sowing": [6], 
        "growth": [7, 8], 
        "arrival": [9]
    },
    "paddy kharif": {
        "planting": [6], 
        "sowing": [6], 
        "growth": [7, 8, 9], 
        "arrival": [10, 11]
    },
    "paddy rabi": {
        "planting": [11], 
        "sowing": [11], 
        "growth": [12, 1, 2], 
        "arrival": [3, 4]
    },
    "moong": {
        "planting": [6], 
        "sowing": [6], 
        "growth": [7, 8], 
        "arrival": [9]
    },
    "sugar": {
        "planting": [2], 
        "sowing": [2], 
        "growth": [3, 4, 5, 6, 7, 8, 9], 
        "arrival": [10, 11, 12, 1]
    },
    "coriander": {
        "planting": [10], 
        "sowing": [10], 
        "growth": [11, 12, 1], 
        "arrival": [2, 3]
    },
    "jeera": {
        "planting": [11], 
        "sowing": [11], 
        "growth": [12, 1, 2], 
        "arrival": [3, 4]
    },
    "turmeric": {
        "planting": [4], 
        "sowing": [4], 
        "growth": [5, 6, 7, 8, 9], 
        "arrival": [10, 11, 12, 1, 2, 3]
    },
    "chilli": {
        "planting": [8], 
        "sowing": [8], 
        "growth": [9, 10, 11], 
        "arrival": [12, 1, 2]
    }
}

month_names = {
    1: "January", 2: "February", 3: "March", 4: "April", 5: "May", 6: "June",
    7: "July", 8: "August", 9: "September", 10: "October", 11: "November", 12: "December"
}


def get_crop_calendar(crop_name: str):
    """
    Returns the crop calendar {planting, sowing, growth, arrival} information for the given crop in India.
    Provides readable month names.
    Includes error handling if crop is not found or has missing stage data.
    """
    print("CROP CALENDAR TOOL CALLED!")
    if not crop_name or not isinstance(crop_name, str):
        return {"error": "Invalid input. Please provide a crop name as a string."}

    crop = crop_calendar_india_data.get(crop_name.lower())
    if not crop:
        return {"error": f"Crop '{crop_name}' not found in the India crop calendar."}

    result = {}
    for stage, months in crop.items():
        if not months:
            result[stage] = "No information available"
        else:
            try:
                result[stage] = [month_names[m] for m in months]
            except KeyError as e:
                result[stage] = f"Invalid month index {e.args[0]} in data."

    return result


def get_crops_by_month(month: int):
    """
    Returns a dictionary of crops categorized by stage (planting, sowing, growth, arrival)
    for a given month in India.
    Input: month (1–12)
    Output: {stage: [crops]}
    """
    print("REVERSE CROP CALENDAR TOOL CALLED!")
    
    if not isinstance(month, int) or month not in range(1, 13):
        return {"error": "Invalid input. Please provide a month number between 1 and 12."}
    
    stages_by_month = defaultdict(list)

    for crop, stages in crop_calendar_india_data.items():
        for stage, months in stages.items():
            if month in months:
                stages_by_month[stage].append(crop)
    
    # Convert defaultdict to normal dict, replace empty with "No crops"
    result = {}
    for stage in ["planting", "sowing", "growth", "arrival"]:
        result[stage] = stages_by_month.get(stage, []) or ["No crops"]
    
    return {
        "month": month_names[month],
        "crops": result
    }



# if __name__ == "__main__":
#     #example_output = get_crop_calendar("wheat")
#     reverse_output = get_crops_by_month(3)
#     #print(example_output)
#     print(reverse_output)

# def get_crop_calendar(crop_name):
#     """
#     Returns the crop calendar for the given crop in India.
#     """
#     crop = crop_calendar_india.get(crop_name.lower())
#     if not crop:
#         return f"Crop '{crop_name}' not found in the India crop calendar."
    
#     return {
#         stage: [month_names[m] for m in months]
#         for stage, months in crop.items()
#     }

# # Example usage
# if __name__ == "__main__":
#     example_output = get_crop_calendar("wheat")
#     print(example_output)