import React, { useState, useEffect } from 'react';
import styles from './WeatherCard.module.css';

const PEXELS_KEY = import.meta.env.VITE_PEXELS_API_KEY;

const WEATHER_SEARCH_MAP = {
  Clear: "sunny clear sky day",
  Clouds: "overcast cloudy dark sky",
  Rain: "rain drops on window street rainy day",
  Drizzle: "light rain wet city street",
  Snow: "snowfall winter landscape heavy snow",
  Thunderstorm: "lightning storm dark clouds thunderstorm",
  Mist: "foggy misty morning landscape",
  Haze: "foggy hazy city atmosphere",
  Smoke: "smoky hazy atmosphere sky"
};

function WeatherCard({ data, forecastData }) {
  const { name, main, weather, wind, sys, timezone, dt, rain, snow } = data;
  const condition = weather[0].main;

  const [cityImg, setCityImg] = useState('');
  const [weatherImg, setWeatherImg] = useState('');

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const cityRes = await fetch(
          `https://api.pexels.com/v1/search?query=${name} city landmark skyline&per_page=1`,
          { headers: { Authorization: PEXELS_KEY } }
        );
        const cityData = await cityRes.json();
        if (cityData.photos && cityData.photos.length > 0) {
          setCityImg(cityData.photos[0].src.large);
        } else {
          setCityImg("https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?q=80&w=600");
        }

        const searchQuery = WEATHER_SEARCH_MAP[condition] || "atmosphere weather sky";
        const weatherRes = await fetch(
          `https://api.pexels.com/v1/search?query=${searchQuery}&per_page=1`,
          { headers: { Authorization: PEXELS_KEY } }
        );
        const weatherData = await weatherRes.json();
        if (weatherData.photos && weatherData.photos.length > 0) {
          setWeatherImg(weatherData.photos[0].src.medium);
        } else {
          setWeatherImg("https://images.unsplash.com/photo-1534274988757-a28bf1a57c17?q=80&w=400");
        }
      } catch (error) {
        console.error("Image engine request error:", error);
      }
    };

    if (PEXELS_KEY) fetchImages();
  }, [name, condition]);

  const getFullCountryName = (code) => {
    try {
      return new Intl.DisplayNames(['en'], { type: 'region' }).of(code);
    } catch { return code; }
  };

  const getTargetDateTime = () => {
    const currentUtcMillis = Date.now(); 
    const hostOffsetMillis = new Date().getTimezoneOffset() * 60000;
    const targetOffsetMillis = timezone * 1000;
    const trueTargetDate = new Date(currentUtcMillis + hostOffsetMillis + targetOffsetMillis);

    return {
      time: trueTargetDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }),
      date: trueTargetDate.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })
    };
  };

  const localDateTime = getTargetDateTime();
  const rainVolume = rain && (rain['1h'] || rain['3h']);
  const snowVolume = snow && (snow['1h'] || snow['3h']);
  const precipitationValue = rainVolume || snowVolume || 0;

  // SVG CHART CONFIGURATION MATHEMATICS
  // Safely map temperatures out to SVG vector pixel points
  const paddingX = 40;
  const chartWidth = 440;
  const chartHeight = 60;
  
  const points = forecastData.map((item, idx) => {
    const x = paddingX + (idx * ((chartWidth - (paddingX * 2)) / (forecastData.length - 1 || 1)));
    // Inverse temperature coordinate so higher temperatures rise up higher visually on the screen
    const y = chartHeight - 15 - (item.main.temp * 0.8); 
    return { x, y, temp: Math.round(item.main.temp), day: new Date(item.dt * 1000).toLocaleDateString([], { weekday: 'short' }) };
  });

  const polylinePointsString = points.map(p => `${p.x},${p.y}`).join(' ');

  return (
    <div className={styles.weatherCardGrid}>
      <section className={styles.locationCard} style={{ backgroundImage: cityImg ? `url(${cityImg})` : 'none' }}>
        <div className={styles.cardOverlay}></div>
        <div className={styles.cardContent}>
          <div className={styles.topRow}>
            <div className={styles.dateTimeBadge}>
              <span className={styles.dateTag}>{localDateTime.date}</span>
              <span className={styles.timeTag}>{localDateTime.time}</span>
            </div>
          </div>
          <div className={styles.bottomRow}>
            <h2 className={styles.cityName}>{name}</h2>
            <span className={styles.countryName}>{getFullCountryName(sys.country)}</span>
            <span className={styles.statusDescription}>{weather[0].description}</span>
          </div>
        </div>
      </section>

      <section className={styles.conditionCard} style={{ backgroundImage: weatherImg ? `url(${weatherImg})` : 'none' }}>
        <div className={styles.cardOverlay}></div>
        <div className={styles.conditionContent}>
          <span className={styles.bigDegree}>{Math.round(main.temp)}°C</span>
        </div>
      </section>

      <div className={styles.metricBlock}>
        <span className={styles.metricLabel}>Precipitation</span>
        <span className={styles.metricValue}>{precipitationValue} mm/h</span>
      </div>
      <div className={styles.metricBlock}>
        <span className={styles.metricLabel}>Feels-like</span>
        <span className={styles.metricValue}>{Math.round(main.feels_like)}°C</span>
      </div>
      <div className={styles.metricBlock}>
        <span className={styles.metricLabel}>Humidity</span>
        <span className={styles.metricValue}>{main.humidity}%</span>
      </div>
      <div className={styles.metricBlock}>
        <span className={styles.metricLabel}>Wind speed</span>
        <span className={styles.metricValue}>{wind.speed} m/s</span>
      </div>

      {/* --- ADDED GLASSMORPHIC FORECAST CHART PANEL --- */}
      {forecastData.length > 0 && (
        <div className={styles.forecastChartBlock}>
          <span className={styles.metricLabel}>5-Day Climate Outlook</span>
          <div className={styles.canvasContainer}>
            <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className={styles.svgCanvas}>
              {/* The Running Trend Line */}
              <polyline fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="2.5" points={polylinePointsString} />
              
              {/* Dynamic Coordinate Points & Labels */}
              {points.map((pt, idx) => (
                <g key={idx}>
                  <circle cx={pt.x} cy={pt.y} r="4" fill="#ffeaa7" />
                  <text x={pt.x} y={pt.y - 10} textAnchor="middle" className={styles.chartTempText}>{pt.temp}°</text>
                  <text x={pt.x} y={chartHeight - 2} textAnchor="middle" className={styles.chartDayText}>{pt.day}</text>
                </g>
              ))}
            </svg>
          </div>
        </div>
      )}
    </div>
  );
}

export default WeatherCard;