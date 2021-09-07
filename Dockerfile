FROM node:8

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3000

VOLUME /data/db 

CMD [ "npm", "start" ]