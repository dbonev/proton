FROM ubuntu:latest

MAINTAINER Dimitar Bonev <dimitar.bonev@gmail.com>

RUN apt-get update
RUN apt-get install -y curl

RUN curl -sL https://deb.nodesource.com/setup_4.x | sudo -E bash -
RUN apt-get update && apt-get install -y nodejs
RUN apt-get install -y mongodb-clients

ADD ./ /app/data_collection/
RUN cd /app/data_collection/ && npm install

EXPOSE 4242

ENTRYPOINT node /app/data_collection/index.js /app/data_collection/config_container.json
