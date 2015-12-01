var mongodb = require('mongodb');
var fs = require('fs');
var mongo_client = mongodb.MongoClient;
var express = require('express');
var app = express();
var body_parser = require('body-parser');

app.use(body_parser.json());

var argv = process.argv;
if (argv.length <= 2){
	print_help();
	return;	
}

var config_filename = argv[2];
var NOT_VALID = "not valid";
var VALID = "valid";

read_config(config_filename, function(config){
	var mongo_host = config.mongo_instance_host;
	var mongo_port = config.mongo_instance_port;
	var mongo_db = config.mongo_instance_db;

	app.get('/', function(req, resp){
		resp.send('Server running');
	});

	app.post('/validate_api_key', function(req, resp){
		var url = 'mongodb://' + mongo_host + ':' + mongo_port + '/' + mongo_db;
		console.log(req.body);
		var api_key = req.body.api_key;
		if (api_key == null){
			resp.send(NOT_VALID);
			return;
		}

		mongo_client.connect(url, function (err, db) {
			if (err) {
				console.log('Unable to connect to the mongoDB server. Error:', err);
				resp.send(NOT_VALID);
			} else {
				console.log('Connection established to', url);
				var collection = db.collection('api_keys');
				var cursor = collection.find({ "api_key": api_key}).toArray(function(err, result){
					result.forEach(function(item){
						console.log(item);
					});
					if (result.length == 0){
						console.log('API key ' + api_key + ' not found');
						resp.send(NOT_VALID);
					} else {
						console.log('API key ' + api_key + ' found');
						resp.send(result[0]);
					}
				});

			}
		});
	});


	var port = config.port == null ? 4343 : config.port;
	app.listen(port, function(){
		console.log('API server running on port ' + port);
	});
});

function print_help(){
	console.log('Usage:\n$ node index.js confg_file');
}

function read_config(filename, callback){
	var result = [];
	fs.readFile(filename, 'utf8', function(err, data){
		if (err){
			throw err;
		}
		var config = JSON.parse(data);
		if (callback != null){
			callback(config);
		}
	});
}
