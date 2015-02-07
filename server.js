var http = require('http');
var express = require('express');
var lodash = require('lodash');
var bodyParser = require('body-parser');
var WebSocketServer = require('ws').Server;

var app = express();

var players = [];

// parse bodies
app.use(bodyParser.json());

// log requests
/*app.use(function(req, res, next) {
	console.log('---------------------------');
	console.log(req.method, req.path);

	if (req.params) {
		console.log('req params', req.params);
	}
	if (!_.isEmpty(req.query)) {
		console.log('req query', req.query);
	}

	next();
});*/

app.get('/', express.static(__dirname + '/static'));


// start the http server
var port = process.env.PORT || 8000;
var server = http.createServer(app);
server.listen(port, function() {
	console.log('Listening on ' + port);
});

// create the websocket server
var wsServer = new WebSocketServer({ server: server });
console.log('Websocket server created');

wsServer.on('connection', function(ws) {
	ws.on('message', function(message) {
		console.log('received', message);
	});
});
