import React from "react";
import "./styles.css";

function ListView({ files, playFile, currentAudioIndex, formatTime }) {
  return (
    <div className="container">
        <h1>Music Library</h1>
      <div className="file-details">
        <table className="list-table">
          <thead>
            <tr>
              <th>Title</th>
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
                  <td>
                    <div>{file.title?.String || "Unknown"}</div>
                    <div style={{ fontSize: "smaller", color: "#666" }}>
                      {file.artist?.String || "Unknown"}
                    </div>
                  </td>
                  {/* <td>{file.album?.String || "Unknown"}</td> */}
                  <td>{formatTime(file.duration?.Float64 || 0)}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ListView;
