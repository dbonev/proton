FROM dbonev/proton_base:latest

MAINTAINER Dimitar Bonev <dimitar.bonev@gmail.com>

RUN mkdir -p /app/data_collection/
ADD ./ /app/data_collection/

EXPOSE 4242

ENTRYPOINT node /app/data_collection/index.js /app/data_collection/config_container.json
