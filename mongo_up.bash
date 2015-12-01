sudo docker build --tag dbonev/mongo ./mongo
sudo docker run -d --name mongo -p 21017:21017 dbonev/mongo
