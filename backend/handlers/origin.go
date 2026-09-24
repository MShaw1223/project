package handlers

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
)

// RequireSameOrigin blocks cross-site requests that change state (POST, PUT, PATCH, DELETE), a CSRF
// defence on top of the SameSite=Lax cookies that also covers login CSRF, where no cookie is needed.
// A request is refused when the browser marks it Sec-Fetch-Site: cross-site, or its Origin isn't one
// of allowed. Requests without an Origin (curl, server-to-server) pass: browsers always send Origin on
// cross-origin POSTs, so a missing one can't be a forged browser request.
func RequireSameOrigin(allowed []string) gin.HandlerFunc {
	origins := make(map[string]bool, len(allowed))
	for _, origin := range allowed {
		origins[strings.TrimRight(origin, "/")] = true
	}
	return func(c *gin.Context) {
		switch c.Request.Method {
		case http.MethodGet, http.MethodHead, http.MethodOptions:
			c.Next()
			return
		}
		if c.GetHeader("Sec-Fetch-Site") == "cross-site" {
			c.AbortWithStatusJSON(http.StatusForbidden, gin.H{"error": "cross-site request refused"})
			return
		}
		if origin := c.GetHeader("Origin"); origin != "" && !origins[origin] {
			c.AbortWithStatusJSON(http.StatusForbidden, gin.H{"error": "cross-site request refused"})
			return
		}
		c.Next()
	}
}
