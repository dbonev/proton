var mongodb = require('mongodb');
var fs = require('fs');
var mongo_client = mongodb.MongoClient;
var express = require('express');
var app = express();
var body_parser = require('body-parser');

var linqnode = require('linqnode');

app.use(body_parser.json());

var argv = process.argv;
if (argv.length <= 2){
	print_help();
	return;	
}

var config_filename = argv[2];
var NOT_VALID = "not valid";
var VALID = "valid";
var cached_api_keys;

read_config(config_filename, function(config){
	var mongo_host = config.mongo_instance_host;
	var mongo_port = config.mongo_instance_port;
	var mongo_db = config.mongo_instance_db;

	app.get('/', function(req, resp){
		send(resp, 'Server running');
	});

	app.post('/validate_api_key', function(req, resp){
		var url = 'mongodb://' + mongo_host + ':' + mongo_port + '/' + mongo_db;
		console.log(req.body);
		var api_key = req.body.api_key;
		if (api_key == null){
			send(resp, NOT_VALID);
			return;
		}
		if (cached_api_keys != null){
			var cached_res = cached_api_keys.first(function(k) { return k.api_key === api_key; });
			if (cached_res != null){
				console.log('Api key ' + api_key + ' found in cache');
				send(resp, cached_res);
				return;
			}
		}

		mongo_client.connect(url, function (err, db) {
			if (err) {
				console.log('Unable to connect to the mongoDB server. Error:', err);
				send(resp, NOT_VALID);
			} else {
				console.log('Connection established to', url);
				var collection = db.collection('api_keys');
				var cursor = collection.find({ "api_key": api_key}).toArray(function(err, result){
					if (err || result == null || result.length == 0){
						console.log('API key ' + api_key + ' not found');
						send(resp, NOT_VALID);
					} else {
						cached_api_keys = result;
						linqnode.linqify(cached_api_keys);
						console.log('API key ' + api_key + ' found');
						send(resp, result[0]);
					}
					db.close();
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

function send(resp, message){
	try {
		resp.send(message);
	}
	catch (e){
		console.log('Swallowing exception ' + e);
	}
}
