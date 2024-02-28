import React, { useState, useEffect, useRef } from 'react';
import './styles.css';

function App() {
  const [files, setFiles] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage] = useState(50);
  const [currentAudioIndex, setCurrentAudioIndex] = useState(null);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef(null);
  const progressRef = useRef(null);

  useEffect(() => {
    fetch(`http://192.168.1.5:8080/files?limit=${recordsPerPage}&offset=${(currentPage - 1) * recordsPerPage}`)
      .then(response => response.json())
      .then(data => setFiles(data))
      .catch(error => console.error('Error fetching data:', error));
  }, [currentPage, recordsPerPage]);

  const playFile = (index, filePath) => {
    setCurrentAudioIndex(index);
    const outputString = filePath.replace(/\\/g, '').replace(/"/g, '');
    audioRef.current.src = `http://192.168.1.5:8080/audio/${encodeURIComponent(outputString)}`;
    audioRef.current.play().catch(error => {
      console.error('Failed to play audio:', error);
    });
  };

  const pauseAudio = () => {
    audioRef.current.pause();
  };

  const playAudio = () => {
    audioRef.current.play().catch(error => {
      console.error('Failed to play audio:', error);
    });
  };

  const nextAudio = () => {
    if (currentAudioIndex !== null && currentAudioIndex < files.files.length - 1) {
      const nextIndex = currentAudioIndex + 1;
      playFile(nextIndex, files.files[nextIndex].file_name);
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
      <div className='NowPlaying'>
      <audio ref={audioRef} onTimeUpdate={handleTimeUpdate}></audio>
      <div className="audio-controls">
        <div className="progress-container">
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
      <div className="controls">
        <button onClick={prevPage} disabled={currentPage === 1}>Previous</button>
        <button onClick={prevAudio} disabled={currentAudioIndex === null || currentAudioIndex === 0}>Previous Audio</button>
        <button onClick={pauseAudio}>Pause</button>
        <button onClick={playAudio}>Play</button>
        <button onClick={nextAudio} disabled={currentAudioIndex === null || currentAudioIndex === files.files.length - 1}>Next Audio</button>
        <button onClick={nextPage}>Next</button>
        <span>{`Page ${currentPage}`}</span>
        <span>Total Pages: {files.total_pages}</span>
      </div>
      <h1>File Details</h1>
      <div className="file-details">
        <table>
          <thead>
            <tr>
              <th>Title</th>
              <th>Artist</th>
              <th>Album</th>
              <th>Genre</th>
              <th>Track Number</th>
              <th>Year</th>
              <th>Duration</th>
              <th>File Path</th>
            </tr>
          </thead>
          <tbody>
            {files.files && files.files.map((file, index) => (
              <tr key={file.id} onClick={() => playFile(index, file.file_name)}>
                <td>{JSON.stringify(file.title.String)}</td>
                <td>{JSON.stringify(file.artist.String)}</td>
                <td>{JSON.stringify(file.album.String)}</td>
                <td>{JSON.stringify(file.genre.String)}</td>
                <td>{JSON.stringify(file.track_number.Int64)}</td>
                <td>{JSON.stringify(file.year.String)}</td>
                <td>{JSON.stringify(file.duration.Float64)}</td>
                <td>{JSON.stringify(file.file_path)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default App;
