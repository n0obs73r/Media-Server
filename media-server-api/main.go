package main

import (
	"database/sql"
	"log"

	"github.com/gin-gonic/gin"
	_ "github.com/lib/pq"
)

func main() {
	r := gin.Default()

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

	// Define API endpoints
	r.GET("/files", listFilesHandler(db))
	r.GET("/files/artist/:artist", listFilesByArtistHandler(db))
	r.GET("/files/album/:album", listFilesByAlbumHandler(db))
	r.GET("/files/genre/:genre", listFilesByGenreHandler(db))
	r.GET("/files/track/:track", listFilesByTrackHandler(db))
	r.GET("/files/year/:year", listFilesByYearHandler(db))

	// Playlist endpoints
	// r.POST("/playlist", createPlaylistHandler(db))
	// r.DELETE("/playlist/:id", deletePlaylistHandler(db))

	// Run the server
	log.Println("Server is running on http://localhost:8080")
	if err := r.Run(":8080"); err != nil {
		log.Fatalf("Failed to run server: %v", err)
	}
}
