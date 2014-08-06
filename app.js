var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var path = require('path');
var routes = require('./routes');
var users = require('./routes/user');
var generator = require('./server/colour-generation');
var mongoose = require('mongoose');

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hjs');

app.use('/', express.static(__dirname + '/views'));

app.use(express.static(path.join(__dirname, 'public')));
app.use(app.router);



mongoose.connect('mongodb://localhost/test');

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback () {
  console.log('awww yeah');
});


server.listen(3000);


var currentGame = [];
var highScores = [];

io.on('connection', function (socket) {
    socket.emit('connected', true);
    socket.on('scoreRecieved', function(data) {
    	currentGame.push(data);
    	io.emit('currentScores', currentGame);
    });
    socket.on('currentGame', function(data){
    	if(data){
    		socket.emit('currentGameScore', currentGame);
    	} else { 
    		socket.emit('highScore', highScores);
    	}
    })
});

setInterval(function(){
	var data = {
		nextRound: (Date.now() + 7000),
		colour: generator.colourGenerator(),
		time: generator.randTimeGenerator()
	}
	io.emit('newRound', data);
	highScores.push.apply(highScores, currentGame);
	currentGame = [];
	console.log('New Round Started');
}, 14000);



    









// app.set('port', process.env.PORT || 3000);




// var server = app.listen(app.get('port'), function() {
//   debug('Express server listening on port ' + server.address().port);
// });