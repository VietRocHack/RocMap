import hallsData from "./utils/halls.json";
import "./App.css";
import React, { useEffect, useRef, useState } from "react";
import "./mediaqueries.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPersonRunning, faPersonWalking } from '@fortawesome/free-solid-svg-icons';

function App() {
  const [arrInfo, setArrInfo] = useState([{}]);
  const [showResult, setShowResult] = useState(false);
  const [isSuggestionsVisible, setIsSuggestionsVisible] = useState(false);
  const [curLoc, setCurLoc] = useState(0);
  const [remDist, setRemDist] = useState([]);

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
      startDoorId: "10",
      endHallId: "4",
      weather: 3,
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
      const path = processed.response;
      setArrInfo(processed.response.reverse());

      let totalDist = 0;
      for (const p of path) {
        totalDist += p.dist * 2;
      }
      let remDist = [];
      for (const p of path) {
        remDist.push(totalDist);
        totalDist -= p.dist * 2;
      }

      setRemDist(remDist);

    });
    setShowResult(!showResult);
  };

  const changeLoc = (increase) => {
    if (increase) {
      setCurLoc(old => Math.min(old + 1, arrInfo.length - 1));
    } else {
      setCurLoc(old => Math.max(old - 1, 0));
    }
  }

  const getETA = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = time - minutes * 60;
    let res = "";
    if (minutes > 0) {
      res += minutes + "m ";
    }
    if (seconds > 0) {
      res += seconds + "s";
    }
    return res;
  }

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
            <img
              src={arrInfo[curLoc].image}
              alt="pic"
            />
          </div>

          <div className="pop-up-container">
            <div className="button-container">
              <button className="button-in-container" onClick={() => changeLoc(false)}>Prev</button>

              <button className="button-in-container" onClick={() => changeLoc(true)}>Next</button>
            </div>
            <div className="details">
              <span className="description-label">Description:</span> {arrInfo[curLoc].textDescription ?? ""}
            </div>
            <div className="info-title">INFORMATION</div>
            <div className="info-container">
              <div className="info">
                <div className="info-left">
                  <span className="label">Distance</span>
                  <span className="value">{remDist[curLoc]} m</span>
                </div>

                <div className="info-right">
                  <span className="label">ETA (<FontAwesomeIcon icon={faPersonWalking} />)</span>
                  <span className="value">{getETA(Math.ceil(remDist[curLoc] / 1.25))}</span>
                </div>

                <div className="info-right">
                  <span className="label">ETA (<FontAwesomeIcon icon={faPersonRunning} />)</span>
                  <span className="value">{getETA(Math.ceil(remDist[curLoc] / 2.25))}</span>
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
