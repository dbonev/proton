FROM dbonev/proton_base:latest

MAINTAINER Dimitar Bonev <dimitar.bonev@gmail.com>

RUN mkdir -p /app/api_keys/
ADD ./ /app/api_keys/
RUN cd /app/api_keys/ && npm install

EXPOSE 4343

ENTRYPOINT node /app/api_keys/index.js /app/api_keys/config_container.json
