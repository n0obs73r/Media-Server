import React, { useState, useEffect, useRef } from "react";
import "./styles.css";
import PlayerControls from "./PlayerControls";
import ListView from "./ListView";


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
    const [sortBy, setSortBy] = useState('title'); // Default sorting column
    const [order, setOrder] = useState('asc'); // Default sorting order
  
  
    
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `http://192.168.1.6:8080/files?limit=${recordsPerPage}&offset=${
            (currentPage - 1) * recordsPerPage
          }&sortBy=${sortBy}&order=${order}`
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
  }, [currentPage, recordsPerPage, sortBy, order]);

  const handleSort = (column) => {
    if (sortBy === column) {
      // Toggle order if already sorting by the same column
      setOrder(order === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setOrder('asc'); // Reset order to ascending when sorting by a new column
    }
  };
  
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
          `http://192.168.1.6:8080/albumart/${encodeURIComponent(filePath)}`
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
      audioRef.current.src = `http://192.168.1.6:8080/audio/${encodeURIComponent(
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
      if (audioRef.current && audioRef.current.duration) {
        setCurrentTime(audioRef.current.currentTime);
        if (audioRef.current.currentTime === audioRef.current.duration) {
          nextAudio();
        }
      }
    };
    
  
    const formatTime = (time) => {
      const minutes = Math.floor(time / 60);
      const seconds = Math.floor(time % 60);
      return `${minutes < 10 ? "0" : ""}${minutes}:${
        seconds < 10 ? "0" : ""
      }${seconds}`;
    };
  
   
  return (
    <div className="container-root">
      <PlayerControls
        files={files}
        currentAudioIndex={currentAudioIndex}
        setCurrentAudioIndex={setCurrentAudioIndex}
        isPlaying={isPlaying}
        setIsPlaying={setIsPlaying}
        audioRef={audioRef}
        isShuffleMode={isShuffleMode}
        setIsShuffleMode={setIsShuffleMode}
        setCurrentTime={setCurrentTime}
        currentTime={currentTime}
        handleSeek={handleSeek}
        formatTime={formatTime}
        prevAudio={prevAudio}
        nextAudio={nextAudio}
        toggleAudio={toggleAudio}
        toggleShuffleMode={toggleShuffleMode}
      />
      {/* <div className="page-info">
        <span className="page-count">{`Page ${currentPage} of ${files.total_pages}`}</span>
      </div> */}
      <ListView
        files={files}
        playFile={playFile}
        currentAudioIndex={currentAudioIndex}
        formatTime={formatTime}
        handleSort={handleSort}
      />
    </div>
  );
}

export default App;
