const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const http = require('http');
const socketio = require('socket.io');

const {addUser, removeUser, getUser, getUsersInRoom, getPlayerList, checkExists} = require('./users.js');
const {updateGame, getGame, clearGame, addGame, removeGame, getGameList} = require('./reversi.js')
const {PORT, SPECT, P1, P2} = require('./variables.js');

require('dotenv').config();

const app = express();
const server = http.createServer(app)
const io = socketio(server);

const router = require('./routes/router');
app.use('/', router);

app.use(cors());
app.use(express.json());

const uri = process.env.DATABASE_URL;
mongoose.connect(uri, {useNewUrlParser: true,  useUnifiedTopology: true, useCreateIndex: true});
const connection = mongoose.connection;
connection.once('open', () => console.log('Connected to Mongoose'));

io.on('connection', socket => {

    socket.on('join', ({name, room}, callback)  => {
        room = room.trim().toLowerCase();
        
        const {error, user} = addUser({id:socket.id, name, room});

        if(error) return callback(error);

        socket.emit('message', {user: 'admin', text: `${user.name}, welcome to the room ${user.room}`});
        socket.broadcast.to(user.room).emit('message', {user: 'admin', text: `${user.name} joined the room`});

        io.to(user.room).emit('playerlist', getPlayerList(user.room));

        let game = addGame(user.room);
        if(!game.error){ 
            socket.emit('move', game);
        } else {
            socket.emit('move', getGame(user.room));
        }
        socket.emit('playerType', user.type);
        
        socket.join(user.room);
        callback()
    });

    socket.on('checkUser', ({name, room, join}, callback) => {
        if (!name) {
            return callback({type: 'name', message: 'Please enter your name'});
        }
        const game = getGame(room);
        if (join) {
            
            if (checkExists({name, room})) {
                return callback({type: 'name', message: 'Username is already taken in that room'});
            } else if (!room) {
                return callback({type: 'joinRoom', message: 'Please enter the room you want to join'});
            } else if (!game) {
                return callback({type: 'joinRoom', message: 'The room that you entered does not exist'});
            } 
        } else {
            if (!room) {
                return callback({type: 'createRoom', message: 'Please enter the room you want to create'});
            } if (game) {
                return callback({type: 'createRoom', message: 'The room that you entered already exist'});
            } 
        }
        callback();
    })

    socket.on('getRoomList', (callback) => {
        const roomList = getGameList();
        return callback(roomList);
    })

    socket.on('sendMove', ({coord, player}, callback) => {
        const user = getUser(socket.id);
        const game = updateGame(coord, player, user.room);
        if(game.error) console.log(game.error);
        io.to(user.room).emit('move', game);
        callback();
    })

    socket.on('playAgain', (callback) => {
        const user = getUser(socket.id);
        const game = clearGame(user.room);

        io.to(user.room).emit('move', game);
        callback();
    })

    socket.on('disconnect', () => {
        const user = removeUser(socket.id);
        if(user) {
            io.to(user.room).emit('message', {user: 'admin', text: '${user.name} has left'})
            if(!getUsersInRoom(user.room).length) {
                removeGame(user.room);
            }
        }
    })
})

server.listen(PORT, () => {
    console.log('Server is running on port: ' + PORT);
})