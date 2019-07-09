FROM node:alpine

WORKDIR /mock-api

COPY mock_data mock_data
COPY mock-storage.js mock-storage.js
COPY mock-api-server.js mock-api-server.js
COPY package.json package.json
RUN npm install

EXPOSE 8888

CMD ["node", "./mock-api-server.js"]