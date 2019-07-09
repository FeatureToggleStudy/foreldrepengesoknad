FROM node:alpine

WORKDIR /usr/src/app
COPY . ./

RUN npm install
RUN npm run build
RUN npm prune --production

EXPOSE 8080
CMD ["npm", "run", "start-express"]