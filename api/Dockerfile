FROM node:10-stretch-slim

WORKDIR /app

COPY package.json ./

COPY package-lock.json ./

COPY ./ ./

RUN apt-get update

RUN apt-get install --yes python3 

RUN apt-get install --yes python3-pip

COPY requirements.txt requirements.txt

RUN pip3 install -r requirements.txt

RUN npm install

CMD ["npm", "run", "start"]

