const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const http = require('http');
const socketio = require('socket.io');

const {addUser, removeUser, getUser, getUsersInRoom, getPlayerList} = require('./users.js');
const {updateGame, getGame, clearGame, addGame, removeGame} = require('./reversi.js')
const {PORT, SPECT, P1, P2} = require('./variables.js');

require('dotenv').config();

const app = express();
const server = http.createServer(app)
const io = socketio(server);



app.use(cors());
app.use(express.json());

const uri = process.env.DATABASE_URL;
mongoose.connect(uri, {useNewUrlParser: true,  useUnifiedTopology: true, useCreateIndex: true});
const connection = mongoose.connection;
connection.once('open', () => console.log('Connected to Mongoose'));

const usersRouter = require('./routes/users');
const mainRouter = require('./routes/main');
app.use('/users', usersRouter);
app.use('/', mainRouter);

io.on('connection', socket => {

    socket.on('join', ({name, room}, callback)  => {
        room = room.trim().toLowerCase();
        let playerType = getUsersInRoom(room).length === 1 ? P2 : getUsersInRoom(room).length < 1 ? P1 : SPECT;
        const {error, user} = addUser({id:socket.id, name, room, playerType});

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