import React, { useState, useEffect } from "react";
import SearchBar from "./components/SearchBar/SearchBar";
import WeatherCard from "./components/WeatherCard/WeatherCard";
import AiInsights from "./components/AiInsights/AiInsights";
import styles from "./App.module.css";

const API_KEY = import.meta.env.VITE_WEATHER_API_KEY;

function App() {
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]); // Array state for the 5-day dataset
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchWeather = async (searchParam) => {
    setLoading(true);
    setError("");

    let currentUrl = `https://api.openweathermap.org/data/2.5/weather?units=metric&appid=${API_KEY}`;
    let forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?units=metric&appid=${API_KEY}`;

    if (typeof searchParam === "object" && searchParam.lat && searchParam.lon) {
      const coordParams = `&lat=${searchParam.lat}&lon=${searchParam.lon}`;
      currentUrl += coordParams;
      forecastUrl += coordParams;
    } else {
      const cityParam = `&q=${searchParam}`;
      currentUrl += cityParam;
      forecastUrl += cityParam;
    }

    try {
      // Fetch both current weather and forecast data in parallel
      const [currentRes, forecastRes] = await Promise.all([
        fetch(currentUrl),
        fetch(forecastUrl),
      ]);

      if (!currentRes.ok || !forecastRes.ok) {
        throw new Error("Location data unresolved. Please verify spelling.");
      }

      const currentData = await currentRes.json();
      const forecastData = await forecastRes.json();

      // Filter forecastData down to exactly 1 snapshot per day (the API gives data every 3 hours)
      // We grab the snapshot closest to midday (12:00:00) for consistency
      const dailySnapshots = forecastData.list.filter((item) =>
        item.dt_txt.includes("12:00:00"),
      );

      setWeather(currentData);
      setForecast(dailySnapshots);
    } catch (err) {
      setError(err.message);
      setWeather(null);
      setForecast([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const getUserLocationWeather = () => {
      // Start loading
      setLoading(true);
      setError("");

      if (!navigator.geolocation) {
        setError("Geolocation is not supported by your browser.");
        fetchWeather("New Delhi"); // better default for India
        return;
      }

      navigator.geolocation.getCurrentPosition(
        // ✅ Success
        (position) => {
          const { latitude, longitude } = position.coords;
          fetchWeather({
            lat: latitude,
            lon: longitude,
          });
        },

        // ❌ Error
        (error) => {
          console.log("Location error:", error.message);

          // User-friendly messages
          switch (error.code) {
            case error.PERMISSION_DENIED:
              setError("Location permission denied. Showing default city.");
              break;
            case error.POSITION_UNAVAILABLE:
              setError("Location unavailable. Showing default city.");
              break;
            case error.TIMEOUT:
              setError("Location request timed out. Showing default city.");
              break;
            default:
              setError("Something went wrong. Showing default city.");
          }

          // Fallback city
          fetchWeather("New Delhi");
        },

        // ⚙️ Options (🔥 pro)
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0,
        },
      );
    };

    getUserLocationWeather();
  }, []);

  const weatherCondition = weather?.weather?.[0]?.main || "Clear";

  return (
    <div className={styles.appWrapper} data-theme={weatherCondition}>
      <div className={styles.blurOverlay}></div>
      <main className={styles.dashboardContainer}>
        <header className={styles.header}>
          <h1 className={styles.title}>
            SkySense <span className={styles.aiTag}>AI</span>
          </h1>
          <SearchBar onSearch={fetchWeather} />
        </header>

        {loading && (
          <div className={styles.loader}>
            Accessing atmospheric telemetry...
          </div>
        )}
        {error && <div className={styles.errorCard}>{error}</div>}

        {weather && !loading && (
          <div className={styles.grid}>
            {/* Pass the forecast array down into the main WeatherCard matrix */}
            <WeatherCard data={weather} forecastData={forecast} />
            <AiInsights
              weatherCondition={weatherCondition}
              temp={weather?.main?.temp}
            />
          </div>
        )}

        <footer className={styles.footer}>
          <p className={styles.copyright}>
            &copy; {new Date().getFullYear()} Abinash Shubham. All rights
            reserved.
          </p>
        </footer>
      </main>
    </div>
  );
}

export default App;
