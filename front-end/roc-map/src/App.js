import hallsData from "./utils/halls.json";
import doorsData from "./utils/doors.json";
import doorDescription from "./utils/doorDescription.json";
import React, { useEffect, useRef, useState } from "react";
import "./App.css";
import "./mediaqueries.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationCircle, faPersonRunning, faPersonWalking, faLocationDot, faFlag, faSpinner } from '@fortawesome/free-solid-svg-icons';
import WeatherRating from "./WeatherRating";

const emptyFormData = { start: "", end: "" };

function App() {
  const [arrInfo, setArrInfo] = useState([{}]);
  const [showResult, setShowResult] = useState(false);
  const [isStartVisible, setIsStartVisible] = useState(false);
  const [isEndVisible, setIsEndVisible] = useState(false);
  const [curLoc, setCurLoc] = useState(0);
  const [remDist, setRemDist] = useState([]);
  const [weatherQuality, setWeatherQuality] = useState(0); // Initial value of 3, which represents neutral weather quality
  const [formData, setFormData] = useState(emptyFormData);

  const [startValue, setStartValue] = useState("");
  const [destinationValue, setDestinationValue] = useState("");

  // Inside your component function
  const [filteredHallsFrom, setFilteredHallsFrom] = useState([]);
  const [filteredHallsTo, setFilteredHallsTo] = useState([]);

  const [selectedStartLocation, setSelectedStartLocation] = useState(null);
  const [selectedEndLocation, setSelectedEndLocation] = useState(null);
  const [availableDoors, setAvailableDoors] = useState([]);

  const [startDoorId, setStartDoorId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [headerVisible, setHeaderVisible] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const currentImage = arrInfo[curLoc]?.image;
  // Reset the loading state whenever the step image actually changes
  // (Prev/Next, or a fresh search), not just whenever curLoc happens to
  // change back to the same value.
  useEffect(() => {
    setImageLoaded(false);
  }, [currentImage]);

  // Small persistent nav bar so people don't lose track of where they are
  // once they've scrolled past the hero - fades in past it, click to jump
  // back to the top.
  useEffect(() => {
    const handleScroll = () => {
      setHeaderVisible(window.scrollY > window.innerHeight * 0.9);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

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
    // Typing again invalidates whatever was picked before, so a stale
    // selection can't get submitted alongside newly-typed text.
    setSelectedStartLocation(null);
    setAvailableDoors([]);
    setStartDoorId(null);
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
    setSelectedEndLocation(null);
  };

  const handleAutoCompleteChange = (hall, field) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      [field]: hall.name,
    }));
    setErrorMessage("");

    if (field === "start") {
      setStartValue(hall.name);
      setSelectedStartLocation(hall);
    } else if (field === "end") {
      setDestinationValue(hall.name);
      setSelectedEndLocation(hall);
    }

    setIsStartVisible(false);
    setIsEndVisible(false);

    if (field === "start") {
      const matchingDoors = doorsData.find((door) => door.name === hall.name);
      if (matchingDoors) {
        setAvailableDoors(matchingDoors.doors);
      } else {
        setAvailableDoors([]);
      }
      setStartDoorId(null);
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

  const needsDoorSelection = availableDoors.length > 0;
  const canSubmit =
    !!selectedStartLocation &&
    !!selectedEndLocation &&
    (!needsDoorSelection || !!startDoorId) &&
    !isLoading;

  const showResultDiv = () => {
    if (!canSubmit) {
      return;
    }

    const dirRequest = {
      startDoorId: startDoorId,
      endHallId: selectedEndLocation.id,
      weather: weatherQuality,
    };

    setIsLoading(true);
    setErrorMessage("");

    fetch("/api/findDirection", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dirRequest),
    })
      .then(async (res) => {
        const processed = await res.json();
        if (!res.ok) {
          throw new Error("backend error");
        }

        const path = processed.response.reverse();
        setArrInfo(path);

        let totalDist = 0;
        for (const p of path) {
          totalDist += p.dist * 2;
        }
        const remDistances = [];
        for (const p of path) {
          remDistances.push(totalDist);
          totalDist -= p.dist * 2;
        }
        setRemDist(remDistances);
        setCurLoc(0);
        setShowResult(true);
      })
      .catch(() => {
        setErrorMessage(
          "Couldn't find that route — check your connection and try again."
        );
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const resetSearch = () => {
    setShowResult(false);
    setFormData(emptyFormData);
    setStartValue("");
    setDestinationValue("");
    setSelectedStartLocation(null);
    setSelectedEndLocation(null);
    setAvailableDoors([]);
    setStartDoorId(null);
    setArrInfo([{}]);
    setRemDist([]);
    setCurLoc(0);
    setErrorMessage("");
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
      <header
        className={`site-header ${headerVisible ? "visible" : ""}`}
        onClick={scrollToTop}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter") scrollToTop();
        }}
      >
        <img src="/icon.svg" alt="" className="site-header-icon" />
        <span className="site-header-text">RocMap</span>
      </header>
      <div className="background-container">
        <div className="title">
          <p className="title-text">RocMap</p>
          <p ref={descriptionRef} className="sub-title">
            Find your way around campus!
          </p>

          <button className="scroll-button" onClick={scrollDown}>
            Explore Now
          </button>
        </div>
      </div>
      {
        !showResult &&
        <div className="content" ref={resultRef}>
          <p className="form-description"> Where do you want to go? </p>
          <div className="form-container">
            <div className="input-container">
              <div className="autocomplete-wrapper">
                <input
                  type="text"
                  placeholder="From"
                  onChange={handleStartChange}
                  name="start"
                  value={formData.start}
                />
                {isStartVisible && formData.start ? (
                  <div className="dropdown active">
                    <ul className="autocomplete-list">
                      <div className="dropdown-content">
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
                          <div className="nothing-found">Nothing found</div>
                        )}
                      </div>
                    </ul>
                  </div>
                ) : null}
              </div>

              <div className="doors-dropdown">
                {selectedStartLocation && availableDoors.length > 0 && (
                  <select
                    value={startDoorId ?? ""}
                    onChange={(event) => {
                      setStartDoorId(event.target.value || null);
                    }}
                  >
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

              <div className="autocomplete-wrapper">
                <input
                  type="text"
                  placeholder="To"
                  onChange={handleEndChange}
                  name="end"
                  value={formData.end}
                />
                {isEndVisible && formData.end ? (
                  <div className="dropdown active">
                    <ul className="autocomplete-list">
                      <div className="dropdown-content">
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
                          <div className="nothing-found">Nothing found</div>
                        )}
                      </div>
                    </ul>
                  </div>
                ) : null}
              </div>
            </div>

            <div className="clarify-info">
              <div className="clarify-info-text">
                <b>Start</b>
                <br />
                {startValue ? (
                  <>
                    {startValue}
                    <br />
                    {startDoorId ? (
                      doorDescription.find((desc) => desc.id === startDoorId)?.doorDescription
                    ) : needsDoorSelection ? (
                      <span className="hint-text">Pick a door above</span>
                    ) : null}
                  </>
                ) : (
                  <span className="placeholder-text">Not selected yet</span>
                )}
              </div>
              <div className="clarify-info-text">
                <b>Destination</b> <br />
                {destinationValue || <span className="placeholder-text">Not selected yet</span>}
              </div>
            </div>
          </div>
          <WeatherRating weatherQuality={weatherQuality} setWeatherQuality={setWeatherQuality} />
          {errorMessage && <p className="error-text">{errorMessage}</p>}
          <div className="button-container">
            <button className="submit-button" onClick={showResultDiv} disabled={!canSubmit}>
              {isLoading ? (
                <>
                  <FontAwesomeIcon icon={faSpinner} spin /> Finding route…
                </>
              ) : (
                "Submit"
              )}
            </button>
          </div>
        </div >
      }

      {
        showResult && (
          <div className="result">
            <div className="route-container">
              <div className="route">
                <div className="route-text route-start">

                  <FontAwesomeIcon icon={faLocationDot} /> {startValue}
                </div>
                <div className="route-text route-end">
                  <FontAwesomeIcon icon={faFlag} /> {destinationValue}
                </div>
              </div>
            </div>
            <div className="image-container">
              {!imageLoaded && (
                <div className="image-loading">
                  <FontAwesomeIcon icon={faSpinner} spin />
                </div>
              )}
              <img
                src={currentImage}
                alt="pic"
                className={imageLoaded ? "loaded" : ""}
                onLoad={() => setImageLoaded(true)}
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
              <button className="button-find-another" onClick={resetSearch}>Find another route</button>
            </div>
          </div>
        )
      }

      <footer className="site-footer">
        <a href="https://vietrochack.com" target="_blank" rel="noopener noreferrer">
          &copy; {new Date().getFullYear()} VietRocHack
        </a>
        <span className="site-footer-divider">&middot;</span>
        <a href="https://devpost.com/software/rocmap" target="_blank" rel="noopener noreferrer">
          View on Devpost
        </a>
      </footer>
    </>
  );
}

export default App;
