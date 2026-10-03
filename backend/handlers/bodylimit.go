package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

// LimitRequestBody caps request bodies at maxBytes, so a client can't make the server buffer an
// arbitrarily large JSON body. A declared Content-Length over the cap is refused up front with 413; a
// body without one (chunked) fails once reading passes the cap, which binding reports as a bad request.
func LimitRequestBody(maxBytes int64) gin.HandlerFunc {
	return func(c *gin.Context) {
		if c.Request.ContentLength > maxBytes {
			c.AbortWithStatusJSON(http.StatusRequestEntityTooLarge, gin.H{"error": "request body too large"})
			return
		}
		if c.Request.Body != nil {
			c.Request.Body = http.MaxBytesReader(c.Writer, c.Request.Body, maxBytes)
		}
		c.Next()
	}
}
