# provide node.js and npm to build angular + name stage build
FROM node:24-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./

# do this before copying src code so docker can cache deps
RUN npm ci --legacy-peer-deps

COPY src ./src
COPY angular.json .
# all tsconfig files will be copied
COPY tsconfig*.json ./
COPY public ./public


RUN npm run build

# nginx webserver delivers the created files to the browser
FROM nginx:alpine AS runtime

# put generated build into nginx default folder
COPY --from=build /app/dist/frontend/browser /usr/share/nginx/html

# copy config from frontend to nginx image
COPY nginx.conf /etc/nginx/conf.d/default.conf
