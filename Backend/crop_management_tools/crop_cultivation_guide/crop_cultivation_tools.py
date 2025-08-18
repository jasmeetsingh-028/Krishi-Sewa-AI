import os
import json

# Base directory where this script is located
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
# Absolute path to the JSON data folder
DOCS_PATH = os.path.join(BASE_DIR, "crop_cultivation_json")


def search_filename(crop_name: str) -> str:
    """
    Search for the JSON filename corresponding to a given crop name.

    Args:
        crop_name (str): The name of the crop (case-insensitive).
    
    Returns:
        str: The filename of the crop JSON file if found, otherwise None.

    Notes:
        - Looks inside the `crop_cultivation_json` folder located relative to this script.
        - Assumes filenames follow the convention `<crop_name>.json` (lowercase).
    """
    print("SEARCHING FILE!")
    for fname in os.listdir(DOCS_PATH):
        if fname.startswith(crop_name.lower()) and fname.endswith(".json"):
            return fname
    return None


def get_keys(filename: str) -> list:
    """
    Retrieve all top-level keys from a given crop JSON file.

    Args:
        filename (str): The name of the crop JSON file.
    
    Returns:
        list: A list of keys available in the JSON file.

    Notes:
        - Opens the file from the `crop_cultivation_json` folder.
        - Useful to check what sections (e.g., "Introduction", "Requirements", etc.)
          are available for a crop.
    """
    print("GETTING KEYS!")
    with open(os.path.join(DOCS_PATH, filename), "r", encoding="utf-8") as f:
        data = json.load(f)
        return list(data.keys())


def get_context(filename: str, key: str) -> str:
    """
    Retrieve the content under a specific key from a crop JSON file.

    Args:
        filename (str): The name of the crop JSON file.
        key (str): The section key to fetch content from (e.g., "Soil", "Varieties").
    
    Returns:
        str: The text content under the given key, or "Key not found" if the key does not exist.

    Notes:
        - Opens the file from the `crop_cultivation_json` folder.
        - Supports direct key lookup only (nested structures require extension).
    """
    with open(os.path.join(DOCS_PATH, filename), "r", encoding="utf-8") as f:
        print("GET CONTEXT TOOL UTILIZED!")
        data = json.load(f)
        return data.get(key, "Key not found")
    





# if __name__ == "__main__":
#     crop_name = "ginger"
#     filename = search_filename(crop_name)
#     if filename:
#         keys = get_keys(filename)
#         print("Available keys:", keys)
#         for key in keys:
#             context = get_context(filename, key)
#             print(f"Context for '{key}':", context)
#     else:
#         print("Crop not found.")