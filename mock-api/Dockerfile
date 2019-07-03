FROM node:alpine

WORKDIR /usr/src/app

COPY mock-api-server.js .
COPY node_modules ./node_modules
COPY package.json .

EXPOSE 8888

CMD ["npm", "run","start-mock-api-server"]