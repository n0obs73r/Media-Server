package main

import (
	"database/sql"
	"fmt"
	"strconv"

	"net/http"

	"github.com/gin-gonic/gin"
	_ "github.com/lib/pq"
)

func listFilesHandler(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Extracting limit, offset, sortBy, and order from query string
		limitStr := c.DefaultQuery("limit", "100")
		offsetStr := c.DefaultQuery("offset", "0")
		sortBy := c.Query("sortBy")
		order := c.DefaultQuery("order", "asc")

		// Convert limit and offset to integers
		limit, err := strconv.Atoi(limitStr)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid limit"})
			return
		}
		offset, err := strconv.Atoi(offsetStr)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid offset"})
			return
		}

		// Validate sortBy parameter
		validSortColumns := map[string]bool{
			"title":  true,
			"year":   true,
			"artist": true,
			// Add more columns as needed
		}
		if sortBy == "" {
			sortBy = "title"
		}
		if !validSortColumns[sortBy] {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid sortBy parameter"})
			return
		}

		// Get total count of files
		var totalFiles int
		err = db.QueryRow("SELECT COUNT(*) FROM mp3_files").Scan(&totalFiles)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		// Calculate total pages
		totalPages := totalFiles / limit
		if totalFiles%limit != 0 {
			totalPages++
		}

		// Prepare SQL query with limit, offset, sortBy, and order
		query := fmt.Sprintf("SELECT * FROM mp3_files ORDER BY %s %s LIMIT $1 OFFSET $2", sortBy, order)
		rows, err := db.Query(query, limit, offset)
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

		c.JSON(http.StatusOK, gin.H{
			"files":       files,
			"total_pages": totalPages,
		})
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
