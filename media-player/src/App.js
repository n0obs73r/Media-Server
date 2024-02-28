import React, { useState, useEffect, useRef } from "react";
import "./styles.css";
import dummyImage from "./img/dummy.png";
import {
  FaPlay,
  FaPause,
  FaStepBackward,
  FaStepForward,
  FaRandom,
} from "react-icons/fa";

function App() {
  const [files, setFiles] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage] = useState(30);
  const [currentAudioIndex, setCurrentAudioIndex] = useState(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);
  const [isShuffleMode, setIsShuffleMode] = useState(false);
  const progressRef = useRef(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `http://192.168.1.7:8080/files?limit=${recordsPerPage}&offset=${
            (currentPage - 1) * recordsPerPage
          }`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }
        const data = await response.json();
        if (currentPage === 1) {
          setFiles(data);
        } else {
          setFiles((prevFiles) => ({
            files: [...prevFiles.files, ...data.files],
            total_pages: data.total_pages,
          }));
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentPage, recordsPerPage]);

  useEffect(() => {
    if (
      currentAudioIndex !== null &&
      files.files &&
      files.files[currentAudioIndex] &&
      !files.files[currentAudioIndex].album_art
    ) {
      fetchAlbumArt(files.files[currentAudioIndex].file_name)
        .then((albumArtUrl) => {
          setFiles((prevFiles) => {
            const updatedFiles = [...prevFiles.files];
            updatedFiles[currentAudioIndex].album_art = albumArtUrl;
            return { ...prevFiles, files: updatedFiles };
          });
        })
        .catch((error) => console.error("Error fetching album art:", error));
    }
  }, [currentAudioIndex, files]);

  useEffect(() => {
    const handleScroll = () => {
      const fileDetailsDiv = document.querySelector(".file-details");
      if (!fileDetailsDiv) return; // Ensure the file details div exists

      const divHeight = fileDetailsDiv.clientHeight; // Height of the visible area
      const scrollTop = fileDetailsDiv.scrollTop; // Scroll position from the top
      const scrollHeight = fileDetailsDiv.scrollHeight; // Total scrollable height

      const scrollBottom = scrollHeight - (scrollTop + divHeight);

      if (scrollBottom < 50 && !loading && currentPage < files.total_pages) {
        setCurrentPage((prevPage) => prevPage + 1);
      }
    };

    const fileDetailsDiv = document.querySelector(".file-details");
    if (fileDetailsDiv) {
      fileDetailsDiv.addEventListener("scroll", handleScroll);
    }

    return () => {
      if (fileDetailsDiv) {
        fileDetailsDiv.removeEventListener("scroll", handleScroll);
      }
    };
  }, [currentPage, files, loading]);

  const fetchAlbumArt = async (filePath) => {
    try {
      const response = await fetch(
        `http://192.168.1.7:8080/albumart/${encodeURIComponent(filePath)}`
      );
      if (!response.ok) {
        throw new Error(
          `Failed to fetch album art: ${response.status} ${response.statusText}`
        );
      }
      return URL.createObjectURL(await response.blob());
    } catch (error) {
      console.error("Error fetching album art:", error);
      throw new Error("Failed to fetch album art");
    }
  };

  const playFile = (index, filePath) => {
    setCurrentAudioIndex(index);
    const outputString = filePath.replace(/\\/g, "").replace(/"/g, "");
    audioRef.current.src = `http://192.168.1.7:8080/audio/${encodeURIComponent(
      outputString
    )}`;
    audioRef.current
      .play()
      .then(() => {
        setIsPlaying(true);
      })
      .catch((error) => {
        console.error("Failed to play audio:", error);
      });
  };

  const toggleShuffleMode = () => {
    setIsShuffleMode(!isShuffleMode);
  };

  const toggleAudio = () => {
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current
        .play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch((error) => {
          console.error("Failed to play audio:", error);
        });
    }
  };

  const nextAudio = () => {
    let nextIndex;
    if (isShuffleMode) {
      nextIndex = Math.floor(Math.random() * (files.files?.length || 0));
    } else {
      nextIndex = currentAudioIndex !== null ? currentAudioIndex + 1 : 0;
      if (nextIndex >= (files.files?.length || 0)) {
        setCurrentPage(currentPage + 1);
        nextIndex = 0;
      }
    }
    const nextFile = files.files[nextIndex];
    if (nextFile && nextFile.file_name) {
      playFile(nextIndex, nextFile.file_name);
    } else {
      console.error("Invalid file data:", nextFile);
    }
  };

  const prevAudio = () => {
    if (currentAudioIndex !== null && currentAudioIndex > 0) {
      const prevIndex = currentAudioIndex - 1;
      playFile(prevIndex, files.files[prevIndex].file_name);
    }
  };

  const handleSeek = (e) => {
    const seekTime = parseFloat(e.target.value);
    audioRef.current.currentTime = seekTime;
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      if (audioRef.current.currentTime === audioRef.current.duration)
        nextAudio();
    }
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes < 10 ? "0" : ""}${minutes}:${
      seconds < 10 ? "0" : ""
    }${seconds}`;
  };

  const nextPage = () => {
    if (!loading && currentPage < files.total_pages) {
      setCurrentPage((prevPage) => prevPage + 1);
    }
  };

  const prevPage = () => {
    if (!loading && currentPage > 1) {
      setCurrentPage((prevPage) => prevPage - 1);
    }
  };

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
              style={{ maxWidth: "50px", height: "50px" }}
            />
          ) : (
            <img
              src={dummyImage}
              alt="Dummy Image"
              style={{ maxWidth: "50px", height: "auto" }}
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
                  float: "left",
                  maxWidth: "calc(100% - 110px)",
                  overflow: "hidden",
                }}
              >
                <div>
                  Title:{" "}
                  {files.files && files.files[currentAudioIndex]
                    ? files.files[currentAudioIndex].title?.String || "Unknown"
                    : "Unknown"}
                </div>
                <div>
                  Artist:{" "}
                  {files.files && files.files[currentAudioIndex]
                    ? files.files[currentAudioIndex].artist?.String || "Unknown"
                    : "Unknown"}
                </div>
              </div>
              <div classname="time">
                <span className="time">{formatTime(currentTime)}</span>
                <span className="time">/</span>
                <span className="time">
                  {formatTime(
                    audioRef.current ? audioRef?.current?.duration : 0
                  )}
                </span>
              </div>
              <input
                type="range"
                value={currentTime}
                max={audioRef.current ? audioRef.current.duration : 0}
                onChange={handleSeek}
                ref={progressRef}
                className="progress-bar"
              />
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
          <button onClick={toggleAudio}>
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
      <div className="controls">
        <button onClick={prevPage} disabled={currentPage === 1 || loading}>
          Previous
        </button>
        <button
          onClick={nextPage}
          disabled={currentPage === files.total_pages || loading}
        >
          Next
        </button>
      </div>
      <div className="page-info">
        <span className="page-count">{`Page ${currentPage} of ${files.total_pages}`}</span>
      </div>
      <h1>Music Library</h1>
      <div className="file-details">
        <table>
          <thead>
            <tr>
              <th>Title</th>
              <th>Artist</th>
              <th>Album</th>
              <th>Duration</th>
            </tr>
          </thead>
          <tbody>
          {files.files &&
              files.files.map((file, index) => (
                <tr
                  key={file.id}
                  onClick={() => playFile(index, file.file_name)}
                  className={currentAudioIndex === index ? "playing-song" : ""}
                >
                  <td>{file.title?.String || "Unknown"}</td>
                  <td>{file.artist?.String || "Unknown"}</td>
                  <td>{file.album?.String || "Unknown"}</td>
                  <td>{formatTime(file.duration?.Float64 || 0)}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default App;
