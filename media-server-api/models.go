package main

import (
	"database/sql"
)

type File struct {
	ID          int     `json:"id"`
	FileName    string  `json:"file_name"`
	FilePath    string  `json:"file_path"`
	Title       sql.NullString `json:"title"`
    Artist      sql.NullString `json:"artist"`
    Album       sql.NullString `json:"album"`
    Genre       sql.NullString `json:"genre"`
    TrackNumber sql.NullInt64  `json:"track_number"`
    Year        sql.NullString `json:"year"`
    Duration    sql.NullFloat64 `json:"duration"`
}
