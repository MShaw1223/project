package main

import (
	"context"
	"errors"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/miller/project/backend/server"
)

func main() {
	addr := ":8080"
	log.Printf("starting server on %s", addr)
	router, err := server.NewRouter(server.ConfigFromEnv())
	if err != nil {
		log.Fatal(err)
	}

	// Kubernetes sends SIGTERM on every rollout, so stop accepting connections and let in-flight
	// requests finish instead of dropping them
	srv := &http.Server{Addr: addr, Handler: router.Handler(), ReadHeaderTimeout: 10 * time.Second}
	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer stop()
	go func() {
		if err := srv.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
			log.Fatalf("server failed: %v", err)
		}
	}()
	<-ctx.Done()

	shutdownCtx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	if err := srv.Shutdown(shutdownCtx); err != nil {
		log.Printf("shutdown: %v", err)
	}

	fmt.Println("server stopped")
}
