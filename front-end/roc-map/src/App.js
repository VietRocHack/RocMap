import "./App.css";
import React, { useEffect, useRef, useState } from "react";

function App() {
  const [formData, setFormData] = React.useState({
    start: "",
    end: "",
  });

  const [showResult, setShowResult] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const descriptionRef = useRef(null);
  useEffect(() => {
    descriptionRef.current.classList.add("animate-description");
  }, []);

  const resultRef = useRef(null);
  const scrollDown = () => {
    resultRef.current.scrollIntoView({ behavior: "smooth" });
  };

  const showResultDiv = () => {
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
            />
            <input
              type="text"
              placeholder="To"
              onChange={handleChange}
              name="end"
              value={formData.end}
            />
          </div>
          <div className="button-container">
            <button className="submit-button scroll-button" onClick={showResultDiv}>
              Submit
            </button>
          </div>
        </div>
      </div>

      {showResult && (
        <div className="result">
          <div className="info-container">
            <div className="info">
              <div className="info-left">
                <span className="label">Distance</span>
                <span className="value">100 km</span>
              </div>

              <div className="info-right  info-box">
                <span className="label">Time approximately</span>
                <span className="value">2 hours</span>
              </div>
            </div>
          </div>

          <div className="image-container">Image goes here</div>

          <div className="button-container">
            <button>Prev</button>

            <button>Next</button>
          </div>
        </div>
      )}
    </>
  );
}

export default App;
