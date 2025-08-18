"use client";

import React, { useState, useEffect, useCallback } from "react";

export interface Crop {
  id: string; 
  name: string;
  price: number;
  mandiName: string; 
}

function CropForm({ onAddCrop }: { onAddCrop: (crop: Crop) => void }) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [mandiName, setMandiName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !price || !mandiName.trim()) {
      alert("Please enter crop name, price, and Mandi name.");
      return;
    }
    const newCrop: Crop = {
      id: Date.now().toString(),
      name: name.trim(),
      price: parseFloat(price),
      mandiName: mandiName.trim(),
    };
    onAddCrop(newCrop);
    setName("");
    setPrice("");
    setMandiName("");
  };

  return (
    <div className="p-4 border rounded-lg shadow-md bg-white dark:bg-gray-800">
      <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Add New Crop</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="cropName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Crop Name
          </label>
          <input
            type="text"
            id="cropName"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Wheat"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            required
          />
        </div>
        <div>
          <label htmlFor="cropPrice" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Price (per unit)
          </label>
          <input
            type="number"
            id="cropPrice"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="e.g., 250"
            step="0.01"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            required
          />
        </div>
        <div>
          <label htmlFor="mandiName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Mandi Name
          </label>
          <input
            type="text"
            id="mandiName"
            value={mandiName}
            onChange={(e) => setMandiName(e.target.value)}
            placeholder="e.g., Delhi Azadpur Mandi"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
        >
          Add Crop
        </button>
      </form>
    </div>
  );
}


function CropList({ crops, onDeleteCrop }: { crops: Crop[]; onDeleteCrop: (id: string) => void }) {
  const [weatherData, setWeatherData] = useState<any>(null);
  const [loadingWeather, setLoadingWeather] = useState(false);
  const [weatherError, setWeatherError] = useState<string | null>(null);
  const [weatherLocation, setWeatherLocation] = useState("");

  const getLatLonFromLocation = useCallback(async (locationName: string) => {
    const geocodingUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(locationName)}&count=1&language=en&format=json`;
    try {
      const response = await fetch(geocodingUrl);
      if (!response.ok) {
        throw new Error(`Geocoding API HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (data.results && data.results.length > 0) {
        return {
          latitude: data.results[0].latitude,
          longitude: data.results[0].longitude,
          resolvedName: data.results[0].name 
        };
      }
      return null;
    } catch (error) {
      console.error("Error fetching coordinates:", error);
      throw new Error(`Could not find coordinates for "${locationName}". Please try a more specific city name.`);
    }
  }, []);

  // Function to fetch weather data from Open-Meteo API
  const fetchWeatherDetails = useCallback(async () => {
    if (!weatherLocation.trim()) {
      setWeatherError("Please enter a state or city name.");
      return;
    }

    setLoadingWeather(true);
    setWeatherError(null);
    setWeatherData(null);

    try {
      const locationCoords = await getLatLonFromLocation(weatherLocation.trim());

      if (!locationCoords) {
        throw new Error(`Location "${weatherLocation}" not found. Please try a more specific city name.`);
      }

      const weatherApiUrl = `https://api.open-meteo.com/v1/forecast?latitude=${locationCoords.latitude}&longitude=${locationCoords.longitude}&hourly=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m&forecast_days=1&timezone=auto&current_weather=true`;

      const response = await fetch(weatherApiUrl);

      if (!response.ok) {
        throw new Error(`Weather API HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setWeatherData({
        current_weather: data.current_weather,
        resolvedLocation: locationCoords.resolvedName || weatherLocation 
      });
    } catch (error: any) {
      console.error("Error fetching weather data:", error);
      setWeatherError(`Failed to fetch weather data: ${error.message}`);
    } finally {
      setLoadingWeather(false);
    }
  }, [weatherLocation, getLatLonFromLocation]); 

  useEffect(() => {
    fetchWeatherDetails();
  }, [fetchWeatherDetails]);  

  return (
    <div className="p-4 border rounded-lg shadow-md bg-white dark:bg-gray-800">
      <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Crop Inventory</h2>

      <div className="mb-6 p-4 border rounded-lg bg-gray-50 dark:bg-gray-700">
        <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Live Weather Conditions</h3>
        <div className="flex items-center space-x-2 mb-4">
          <input
            type="text"
            value={weatherLocation}
            onChange={(e) => setWeatherLocation(e.target.value)}
            placeholder="Enter State or City for weather"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
          <button
            onClick={fetchWeatherDetails}
            disabled={loadingWeather}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loadingWeather ? "Fetching..." : "Fetch Weather"}
          </button>
        </div>
        {weatherError && (
          <p className="mt-2 text-red-500 text-sm">{weatherError}</p>
        )}
        {weatherData && weatherData.current_weather && (
          <div className="mt-4 text-gray-800 dark:text-gray-200">
            <p className="font-semibold">Weather for {weatherData.resolvedLocation || weatherLocation}:</p>
            <p>Temperature: {weatherData.current_weather.temperature}°C</p>
            <p>Wind Speed: {weatherData.current_weather.windspeed} m/s</p>
            <p>Wind Direction: {weatherData.current_weather.winddirection}°</p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            </p>
          </div>
        )}
      </div>

      {crops.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400">No crops added yet.</p>
      ) : (
        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
          {crops.map((crop) => (
            <li key={crop.id} className="py-4 flex justify-between items-center">
              <div>
                <p className="text-lg font-medium text-gray-900 dark:text-white">{crop.name}</p>
                <p className="text-gray-600 dark:text-gray-400">
                  Price: ₹{crop.price.toFixed(2)} | Mandi: {crop.mandiName}
                </p>
                <p className="text-sm text-blue-500 dark:text-blue-400 mt-1">
                  
                </p>
              </div>
              <button
                onClick={() => onDeleteCrop(crop.id)}
                className="px-3 py-1 rounded-md bg-red-600 text-white hover:bg-red-700"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}


export default function App() { 
  const [crops, setCrops] = useState<Crop[]>([]);

  const handleAddCrop = (newCrop: Crop) => setCrops((prev) => [...prev, newCrop]);
  const handleDeleteCrop = (id: string) => setCrops((prev) => prev.filter((crop) => crop.id !== id));

  return (
    <div
      className="min-h-screen p-6"
      style={{
        background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%)'
      }}
    >
      <h1 className="text-3xl font-bold text-center mb-8 text-white">Crop Management Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        { }
        <CropForm onAddCrop={handleAddCrop} />
        <CropList crops={crops} onDeleteCrop={handleDeleteCrop} />
      </div>
    </div>
  );
}
