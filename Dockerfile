FROM node:22-bookworm-slim AS build
WORKDIR /app
RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*
COPY package.json package-lock.json* ./
COPY apps/api/package.json apps/api/
COPY apps/web/package.json apps/web/
RUN npm install --legacy-peer-deps
COPY . .
RUN npm run build --workspace=@forgeledger/web \
 && npm run build --workspace=@forgeledger/api

FROM node:22-bookworm-slim
WORKDIR /app
RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*
ENV NODE_ENV=production PORT=8080 HOST=0.0.0.0
COPY package.json package-lock.json* ./
COPY apps/api/package.json apps/api/
COPY apps/web/package.json apps/web/
RUN npm install --omit=dev --legacy-peer-deps --workspace=@forgeledger/api
COPY --from=build /app/apps/api/dist apps/api/dist
COPY --from=build /app/apps/web/dist apps/web/dist
COPY apps/api/package.json apps/api/
RUN mkdir -p /app/data
EXPOSE 8080
CMD ["node", "apps/api/dist/main.js"]
