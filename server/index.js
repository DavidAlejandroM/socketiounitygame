var app = require("express")();
var server = require("http").Server(app);
var io = require("socket.io")(server);

server.listen(3000);

// variables globales
let enemies = [];
let playerSpawnPoints = [];
let clients = [];

app.get('/', function(req, res){
    res.send('hey you got back get "/"')
});

io.on('connection', function(socket){
    
    let currentPlayer = {};
    currentPlayer.name = 'unknown';

    socket.on('player connect',function(){
        console.log(currentPlayer.name,'recv: player connect.');
        for (let i = 0; i < clients.length; i++) {
            let playerConnected = {
                name:clients[i].name,
                position:clients[i].position,
                rotation:clients[i].position,
                health:clients[i].health
            }

            socket.emit('other player connected', playerConnected);
            console.log(`${playerConnected.name} emit: other player connected ${JSON.stringify(playerConnected)}`);
        }
    });

    socket.on('play' ,function(data){
        console.log(`${playerConnected.name} recv: play ${JSON.stringify(data)}`);

        if(clients.length === 0){
            numberOfEnemies = data.enemySpawnPoints.length;
            enemies = [];
            data.enemySpawnPoints.forEach(enemySpawnPoint => {
                let enemy = {
                    name: guid(),
                    position: enemySpawnPoint.position,
                    rotation: enemySpawnPoint.rotation,
                    health: 100,

                };
                enemies.push[enemy];
            });
        }
    });
});

console.log('--- server is running....')