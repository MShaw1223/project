package main

import (
	"fmt"
	"log"

	"github.com/gin-gonic/gin"
	"github.com/miller/project/backend/handlers"
	"github.com/miller/project/backend/repositories"
	"github.com/miller/project/backend/services"
)

func main() {
	addr := ":8080"
	log.Printf("starting server on %s", addr)
	router := gin.Default()
	baseProvider := &repositories.SupabaseProvider{}
	
	healthHandler := &handlers.HealthHandler{}
	router.GET("/health", healthHandler.Handle)

	authRepository := &repositories.AuthRepository{Provider: baseProvider}
	authService := &services.AuthService{Repo: authRepository}
	authHandler := &handlers.AuthHandler{Service: authService}
	router.POST("/auth/login", authHandler.CreateSession)
	router.GET("/auth/user", authHandler.GetUser)

	
	accountsRepository := &repositories.AccountsRepository{Provider: baseProvider}
	accountsService := &services.AccountsService{Repo: accountsRepository}
	accountsHandler := &handlers.AccountsHandler{Service: accountsService}
	router.GET("/accounts", accountsHandler.GetUserAccounts)


	if err := router.Run(addr); err != nil {
		log.Fatalf("server failed: %v", err)
	}

	fmt.Println("server stopped")
}
