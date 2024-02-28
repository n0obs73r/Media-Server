package main

import (
	"database/sql"
	"strconv"

	"net/http"

	"github.com/gin-gonic/gin"
	_ "github.com/lib/pq"
)

func listFilesHandler(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		rows, err := db.Query("SELECT * FROM mp3_files")
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		defer rows.Close()

		var files []File
		for rows.Next() {
			var file File
			if err := rows.Scan(&file.ID, &file.FileName, &file.FilePath, &file.Title, &file.Artist, &file.Album, &file.Genre, &file.TrackNumber, &file.Year, &file.Duration); err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
				return
			}
			files = append(files, file)
		}

		c.JSON(http.StatusOK, files)
	}
}

func listFilesByArtistHandler(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		artist := c.Param("artist")

		rows, err := db.Query("SELECT * FROM mp3_files WHERE artist = $1", artist)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		defer rows.Close()

		var files []File
		for rows.Next() {
			var file File
			if err := rows.Scan(&file.ID, &file.FileName, &file.FilePath, &file.Title, &file.Artist, &file.Album, &file.Genre, &file.TrackNumber, &file.Year, &file.Duration); err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
				return
			}
			files = append(files, file)
		}

		c.JSON(http.StatusOK, files)
	}
}

func listFilesByAlbumHandler(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		album := c.Param("album")

		rows, err := db.Query("SELECT * FROM mp3_files WHERE album = $1", album)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		defer rows.Close()

		var files []File
		for rows.Next() {
			var file File
			if err := rows.Scan(&file.ID, &file.FileName, &file.FilePath, &file.Title, &file.Artist, &file.Album, &file.Genre, &file.TrackNumber, &file.Year, &file.Duration); err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
				return
			}
			files = append(files, file)
		}
		c.JSON(http.StatusOK, files)
	}
}
func listFilesByGenreHandler(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		genre := c.Param("genre")

		rows, err := db.Query("SELECT * FROM mp3_files WHERE genre = $1", genre)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		defer rows.Close()
		var files []File
		for rows.Next() {
			var file File
			if err := rows.Scan(&file.ID, &file.FileName, &file.FilePath, &file.Title, &file.Artist, &file.Album, &file.Genre, &file.TrackNumber, &file.Year, &file.Duration); err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
				return
			}
			files = append(files, file)
		}

		c.JSON(http.StatusOK, files)
	}
}

func listFilesByTrackHandler(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		trackStr := c.Param("track")
		track, err := strconv.Atoi(trackStr)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid track number"})
			return
		}

		rows, err := db.Query("SELECT * FROM mp3_files WHERE track_number = $1", track)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		defer rows.Close()

		var files []File
		for rows.Next() {
			var file File
			if err := rows.Scan(&file.ID, &file.FileName, &file.FilePath, &file.Title, &file.Artist, &file.Album, &file.Genre, &file.TrackNumber, &file.Year, &file.Duration); err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
				return
			}
			files = append(files, file)
		}

		c.JSON(http.StatusOK, files)
	}
}

func listFilesByYearHandler(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		yearStr := c.Param("year")
		year, err := strconv.Atoi(yearStr)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid year"})
			return
		}

		rows, err := db.Query("SELECT * FROM mp3_files WHERE year = $1", year)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		defer rows.Close()

		var files []File
		for rows.Next() {
			var file File
			if err := rows.Scan(&file.ID, &file.FileName, &file.FilePath, &file.Title, &file.Artist, &file.Album, &file.Genre, &file.TrackNumber, &file.Year, &file.Duration); err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
				return
			}
			files = append(files, file)
		}

		c.JSON(http.StatusOK, files)
	}
}
