sudo docker build --tag dbonev/data_api ./data_collection
sudo docker build --tag dbonev/apikeys ./api_keys

sudo docker run -d --name apikeys --link mongo -p 4343:4343 dbonev/apikeys
sudo docker run -d --name data_api --link mongo --link apikeys -p 4242:4242 dbonev/data_api
