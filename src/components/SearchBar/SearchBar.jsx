import React, { useState, useEffect, useRef } from 'react';
import styles from './SearchBar.module.css';

const API_KEY = import.meta.env.VITE_WEATHER_API_KEY;

function SearchBar({ onSearch }) {
  const [input, setInput] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // DEBOUNCE EFFECT: Listens to input typing shifts, rate-limiting API traffic
  useEffect(() => {
    if (input.trim().length < 3) {
      setSuggestions([]);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      try {
        // Query OpenWeather Geocoding direct endpoint to return up to 5 matching global sites
        const response = await fetch(
          `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(input)}&limit=5&appid=${API_KEY}`
        );
        if (response.ok) {
          const data = await response.json();
          setSuggestions(data);
        }
      } catch (err) {
        console.error("Geocoding auto-suggestion engine failure:", err);
      }
    }, 500); // Wait 500ms after the user stops typing before making the API request

    return () => clearTimeout(delayDebounceFn);
  }, [input]);

  // Close the suggestion box instantly if user clicks anywhere outside the input panel area
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim()) {
      onSearch(input.trim());
      setShowDropdown(false);
    }
  };

  const handleSelectSuggestion = (cityItem) => {
    // Fire search coordinates or clean string straight to the master container fetcher
    onSearch({ lat: cityItem.lat, lon: cityItem.lon });
    setInput(`${cityItem.name}, ${cityItem.country}`);
    setShowDropdown(false);
  };

  return (
    <div className={styles.searchWrapper} ref={dropdownRef}>
      <form onSubmit={handleSubmit} className={styles.searchForm}>
        <div className={styles.inputWrapper}>
          <svg className={styles.searchIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search location..."
            value={input}
            onFocus={() => setShowDropdown(true)}
            onChange={(e) => setInput(e.target.value)}
            className={styles.searchInput}
          />
        </div>
        <button type="submit" className={styles.searchButton}>Search</button>
      </form>

      {/* --- TRANSLUCENT DROPDOWN OVERLAY LIST --- */}
      {showDropdown && suggestions.length > 0 && (
        <ul className={styles.dropdownList}>
          {suggestions.map((item, index) => (
            <li 
              key={index} 
              onClick={() => handleSelectSuggestion(item)}
              className={styles.dropdownItem}
            >
              <span className={styles.cityNameText}>{item.name}</span>
              <span className={styles.regionText}>
                {item.state ? `${item.state}, ` : ''}{item.country}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default SearchBar;