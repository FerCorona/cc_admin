FROM node:alpine

WORKDIR /app

COPY package.json ./

COPY package-lock.json ./

COPY ./ ./

RUN npm i

EXPOSE 9118

CMD ["npm", "run", "start"]