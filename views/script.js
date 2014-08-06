var app = angular.module('timer',[]);

app.factory('socket',function(){
	var socket = io.connect('http://10.0.0.84');
	return {
		submitMessage : function(messageType, data){
			socket.emit(messageType, data);
		}, 
		receiveMessage : function(messageType, callback){
			socket.on(messageType, callback);
		}
	};
});

app.controller('userPlay', ['$scope','$interval','$timeout','socket', function($scope, $interval, $timeout, socket){
	$scope.settings = {
		colour: null,
		difference: null,
		roundStart:false,
		noEntry: false,
		tooEarly: false,
		countDown: false,
		name:null,
		connected: false
	};

	// internal settings
	settings = {
		startTime:null,
		finishTime:null,
	}

	//value returning from server == Date happening - current date = next round start. time is the same. Everything the same except keeping the rounds in synch and the colours
	randTimeGenerator = function(time, colour){
		$timeout(function(){
			settings.startTime = Date.now();
			$scope.settings.colour = colour;

			$timeout(function(){
				if (!settings.finishTime){
					$scope.settings.noEntry = true;
					$scope.settings.roundStart = false;
				}
			},3000);

		}, time);
	};

	socket.receiveMessage('connected', function(data){
		$scope.settings.connected = true;
		console.log('connected');
	});

	socket.receiveMessage('newRound', function(data){
		var timeTillNextRound = data.nextRound - Date.now();

		settings.startTime = null;
		settings.finishTime = null;
		$scope.settings.roundStart = false;
		$scope.settings.noEntry = false;
		$scope.settings.tooEarly = false;
		$scope.settings.colour = 'ffffff';
		$scope.settings.difference = null;
		$scope.settings.countDown = Math.round(timeTillNextRound/1000);

		$timeout(function(){
			$scope.settings.roundStart = true;
			randTimeGenerator(data.time, data.colour);
			console.log(data.time);
		}, timeTillNextRound);

		console.log('New Route Started');
	});

	$interval(function(){
		if($scope.settings.countDown){ 
			$scope.settings.countDown--;
		}
	},1000);

	$scope.calculateTime = function(){
		var difference;
		if($scope.settings.roundStart){

			$scope.settings.roundStart = false;
			settings.finishTime = Date.now();

			$scope.settings.difference = settings.finishTime - settings.startTime;

			if($scope.settings.difference > 5000){
				$scope.settings.tooEarly = true;
			} else {
				var obj = {
					difference: $scope.settings.difference,
					name: $scope.settings.name
				}
				socket.submitMessage('scoreRecieved', obj);
			}
		};
	};
}]);


app.controller('scores', ['$scope','$interval','socket', function($scope, $interval, socket){
	$scope.currentGame = true;
	$scope.times = [];
	$scope.records = [];
	$scope.switchList = function(choice){
		$scope.currentGame = choice;
		console.log($scope.currentGame);
		socket.submitMessage('currentGame', $scope.currentGame);

	};
	socket.receiveMessage('currentGameScore', function(data){
		$scope.times = data;
	});
	socket.receiveMessage('highScore', function(data){
		$scope.records = data;
	});
	socket.receiveMessage('currentScores', function(data){
		$scope.times = data;
	});


	
}]);

