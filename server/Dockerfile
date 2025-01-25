FROM node:20-bullseye as node

COPY . /app
WORKDIR /app

RUN npm install
RUN npm run build

CMD npm run serve