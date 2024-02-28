package main

import (
	"database/sql"
	"fmt"
	"log"
	"net/http"
	"os"
	"strings"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	_ "github.com/lib/pq"
)

func main() {
	r := gin.Default()
	config := cors.DefaultConfig()
	config.AllowOrigins = []string{"*"}                                       // Allow requests from all origins
	config.AllowMethods = []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"} // Allow all HTTP methods
	config.AllowHeaders = []string{"Origin", "Content-Type"}                  // Allow specific headers
	r.Use(cors.New(config))                                                   // Apply CORS middleware with custom configuration

	db, err := sql.Open("postgres", "postgresql://anay:anay@localhost/mp3_database?sslmode=disable")
	if err != nil {
		log.Fatalf("Error connecting to database: %v", err)
	}
	defer db.Close()

	err = db.Ping()
	if err != nil {
		log.Fatalf("Error pinging database: %v", err)
	}
	log.Println("Connected to database")

	r.GET("/files", listFilesHandler(db))
	r.GET("/files/artist/:artist", listFilesByArtistHandler(db))
	r.GET("/files/album/:album", listFilesByAlbumHandler(db))
	r.GET("/files/genre/:genre", listFilesByGenreHandler(db))
	r.GET("/files/track/:track", listFilesByTrackHandler(db))
	r.GET("/files/year/:year", listFilesByYearHandler(db))
	r.GET("/audio/*path", func(c *gin.Context) {
		path := c.Param("path")
		// Convert backslashes to forward slashes and encode the path
		audioPath3 := strings.ReplaceAll(path, "%20", " ")
		audioPath2 := strings.ReplaceAll(audioPath3, "\\", " ")
		audioPath := strings.ReplaceAll(audioPath2, "\\\\", " ")

		audioPath = fmt.Sprintf("D:/Music/MP3/%s", audioPath) // Adjust the base path as per your file structure
		_, err := os.Stat(audioPath)
		if os.IsNotExist(err) {
			c.String(http.StatusNotFound, "Audio file not found")
			return
		}

		// Serve the audio file using http.ServeFile
		c.File(audioPath)
	})

	// Playlist endpoints
	// r.POST("/playlist", createPlaylistHandler(db))
	// r.DELETE("/playlist/:id", deletePlaylistHandler(db))

	log.Println("Server is running on http://localhost:8080")
	if err := r.Run(":8080"); err != nil {
		log.Fatalf("Failed to run server: %v", err)
	}

}