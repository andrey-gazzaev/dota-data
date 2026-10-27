FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:22-alpine
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && mkdir -p /data && chown -R node:node /app /data
COPY --from=build --chown=node:node /app/dist ./dist
ENV NODE_ENV=production
ENV PORT=8787
ENV HOST=0.0.0.0
ENV DATA_DIR=/data
ENV CLIENT_DIR=/app/dist/client
USER node
EXPOSE 8787
CMD ["node", "dist/server.js"]
