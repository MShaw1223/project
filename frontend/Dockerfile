FROM node:24-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# the build is static files, so the runtime has no Node at all: nginx serves them and proxies
# /backend to the Go server (nginx.conf). This image runs as the unprivileged "nginx" user (uid 101)
# and only writes under /tmp
FROM nginxinc/nginx-unprivileged:1.30-alpine-slim
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 3000
