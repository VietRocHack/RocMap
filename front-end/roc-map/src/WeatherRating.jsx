import React from "react";
import './WeatherRating.css';

const WeatherRating = ({weatherQuality, setWeatherQuality}) => {


  const handleRatingChange = (event) => {
    const newValue = parseInt(event.target.value);
    setWeatherQuality(newValue);
  };

  return (
    <div className="weather-quality">
      <h2 className="weather-quality-text">How is the Weather Today?</h2>
      <div className="radio-group">
        <div className="radio-group-buttons">
        <label className="radio-button">
          <input
            type="radio"
            name="weatherRating"
            value="0"
            checked={weatherQuality === 0}
            onChange={handleRatingChange}
          />
          <span className="weather-quality-radio-group-button-text">Nice and warm</span>
        </label>
        <label className="radio-button">
          <input
            type="radio"
            name="weatherRating"
            value="1"
            checked={weatherQuality === 1}
            onChange={handleRatingChange}
          />
          <span className="weather-quality-radio-group-button-text">Hot outside</span>
        </label>
        <label className="radio-button">
          <input
            type="radio"
            name="weatherRating"
            value="2"
            checked={weatherQuality === 2}
            onChange={handleRatingChange}
          />
          <span className="weather-quality-radio-group-button-text">A bit chilly</span>
        </label>
        <label className="radio-button">
          <input
            type="radio"
            name="weatherRating"
            value="3"
            checked={weatherQuality === 3}
            onChange={handleRatingChange}
          />
          <span className="weather-quality-radio-group-button-text">Pouring</span>
        </label>
        <label className="radio-button">
          <input
            type="radio"
            name="weatherRating"
            value="4"
            checked={weatherQuality === 4}
            onChange={handleRatingChange}
          />
          <span className="weather-quality-radio-group-button-text">Freezing</span>
        </label>

        </div>
      </div>
    </div>
  );
};

export default WeatherRating;
