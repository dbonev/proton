FROM ubuntu:latest

MAINTAINER Dimitar Bonev <dimitar.bonev@gmail.com>

RUN apt-get update
RUN apt-get install -y curl

RUN curl -sL https://deb.nodesource.com/setup_4.x | sudo -E bash -
RUN apt-get update && apt-get install -y nodejs
RUN apt-get install -y mongodb-clients

RUN mkdir -p /app/api_keys/
ADD ./ /app/api_keys/
RUN cd /app/api_keys/ && npm install

EXPOSE 4343

ENTRYPOINT node /app/api_keys/index.js /app/api_keys/config_container.json
