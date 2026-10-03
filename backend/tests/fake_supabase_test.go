package tests

import (
	"io"
	"net/http"
	"net/http/httptest"
	"net/url"
	"sync"
	"testing"
)

const (
	fakeUserID  = "7c9e6679-7425-40de-944b-e07fc1f90ae7"
	fakeAnonKey = "anon-key"
)

// supabaseCall is one request the code under test sent to the fake Supabase.
type supabaseCall struct {
	Method, Path string
	Query        url.Values
	Header       http.Header
	Body         string
}

type supabaseReply struct {
	status int
	body   string
}

// fakeSupabase stands in for a Supabase project's /auth/v1 and /rest/v1 APIs, so the repositories run
// their real client code without a network. It answers with canned replies and records what it was sent.
type fakeSupabase struct {
	t   *testing.T
	URL string

	mu      sync.Mutex
	calls   []supabaseCall
	replies map[string]supabaseReply
}

// newFakeSupabase starts the fake and points SUPABASE_URL/SUPABASE_KEY at it. Any token is accepted as
// fakeUserID until a test replaces the GET /auth/v1/user reply.
func newFakeSupabase(t *testing.T) *fakeSupabase {
	t.Helper()
	f := &fakeSupabase{t: t, replies: map[string]supabaseReply{}}
	server := httptest.NewServer(http.HandlerFunc(f.serve))
	t.Cleanup(server.Close)
	f.URL = server.URL
	t.Setenv("SUPABASE_URL", server.URL)
	t.Setenv("SUPABASE_KEY", fakeAnonKey)
	f.reply(http.MethodGet, "/auth/v1/user", http.StatusOK, `{"id":"`+fakeUserID+`","email":"trader@example.com"}`)
	return f
}

func (f *fakeSupabase) serve(w http.ResponseWriter, r *http.Request) {
	body, _ := io.ReadAll(r.Body)
	f.mu.Lock()
	f.calls = append(f.calls, supabaseCall{Method: r.Method, Path: r.URL.Path, Query: r.URL.Query(), Header: r.Header.Clone(), Body: string(body)})
	reply, ok := f.replies[r.Method+" "+r.URL.Path]
	f.mu.Unlock()

	if !ok {
		f.t.Errorf("unexpected request to Supabase: %s %s", r.Method, r.URL.Path)
		reply = supabaseReply{http.StatusNotImplemented, `{"code":"unexpected","message":"unexpected request"}`}
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(reply.status)
	_, _ = w.Write([]byte(reply.body))
}

// reply sets what the fake answers to method and path from now on.
func (f *fakeSupabase) reply(method, path string, status int, body string) {
	f.mu.Lock()
	defer f.mu.Unlock()
	f.replies[method+" "+path] = supabaseReply{status, body}
}

// count is how many requests the fake received for method and path.
func (f *fakeSupabase) count(method, path string) int {
	f.mu.Lock()
	defer f.mu.Unlock()
	n := 0
	for _, call := range f.calls {
		if call.Method == method && call.Path == path {
			n++
		}
	}
	return n
}

// total is how many requests the fake received.
func (f *fakeSupabase) total() int {
	f.mu.Lock()
	defer f.mu.Unlock()
	return len(f.calls)
}

// last returns the most recent request for method and path, failing the test when there was none.
func (f *fakeSupabase) last(method, path string) supabaseCall {
	f.t.Helper()
	f.mu.Lock()
	defer f.mu.Unlock()
	for i := len(f.calls) - 1; i >= 0; i-- {
		if f.calls[i].Method == method && f.calls[i].Path == path {
			return f.calls[i]
		}
	}
	f.t.Fatalf("expected a %s %s request to Supabase, got %d other requests", method, path, len(f.calls))
	return supabaseCall{}
}

// asUser fails the test unless a PostgREST call was made with the caller's own token (so row level
// security applies) and scoped to their user id in column.
func (c supabaseCall) asUser(t *testing.T, token, column string) {
	t.Helper()
	if got := c.Header.Get("Authorization"); got != "Bearer "+token {
		t.Errorf("%s %s: expected the caller's own token, got %q", c.Method, c.Path, got)
	}
	if got := c.Header.Get("apikey"); got != fakeAnonKey {
		t.Errorf("%s %s: expected the api key header, got %q", c.Method, c.Path, got)
	}
	if got := c.Query.Get(column); got != "eq."+fakeUserID {
		t.Errorf("%s %s: expected the query to be scoped to the caller with %s, got %q", c.Method, c.Path, column, got)
	}
}
