FROM golang:1.25 AS build
WORKDIR /src
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 go build -trimpath -ldflags="-s -w" -o /out/server .

# static + CA certificates (needed for the https calls to Supabase), runs as a non-root user
FROM gcr.io/distroless/static-debian12:nonroot
COPY --from=build /out/server /server
EXPOSE 8080
ENTRYPOINT ["/server"]
