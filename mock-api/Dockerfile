FROM node:alpine

WORKDIR /mock-api

COPY src .
COPY package.json package.json
RUN npm install

EXPOSE 8888

CMD ["node", "./mock-api-server.js"]