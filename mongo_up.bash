sudo docker build --tag dbonev/mongo ./mongo
sudo docker run -d --name mongo -p 27017:27017 --net proton dbonev/mongo
