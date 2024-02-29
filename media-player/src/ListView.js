import React from "react";
import "./styles.css";


function ListView({ files, playFile, currentAudioIndex, formatTime, handleSort, sortBy, order   }) {
  const getYear = (dateString) => {
    if (!dateString) return "Unknown"; // Return "Unknown" if dateString is not provided
    return dateString.String ? parseInt(dateString.String.substr(0, 4)) : "Unknown"; // Extract year from dateString
  };

  const renderSortArrow = (column) => {
    if (column === sortBy) {
      const arrow = order === 'asc' ? '↑' : '↓';
      return `${column === 'title' ? 'Title' : 'Year'} ${arrow}`;
    }
    return null; // Return null if column is not currently sorted
  };
  

  return (
    <div className="container">
        <h1>Music Library</h1>
      <div className="file-details">
        <table className="list-table">
            <thead>
              <th onClick={() => handleSort('title')}>
  Title {sortBy === 'title' && renderSortArrow('title')}
</th>
<th onClick={() => handleSort('year')}>
  Year {sortBy === 'year' && renderSortArrow('year')}
</th>

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
                  <td>
                  
                  <div>
                  <div>
                  {getYear(file.year)}
                    </div>
                    <div  style={{ fontSize: "smaller", color: "#666" }}>{formatTime(file.duration?.Float64 || 0)}</div>
                  </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
function getYear(dateString) {
  
  console.log(dateString.String)
  if (!dateString) return 0; // Return 0 if dateString is not provided
  dateString = JSON.stringify(dateString.String)
  const yearPattern = /(\d{4})/; // Regular expression to match 4-digit year
  const match = yearPattern.exec(dateString); // Try to match the pattern in the dateString
  return match ? parseInt(match[1]) : "Unknown"; // Extract year from match or return 0 if no match
}
export default ListView;
