const {SPECT} = require('./variables');
const users = [];

const addUser = ({id, name, room, playerType}) => {
    name = name.trim().toLowerCase();
    room = room.trim().toLowerCase();
    type = playerType;

    const existingUser = users.find((user) => user.room === room && user.name === name)

    if(existingUser) {
        return {error: 'Username is taken'};
    }

    const user = {id, name, room, type};
    users.push(user);

    return {user};
}

const removeUser = (id) => {
    const index = users.findIndex((user) => user.id === id);
    if(index !== -1) {
        return users.splice(index, 1)[0];
    }
}

const getUser = (id) => {
    return users.find((user) => user.id === id);
}

const getUsersInRoom = (room) => {
    return users.filter((user) => user.room === room);
}

const getPlayerList = (room) => {
    return users.filter((user) => user.room === room && (user.type !== SPECT));
}

module.exports = {addUser, removeUser, getUser, getUsersInRoom, getPlayerList};