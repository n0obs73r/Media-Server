import React, { useState, useEffect, useRef } from "react";
import dummyImage from "./img/dummy.png";
import "./styles.css";
import {
  FaPlay,
  FaPause,
  FaStepBackward,
  FaStepForward,
  FaRandom,
} from "react-icons/fa";

function PlayerControls({
  files,
  currentAudioIndex,
  isPlaying,
  setIsPlaying,
  audioRef,
  isShuffleMode,
  setIsShuffleMode,
  setCurrentTime,
  currentTime,
  handleSeek,
  formatTime,
  prevAudio,
  nextAudio,
  toggleAudio,
  toggleShuffleMode,
}) {
  
  const progressRef = useRef(null);
  const marqueeRef = useRef(null);
  const [isPaused, setIsPaused] = useState(false);
  const [scrollStart, setScrollStart] = useState(null);

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      if (audioRef.current.currentTime === audioRef.current.duration)
        nextAudio();
    }
  };
  
  const titleRef = useRef(null);

  useEffect(() => {
    const element = titleRef.current;
    if (element && isElementOverflowing(element)) {
      wrapContentsInMarquee(element);
    }
  }, [files, currentAudioIndex]);

  function isElementOverflowing(element) {
    return element.offsetWidth < element.scrollWidth || element.offsetHeight < element.scrollHeight;
  }
  function wrapContentsInMarquee(element) {
    const contents = element.innerText;
    element.innerHTML = ""; // Clear the element
  
    const marquee = document.createElement("marquee");
    marquee.setAttribute("direction", "left");
    marquee.setAttribute("behavior", "scroll");
    marquee.style.width = "100%";
    marquee.style.display = "inline-block";
    marquee.innerText = contents;
  
    element.appendChild(marquee);
  
    let scrollPosition = 100;
    let intervalId;
  
    function scrollWithInterval() {
      intervalId = setInterval(() => {
        scrollPosition += 0.1; marquee.scrollLeft = scrollPosition;
        if (scrollPosition >= marquee.scrollWidth - marquee.clientWidth) {
          scrollPosition = 0;
          clearInterval(intervalId);
        }
      }, 2000); 
    }
  
    scrollWithInterval(); 
  }
  
  

  return (
    <div className="container">
      <div className="file-details-old">
        <div
          className="album-art"
          style={{ float: "left", marginRight: "10px" }}
        >
          {files.files &&
          files.files[currentAudioIndex] &&
          files.files[currentAudioIndex].album_art ? (
            <img
              src={files.files[currentAudioIndex].album_art}
              alt="Album Art"
              // style={{ maxWidth: "80px", height: "80px" }}
            />
          ) : (
            <img
              src={dummyImage}
              alt="Dummy Image"
              // style={{ maxWidth: "80px", height: "80px" }}
            />
          )}
        </div>
        <div className="NowPlaying" style={{ overflow: "hidden" }}>
          <audio ref={audioRef} onTimeUpdate={handleTimeUpdate}></audio>
          <div className="audio-controls">
            <div
              className="progress-container"
              style={{ float: "left", width: "calc(100% - 80px)" }}
            >
              <div
                className="song-details"
                style={{
                  display: "flex",
                  justifyContent: "start",
                  alignContent: "start",
                }}
              >
                <div
  style={{
    width: "100%",
    whiteSpace: "nowrap",
  }}
>
  {/* <div className="static-text">Title: </div> */}
  <div className="static-text" ref={titleRef}>
      {files.files && files.files[currentAudioIndex]
        ? files.files[currentAudioIndex].title?.String || "Unknown"
        : "Unknown"}
    </div>
    </div>

                <div
                  style={{
                    width: "100%",
                  }}
                >
                  {/* <div className="static-text">Artist: </div> */}
                  <div style={{ width: "100%", fontSize: "12px", color: "#6b6b6b" }}>
                  {files.files && files.files[currentAudioIndex]
                    ? files.files[currentAudioIndex].artist?.String || "Unknown"
                    : "Unknown"}
                </div>
                </div>
              </div>

              <input
                type="range"
                value={currentTime}
                max={
                  audioRef.current
                    ? isNaN(audioRef.current.duration)
                      ? 0
                      : audioRef.current.duration
                    : 0
                }
                onChange={handleSeek}
                ref={progressRef}
                className="progress-bar"
              />
              <div className="time">
                <span className="time">{formatTime(currentTime)}</span>
                <span className="time">/</span>
                <span className="time">
                  {formatTime(
                    audioRef.current ? audioRef?.current?.duration : 0
                  )}
                </span>
              </div>
              <div
                className="progress"
                style={{
                  width: `${
                    (currentTime / audioRef?.current?.duration) * 100
                  }%`,
                }}
              ></div>
            </div>
          </div>
        </div>
        <div
          className="controls2"
          style={{ float: "left", marginLeft: "10px" }}
        >
          <button
            onClick={prevAudio}
            disabled={currentAudioIndex === null || currentAudioIndex === 0}
          >
            <FaStepBackward />
          </button>
          <button className="play-button" onClick={toggleAudio}>
            {isPlaying ? <FaPause /> : <FaPlay />}
          </button>
          <button onClick={toggleShuffleMode}>
            <FaRandom style={{ color: isShuffleMode ? "green" : "white" }} />
          </button>
          <button
            onClick={nextAudio}
            disabled={
              currentAudioIndex === null ||
              currentAudioIndex === files.files.length - 1
            }
          >
            <FaStepForward />
          </button>
        </div>
      </div>
    </div>
  );
}

export default PlayerControls;
