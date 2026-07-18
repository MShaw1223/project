package main

import (
	"fmt"
	"log"
	"net/http"

	"github.com/miller/project/backend/internal/api"
)

func main() {
	addr := ":8080"
	log.Printf("starting server on %s", addr)

	if err := http.ListenAndServe(addr, api.NewRouter()); err != nil {
		log.Fatalf("server failed: %v", err)
	}

	fmt.Println("server stopped")
}
