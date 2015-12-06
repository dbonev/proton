var mongodb = require('mongodb');
var fs = require('fs');
var mongo_client = mongodb.MongoClient;

var express = require('express');
var app = express();
var body_parser = require('body-parser');

var mongo_host;
var mongo_port;
var mongo_db;

app.use(body_parser.json());

var argv = process.argv;
if (argv.length <= 2){
	print_help();
	return;	
}

var config_filename = argv[2];
read_config(config_filename, function(config){
	mongo_host = config.mongo_instance_host;
	mongo_port = config.mongo_instance_port;
	mongo_db = config.mongo_instance_db;

	app.all('/', function(req, resp){
		resp.redirect('/api');
	});
	app.get('/api', function(req, resp){
		send(resp, 'Use post request to this endpoint to log your events');  
	});

	var test_processor = new Processor(true);
	var prod_processor = new Processor(false);

	app.post('/api', prod_processor.process_function);
	app.post('/apitest', test_processor.process_function);

	function Processor(is_test){
		this.process_function = 
			function(req, resp){
				console.log('Received request ' + req.body);
				validate_api_key(config, req, function(err, api_key){
					if (err){
						send(resp, 'Invalid or missing API key');
						return;
					}
					console.log(api_key);
					var owner = api_key.owner;
					write_to_db(req.body, is_test, owner, function(err, msg){
						if (err){
							send(resp, 'There was an error processing your request\n');
						} else {
							send(resp, 'Your request has been processed.\n');
						}
					});
				});
			};
		return this;
	}

	var port = config.port == null ? 4242 : config.port;
	app.listen(config.port, function(){
		console.log('API server running on port ' + port);
	});
});

function validate_api_key(config, req, callback){
	if (config.api_validation_service == null){
		callback('no validation service available', null);
	} else {
		var request = require('request');
		request.post(config.api_validation_service,
		{ json: req.body },
		function(error, resp, body){
			if (error || resp.statusCode != 200 || body === 'not valid'){
				if (!error){
					error = 'not valid';
				}
				callback(error);
			} else {
				callback(null, body);
			}
		});
	}
}
function write_to_db(message, is_test, owner, callback){
	var url = 'mongodb://' + mongo_host + ':' + mongo_port + '/' + mongo_db;

	var metamessage = {
		timestamp: Date.now(),
		owner: owner,
		message: message
	};
	mongo_client.connect(url, function (err, db) {
		if (err) {
			console.log('Unable to connect to the mongoDB server. Error:', err);
			callback(err);
		} else {
			console.log('Connection established to', url);
			var collection_name = is_test ? 'test_data' : 'data';
			var collection = db.collection(collection_name);
			collection.insert(metamessage, function(err, result){
				db.close();
				callback(err);
			});
		}
	});
}

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
