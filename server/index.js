var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);
//var playerConnect = require('./src/playerConnect');
const PORT = process.env.PORT || 3000;

server.listen(PORT);
console.log(`port: ${PORT}`);

// global variables for the server
var enemies = [];
var playerSpawnPoints = [];
var clients = [];

app.get('/', function(req, res) {
	res.send('hey you got back get "/"');
});

io.on('connection', function(socket) {
	
	var currentPlayer = {};
	var currentIP = socket.handshake.address;
	currentPlayer.name = 'unknown';
	console.log("player connect");
	

	socket.on('player connect', function() {
		console.log(currentPlayer.name+ 'ip:' + currentIP+' recv: player connect');
		for(var i =0; i<clients.length;i++) {
			var playerConnected = {
				name:clients[i].name,
				type:clients[i].type,
				position:clients[i].position,
				rotation:clients[i].position,
				health:clients[i].health
			};
			// in your current game, we need to tell you about the other players.
			socket.emit('other player connected', playerConnected);
			console.log(currentPlayer.name+' emit: other player connected: '+JSON.stringify(playerConnected));
		}
	});

	socket.on('play', function(data) {
		console.log(currentPlayer.name+' recv: play: '+JSON.stringify(data));
		
		clients.forEach((client, index) => {
			if(client.name == data.name){
				data.name += ` (${guidShort()})`;
			}
			//console.log(index);
		});

		// if this is the first person to join the game init the enemies
		if(clients.length === 0) {
			let numberOfEnemies = data.enemySpawnPoints.length;
			enemies = [];
			data.enemySpawnPoints.forEach(function(enemySpawnPoint) {
				var enemy = {
					name: guid(),
					position: enemySpawnPoint.position,
					rotation: enemySpawnPoint.rotation,
					health: 100
				};
				enemies.push(enemy);
			});

			data.playerSpawnPoints.forEach(function(_playerSpawnPoint,index) {
				let position = _playerSpawnPoint.position;
				position[0] = (Math.floor((Math.random() * 20)) - Math.floor((Math.random() * 20)));
				position[2] = (Math.floor((Math.random() * 20)) - Math.floor((Math.random() * 20)));

				var playerSpawnPoint = {
					position: position,
					rotation: _playerSpawnPoint.rotation
				};
                playerSpawnPoints.push(playerSpawnPoint);
			});
		}

		var enemiesResponse = {
			enemies: enemies
		};
		// we always will send the enemies when the player joins
		let position = [
			(Math.floor((Math.random() * 45)) - Math.floor((Math.random() * 45))),
			1.2,
			(Math.floor((Math.random() * 45)) - Math.floor((Math.random() * 45)))];
        //console.log(currentPlayer.name+' emit: enemies: '+JSON.stringify(enemiesResponse));
		socket.emit('enemies', enemiesResponse);
		var randomSpawnPoint = playerSpawnPoints[Math.floor(Math.random() * playerSpawnPoints.length)];
		currentPlayer = {
			name:data.name,
			type: data.type,
			position: position,
			rotation: [0,(Math.floor((Math.random() * 360))),0],
			health: 100
		};
		clients.push(currentPlayer);
        // in your current game, tell you that you have joined
        //console.log("Tamaño clientes",clients.length);
		console.log(currentPlayer.name+' emit: play: '+JSON.stringify(currentPlayer));
		socket.emit('play', currentPlayer);
		// in your current game, we need to tell the other players about you.
		socket.broadcast.emit('other player connected', currentPlayer);
	});

	socket.on('player move', function(data) {
		//console.log('recv: move: '+JSON.stringify(data));
		currentPlayer.position = data.position;
		socket.broadcast.emit('player move', currentPlayer);
	});

	socket.on('player turn', function(data) {
		//console.log('recv: turn: '+JSON.stringify(data));
		currentPlayer.rotation = data.rotation;
		socket.broadcast.emit('player turn', currentPlayer);
	});

	socket.on('player shoot', function() {
		//console.log(currentPlayer.name+' recv: shoot');
		var data = {
			name: currentPlayer.name
		};
		//console.log(currentPlayer.name+' bcst: shoot: '+JSON.stringify(data));
		socket.emit('player shoot', data);
		socket.broadcast.emit('player shoot', data);
	});

	socket.on("player death", data =>{
		//console.log(`${currentPlayer.name} recv: player death: ${JSON.stringify(data)}`);
		socket.broadcast.emit('other player disconnected', data);
		console.log(data.name+' bcst: isDead '+JSON.stringify(currentPlayer));
		for(var i=0; i<clients.length; i++) {
			if(clients[i].name === data.name) {
				clients.splice(i,1);
			}
		}
	});

	socket.on('health', function(data) {
		//console.log(currentPlayer.name+' recv: health: '+JSON.stringify(data));
		// only change the health once, we can do this by checking the originating player
		if(data.from === currentPlayer.name) {
			var indexDamaged = 0;
			clients = clients.map(function(client, index) {
				if(client.name === data.name) {
					indexDamaged = index;
					client.health -= data.healthChange;
				}
				return client;
			});
			// if(!data.isEnemy) {
			// 	clients = clients.map(function(client, index) {
			// 		if(client.name === data.name) {
			// 			indexDamaged = index;
			// 			client.health -= data.healthChange;
			// 		}
			// 		return client;
			// 	});
			// } else {
			// 	enemies = enemies.map(function(enemy, index) {
			// 		if(enemy.name === data.name) {
			// 			indexDamaged = index;
			// 			enemy.health -= data.healthChange;
			// 		}
			// 		return enemy;
			// 	});
			// }

			var response = {
				name: clients[indexDamaged].name,
				health: clients[indexDamaged].health
			};
			//console.log(currentPlayer.name+' bcst: health: '+JSON.stringify(response));
			socket.emit('health', response);
			socket.broadcast.emit('health', response);
		}
	});

	socket.on('disconnect', function() {
		console.log(currentPlayer.name+' recv: disconnect '+currentPlayer.name);
		socket.broadcast.emit('other player disconnected', currentPlayer);
		console.log(currentPlayer.name+' bcst: other player disconnected '+JSON.stringify(currentPlayer));
		for(var i=0; i<clients.length; i++) {
			if(clients[i].name === currentPlayer.name) {
				clients.splice(i,1);
			}
		}
	});

});

console.log('--- server is running ...');

function guid() {
	function s4() {
		return Math.floor((1+Math.random()) * 0x10000).toString(16).substring(1);
	}
	return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
}

function guidShort() {
	function s4() {
		return Math.floor((1+Math.random()) * 0x10000).toString(16).substring(1);
	}
	return s4();
}