import React, { useState, useEffect, useRef } from 'react';
import './styles.css';
import dummyImage from './img/dummy.png'; // Import the dummy image
import { FaPlay, FaPause, FaStepBackward, FaStepForward, FaRandom  } from 'react-icons/fa';



function App() {
  const [files, setFiles] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage] = useState(50);
  const [currentAudioIndex, setCurrentAudioIndex] = useState(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false); // State to track whether audio is playing
  const audioRef = useRef(null);
  const [isShuffleMode, setIsShuffleMode] = useState(false);
  const progressRef = useRef(null);

  const fetchAlbumArt = async (filePath) => {
    try {
      const response = await fetch(`http://192.168.1.7:8080/albumart/${encodeURIComponent(filePath)}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch album art: ${response.status} ${response.statusText}`);
      }
      return URL.createObjectURL(await response.blob()); // Convert the response blob to a URL
    } catch (error) {
      console.error('Error fetching album art:', error);
      throw new Error('Failed to fetch album art');
    }
  };

  useEffect(() => {
    fetch(`http://192.168.1.7:8080/files?limit=${recordsPerPage}&offset=${(currentPage - 1) * recordsPerPage}`)
      .then(response => response.json())
      .then(data => {
        if (currentPage === 1) {
          setFiles(data);
        } else {
          setFiles(prevFiles => ({
            files: [...prevFiles.files, ...data.files],
            total_pages: data.total_pages
          }));
        }
      })
      .catch(error => console.error('Error fetching data:', error));
  }, [currentPage, recordsPerPage]);

  useEffect(() => {
    if (currentAudioIndex !== null && files.files && files.files[currentAudioIndex] && !files.files[currentAudioIndex].album_art) {
      fetchAlbumArt(files.files[currentAudioIndex].file_name)
        .then(albumArtUrl => {
          setFiles(prevFiles => {
            const updatedFiles = [...prevFiles.files];
            updatedFiles[currentAudioIndex].album_art = albumArtUrl;
            return { ...prevFiles, files: updatedFiles };
          });
        })
        .catch(error => console.error('Error fetching album art:', error));
    }
  }, [currentAudioIndex, files]);

  

  const playFile = (index, filePath) => {
    setCurrentAudioIndex(index);
    const outputString = filePath.replace(/\\/g, '').replace(/"/g, '');
    audioRef.current.src = `http://192.168.1.7:8080/audio/${encodeURIComponent(outputString)}`;
    audioRef.current.play().then(() => {
      setIsPlaying(true); // Set isPlaying to true when audio starts playing
    }).catch(error => {
      console.error('Failed to play audio:', error);
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
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(error => {
        console.error('Failed to play audio:', error);
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
      if(audioRef.current.currentTime === audioRef.current.duration)
        nextAudio()
    }
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const nextPage = () => {
    setCurrentPage(currentPage + 1);
  };

  const prevPage = () => {
    setCurrentPage(currentPage - 1);
  };
  

  return (
     <div className="container">
      <div className="file-details">
      <div className="album-art" style={{ float: 'left', marginRight: '10px' }}>
          {files.files && files.files[currentAudioIndex] && files.files[currentAudioIndex].album_art ?
            <img src={files.files[currentAudioIndex].album_art} alt="Album Art" style={{ maxWidth: '50px', height: '50px' }} /> :
            <img src={dummyImage} alt="Dummy Image" style={{ maxWidth: '50px', height: 'auto' }} /> // Render dummy image if no album art
          }
        </div>
        <div className='NowPlaying' style={{ overflow: 'hidden' }}>
          <audio ref={audioRef} onTimeUpdate={handleTimeUpdate}></audio>
          <div className="audio-controls">
            <div className="progress-container" style={{ float: 'left', width: 'calc(100% - 80px)' }}>
            <div className="song-details" style={{ float: 'left', maxWidth: 'calc(100% - 110px)', overflow: 'hidden' }}>
    <div>Title: {files.files && files.files[currentAudioIndex] ? files.files[currentAudioIndex].title.String : 'Unknown'}</div>
    <div>Artist: {files.files && files.files[currentAudioIndex] ? files.files[currentAudioIndex].artist.String : 'Unknown'}</div>
  </div>
              <input
                type="range"
                value={currentTime}
                max={audioRef.current ? audioRef.current.duration : 0}
                onChange={handleSeek}
                ref={progressRef}
                className="progress-bar"
              />
              <div className="progress" style={{ width: `${(currentTime / audioRef?.current?.duration) * 100}%` }}></div>
            </div>
            <span className="time">{formatTime(currentTime)}</span>
            <span> / </span>
            <span className="time">{formatTime(audioRef.current ? audioRef?.current?.duration : 0)}</span>
          </div>
          </div>
          <div className="controls" style={{ float: 'left', marginLeft: '10px' }}>
            <button onClick={prevAudio} disabled={currentAudioIndex === null || currentAudioIndex === 0}><FaStepBackward /></button>
            <button onClick={toggleAudio}>{isPlaying ? <FaPause /> : <FaPlay />}</button>
            <button onClick={toggleShuffleMode}>
          <FaRandom style={{ color: isShuffleMode ? 'green' : 'white' }} />
        </button>            <button onClick={nextAudio} disabled={currentAudioIndex === null || currentAudioIndex === files.files.length - 1}><FaStepForward /></button>
          </div>
      </div>
      <div className="controls">
        <button onClick={prevPage} disabled={currentPage === 1}>Previous</button>
        <button onClick={nextPage}>Next</button>
      </div>
      <div className="page-info">
      <span className="page-count">{`Page ${currentPage}`} of {files.total_pages}</span>
</div>
      <h1>Music Library</h1>
      <div className="file-details" style={{ overflowX: 'auto', maxHeight: 'calc(100vh - 100px)' }}>
        <table>
          <thead>
            <tr>
              <th>Title</th>
              <th>Artist</th>
              <th>Album</th>
              {/* <th>Genre</th> */}
              {/* <th>Year</th> */}
              <th>Duration</th>
            </tr>
          </thead>
          <tbody>
            {files.files && files.files.map((file, index) => (
              <tr key={file.id} onClick={() => playFile(index, file.file_name)}>
                <td>{file.title.String}</td>
                <td>{file.artist.String}</td>
                <td>{file.album.String}</td>
                {/* <td>{JSON.stringify(file.genre.String)}</td> */}
                {/* <td>{JSON.stringify(file.year.String)}</td> */}
                <td>{formatTime(JSON.stringify(file.duration.Float64))}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default App;