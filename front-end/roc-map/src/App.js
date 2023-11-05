import hallsData from "./utils/halls.json";
import doorsData from "./utils/doors.json";
import doorDescription from "./utils/doorDescription.json";
import React, { useEffect, useRef, useState } from "react";
import "./App.css";
import "./mediaqueries.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationCircle, faPersonRunning, faPersonWalking } from '@fortawesome/free-solid-svg-icons';
import WeatherRating from "./WeatherRating";

function App() {
  const [arrInfo, setArrInfo] = useState([{}]);
  const [showResult, setShowResult] = useState(false);
  const [isStartVisible, setIsStartVisible] = useState(false);
  const [isEndVisible, setIsEndVisible] = useState(false);
  const [curLoc, setCurLoc] = useState(0);
  const [remDist, setRemDist] = useState([]);
  const [weatherQuality, setWeatherQuality] = useState(0); // Initial value of 3, which represents neutral weather quality
  const [formData, setFormData] = React.useState({
    start: "",
    end: "",
  });

  const [startValue, setStartValue] = useState("");
  const [destinationValue, setDestinationValue] = useState("");


  // Inside your component function
  const [filteredHallsFrom, setFilteredHallsFrom] = useState([]);
  const [filteredHallsTo, setFilteredHallsTo] = useState([]);

  const [selectedStartLocation, setSelectedStartLocation] = useState(null);
  const [selectedEndLocation, setSelectedEndLocation] = useState(null);
  const [availableDoors, setAvailableDoors] = useState([]);

  const [startDoorId, setStartDoorId] = useState(null);


  const handleStartChange = (e) => {
    const { value } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      start: value,
    }));
    setIsStartVisible(!!value);
    setFilteredHallsFrom(
      hallsData.filter((hall) =>
        hall.name.toLowerCase().includes(value.toLowerCase())
      )
    );
  };

  const handleEndChange = (e) => {
    const { value } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      end: value,
    }));
    setIsEndVisible(!!value);
    setFilteredHallsTo(
      hallsData.filter((hall) =>
        hall.name.toLowerCase().includes(value.toLowerCase())
      )
    );
  };

  const handleAutoCompleteChange = (hall, field) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      [field]: hall.name,
    }));

    if (field === "start") {
      setStartValue(hall.name);
      setSelectedStartLocation(hall);
    } else if (field === "end") {
      setDestinationValue(hall.name);
      setSelectedEndLocation(hall);
    }

    setIsStartVisible(false);
    setIsEndVisible(false);

    const matchingDoors = doorsData.find((door) => door.name === hall.name);
    if (matchingDoors) {
      setAvailableDoors(matchingDoors.doors);
    } else {
      setAvailableDoors([]);
    }
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
    var dirRequest = {
      startDoorId: "10",
      endHallId: "4",
      weather: weatherQuality,
    };
    setCurLoc(0);
    setRemDist([]);
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
            <div class="autocomplete-wrapper">
              <input
                type="text"
                placeholder="From"
                onChange={handleStartChange}
                name="start"
                value={formData.start}
              />
              {isStartVisible && formData.start ? (
                <div class="dropdown active">
                  <ul className="autocomplete-list">
                    <div class="dropdown-content">
                      {filteredHallsFrom.length > 0 ? (
                        filteredHallsFrom.map((hall, index) => (
                          <div
                            key={index}
                            onClick={() =>
                              handleAutoCompleteChange(hall, "start")
                            }
                          >
                            {hall.name}
                          </div>
                        ))
                      ) : (
                        <div>Nothing found</div>
                      )}
                    </div>
                  </ul>
                </div>
              ) : null}
            </div>

            <div className="doors-dropdown">
              {selectedStartLocation && availableDoors.length > 0 && (
                <select onChange={(event) => {
                  console.log(event.target.value);
                  setStartDoorId(event.target.value);
                }}>
                  <option value={null}>Select a door</option>
                  {availableDoors.map((door, index) => {
                    const matchingDescription = doorDescription.find((desc) => desc.id === door);

                    return (
                      <option key={index} value={door}>
                        {matchingDescription.doorDescription}
                      </option>
                    )
                  })}
                </select>
              )}
            </div>

            <div class="autocomplete-wrapper">
              <input
                type="text"
                placeholder="To"
                onChange={handleEndChange}
                name="end"
                value={formData.end}
              />
              {isEndVisible && formData.end ? (
                <div class="dropdown active">
                  <ul className="autocomplete-list">
                    <div class="dropdown-content">
                      {filteredHallsTo.length > 0 ? (
                        filteredHallsTo.map((hall, index) => (
                          <div
                            key={index}
                            onClick={() =>
                              handleAutoCompleteChange(hall, "end")
                            }
                          >
                            {hall.name}
                          </div>
                        ))
                      ) : (
                        <div>Nothing found</div>
                      )}
                    </div>
                  </ul>
                </div>
              ) : null}
            </div>

            <div className="doors-dropdown">
              {selectedEndLocation && availableDoors.length > 0 && (
                <select>
                  <option value="">Select a door</option>
                  {availableDoors.map((door, index) => {
                    const matchingDescription = doorDescription.find((desc) => desc.id === door);

                    return (
                      <option key={index} value={door}>
                        {matchingDescription.doorDescription}
                      </option>
                    )
                  })}
                </select>
              )}
            </div>

          </div>


          <div className="clarify-info">
            <div>Start: {startValue} - {startDoorId && doorDescription.find((desc) => desc.id === startDoorId).doorDescription} </div>
            <div>Destination: {destinationValue}</div>
          </div></div>
        <WeatherRating weatherQuality={weatherQuality} setWeatherQuality={setWeatherQuality} />
        <div className="button-container">
          <button className="submit-button" onClick={showResultDiv}>
            Submit
          </button>
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
            <div className="info-text"><FontAwesomeIcon icon={faExclamationCircle} /> You can scroll the image for more info</div>
            <div className="button-container">
              {
                curLoc === 0 ?
                  <div className="status-text starting">Start</div>
                  :
                  <button className="button-in-container" onClick={() => changeLoc(false)}>Prev</button>
              }
              {
                curLoc === arrInfo.length - 1 ?
                  <div className="status-text arrived">You are here!</div>
                  :
                  <button className="button-in-container" onClick={() => changeLoc(true)}>Next</button>
              }
            </div>
            <div className="details">
              {arrInfo[curLoc].textDescription ?? ""}
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
            <button className="button-find-another" onClick={() => setShowResult(false)}>Find another route</button>
          </div>
        </div>
      )}
    </>
  );
}

export default App;
