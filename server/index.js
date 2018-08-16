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
            playerSpawnPoints = [];
            data.playerSpawnPoints.forEach(_playerSpawnPoint => {
                let player = {
                    position: _playerSpawnPoint.position,
                    rotation: _playerSpawnPoint.rotation
                };
                playerSpawnPoints.push[player];
            });
        }
        let enemiesResponse = {
            enemies: enemies
        }

        console.log(`${currentPlayer.name} emit: enemies ${JSON.stringify(enemies)}`);
        
        socket.emit('enemies',enemiesResponse);

        let randomSpawnPoint = playerSpawnPoints[Math.floor(Math.random() * playerSpawnPoints.length)];

        currentPlayer = {
            name: data.name,
            position: randomSpawnPoint.position,
            rotation: randomSpawnPoint.rotation,
            health: 100
        };

        clients.push(currentPlayer);

        console.log(`${currentPlayer.name} emit: play ${JSON.stringify(currentPlayer)}`);

        socket.broadcast('other player connected', currentPlayer);

    });

    socket.on('player move', data =>{
        console.log(`recv: move ${JSON.stringify(data)}`);
        currentPlayer.position = data.position;
        socket.broadcast('player move', currentPlayer);
    });

    socket.on('player turn', data =>{
        console.log(`recv: turn ${JSON.stringify(data)}`);
        currentPlayer.rotation = data.rotation;
        socket.broadcast('player turn', currentPlayer);
    });

    socket.on('player shoot', () =>{
        console.log(`${currentPlayer.name} recv: shoot`);
        let data = {
            name: currentPlayer.name
        }
        console.log(`${currentPlayer.name} bcst: shoot ${JSON.stringify(data)}`);
        socket.emit('player shoot', data);
        socket.broadcast('player shoot', data)
    });

    socket.on('health',data=>{
        console.log(`${currentPlayer.name} recv: health ${JSON.stringify(data)}`);
        if(data.from = currentPlayer.name){
            var indexDamage = 0;
            if(!data.isEnemy){
                clients = clients.map((client, index) => {
                    if(client.name === data.name){
                        indexDamage = index;
                        client.health -= data.healthChange;
                    }
                    return client;
                })
            }
            else{
                enemies = enemies.map((enemy, index) => {
                    if(enemy.name === data.name){
                        indexDamage = index;
                        enemy.health -= data.healthChange;
                    }
                    return enemy;
                })
            }
            let resp = {
                name: (!data.isEnemy) ? clients[indexDamage].name : enemies[indexDamage].name,
                health: (!data.isEnemy) ? clients[indexDamage].health : enemies[indexDamage].health,
            }

            console.log(`${currentPlayer.name} bcst: health ${JSON.stringify(resp)}`);
            socket.emit('health',resp);
            socket.broadcast('health',resp);    
        }
    });


    socket.on('disconnect',()=>{
        console.log(`${currentPlayer.name} rscv: disconnect ${currentPlayer.name}`);
        socket.broadcast('other player disconnect',currentPlayer ); 
        console.log(`${currentPlayer.name} brsc: other player disconnect ${JSON.stringify(currentPlayer)}`);
    })
});

console.log('--- server is running....' + guid());

function guid(){
    function s4(){
        return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
    }

    return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
}