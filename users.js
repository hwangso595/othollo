const {SPECT, P1, P2} = require('./variables');
const users = [];

const addUser = ({id, name, room}) => {
    name = name.trim().toLowerCase();
    room = room.trim().toLowerCase();

    const existingUser = users.find((user) => user.room === room && user.name === name);

    if(existingUser) {
        return {error: 'Username is taken'};
    }
    let type = getUsersInRoom(room).length === 1 ? P2 : getUsersInRoom(room).length < 1 ? P1 : SPECT;

    const user = {id, name, room, type};
    users.push(user);

    return {user};
}

const checkExists = ({name, room}) => {
    const existingUser = users.find((user) => user.room === room && user.name === name);

    if(existingUser) {
        return {error: 'Username is taken'};
    }
    return undefined;
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

module.exports = {addUser, removeUser, getUser, getUsersInRoom, getPlayerList, checkExists};