FROM node:20-bullseye as node

COPY . /app
WORKDIR /app

RUN npm install

RUN npm run build

FROM nginx:1.25.2

COPY --from=node /app/dist /usr/share/nginx/html