FROM node:18 AS build

WORKDIR /app

COPY package*.json ./
RUN npm install --production=false

COPY . .
RUN npm run build || echo "No build step"

FROM node:18-slim

WORKDIR /app
COPY --from=build /app /app

RUN npm install --omit=dev

EXPOSE 3000
CMD ["npm", "start"]
