# Use Node.js to build Angular with pnpm
FROM node:24-alpine AS build

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

RUN npm install -g pnpm@12.10.1
RUN pnpm install --frozen-lockfile

COPY src ./src
COPY angular.json .
# all tsconfig files will be copied
COPY tsconfig*.json ./
COPY public ./public


RUN pnpm run build

# nginx webserver delivers the created files to the browser
FROM nginx:alpine AS runtime

# put generated build into nginx default folder
COPY --from=build /app/dist/frontend/browser /usr/share/nginx/html

# copy config from frontend to nginx image
COPY nginx.conf /etc/nginx/conf.d/default.conf
