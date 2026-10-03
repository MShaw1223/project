FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
# next.config.js rewrites are baked in at build time; "backend" is the in-cluster Service name, the
# same in every environment, so one image works for test and prod
ARG BACKEND_URL=http://backend:8080
ENV BACKEND_URL=$BACKEND_URL NEXT_TELEMETRY_DISABLED=1
COPY . .
RUN npm run build

# only the node binary on plain Alpine: the server never runs npm, and the packages bundled with npm
# are where the node image's known vulnerabilities are. libstdc++ is what the binary links against
FROM alpine:3.24
RUN apk add --no-cache libstdc++ && addgroup -g 1000 node && adduser -u 1000 -G node -D node
COPY --from=build /usr/local/bin/node /usr/local/bin/node
WORKDIR /app
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 PORT=3000 HOSTNAME=0.0.0.0
COPY --from=build --chown=node:node /app/public ./public
COPY --from=build --chown=node:node /app/.next/standalone ./
COPY --from=build --chown=node:node /app/.next/static ./.next/static
USER node
EXPOSE 3000
CMD ["node", "server.js"]
