import hallsData from "./utils/halls.json";
import "./App.css";
import React, { useEffect, useRef, useState } from "react";
import "./mediaqueries.css";

function App() {
  const [arrInfo, setArrInfo] = useState([{}]);
  const [showResult, setShowResult] = useState(false);
  const [isSuggestionsVisible, setIsSuggestionsVisible] = useState(false);

  const [formData, setFormData] = React.useState({
    start: "",
    end: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    setIsSuggestionsVisible(!!value);
  };

  const handleAutoCompleteChange = (e) => {
    const value = e.value; 
    setFormData({
      ...formData,
      start: value, 
    });
    setIsSuggestionsVisible(false);
  };

  const filteredHalls = hallsData.filter((hall) =>
    hall.name.toLowerCase().includes(formData.start.toLowerCase())
  );

  const descriptionRef = useRef(null);
  useEffect(() => {
    descriptionRef.current.classList.add("animate-description");
  }, []);

  const resultRef = useRef(null);
  const scrollDown = () => {
    resultRef.current.scrollIntoView({ behavior: "smooth" });
  };

  const showResultDiv = () => {
    var dirRequest = {
      startId: "10",
      endId: "12",
    };
    // turn on loading indicator
    fetch("https://us-central1-rocmap.cloudfunctions.net/findDirection", {
      method: "POST",
      body: JSON.stringify(dirRequest),
    }).then(async (res) => {
      // turn off loading indicator
      const processed = await res.json();
      if (!res.ok) {
        alert("Something happened when contacting backend!");
        return;
      }
      setArrInfo(processed.response);
      alert(JSON.stringify(processed.response));
    });
    setShowResult(!showResult);
  };

  return (
    <>
      <div className="background-container">
        <div className="top-container">
          <div className="left-section">GroupName</div>
          <div className="middle-section">DandyHack</div>
          <div className="right-section">Nov 5th 2023</div>
        </div>
        <div className="title">
          <p className="title-text">ROCMAP</p>
          <p ref={descriptionRef} className="sub-title">
            Find the most optimal path in UR campus
          </p>

          <button className="scroll-button" onClick={scrollDown}>
            Explore Now
          </button>
        </div>
      </div>

      <div className="content" ref={resultRef}>
        <p className="form-description"> Please input your desired route: </p>
        <div className="form-container">
          <div className="input-container">
            <input
              type="text"
              placeholder="From"
              onChange={handleChange}
              name="start"
              value={formData.start}
              onFocus={() => setIsSuggestionsVisible(!!formData.start)}
              onBlur={() => setIsSuggestionsVisible(false)}
            />
            {isSuggestionsVisible ? (
              <div class="dropdown">
              <ul className="autocomplete-list">
                <div class="dropdown-content">
                {filteredHalls.length > 0 ? (
                  filteredHalls.map((hall, index) => (
                    <li
                      key={index}
                      onClick={() => handleAutoCompleteChange(hall.name)}
                    >
                      {hall.name}
                    </li>
                  ))
                ) : (
                  <li>Nothing found</li>
                )}
                </div>
              </ul>
              </div>
            ) : null}
            <input
              type="text"
              placeholder="To"
              onChange={handleChange}
              name="end"
              value={formData.end}
            />
          </div>
          <div className="button-container">
            <button className="submit-button" onClick={showResultDiv}>
              Submit
            </button>
          </div>
        </div>
      </div>

      {showResult && (
        <div className="result">
          <div className="image-container">
            {arrInfo.length > 0 ? (
              <img
                src={arrInfo[0].image}
                alt="pic"
                style={{ objectFit: "cover", width: "100%", height: "100%" }}
              />
            ) : (
              <p>No image available</p>
            )}
          </div>

          <div className="pop-up-container">
            <div className="button-container">
              <button className="button-in-container">Prev</button>

              <button className="button-in-container">Next</button>
            </div>
            <div className="details">
              <span className="description-label">Description:</span> write
              something here
            </div>
            <div className="info-title">INFORMATION</div>
            <div className="info-container">
              <div className="info">
                <div className="info-left">
                  <span className="label">Distance</span>
                  <span className="value">{arrInfo[0].dist}</span>
                </div>

                <div className="info-right">
                  <span className="label">ETA</span>
                  <span className="value">1 min</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default App;
