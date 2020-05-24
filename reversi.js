const {P1, P2, BDLEN, BDWIDTH} = require('./variables.js')
let games = [];

class Othello { 
    constructor(room) {
        this.board = new Array(BDLEN);
        for (var i = 0; i < this.board.length; i++) {
            this.board[i] = new Array(BDWIDTH).fill('');
        }
        [this.board[3][3], this.board[3][4], this.board[4][3], this.board[4][4]] = [P1, P2, P2, P1];

        this.available = [];
        this.player = P1;
        this.updateAvailable();
        this.room = room
        this.winner = '';
    }
    updateBoard(coord, playerClient) {
        this.board[coord[0]][coord[1]] = playerClient;
        this.available[coord[0]*BDWIDTH+coord[1]].forEach(cell => {
            this.board[cell[0]][cell[1]] = playerClient;
        })
    }
    updateAvailable() {
        this.available = {};
        let opp = this.player === P1? P2 : P1;
        let increment = [[1,0],[1,1],[0,1],[-1,1],[-1,0],[-1,-1],[0,-1],[0,-1]]
        for(let i = 0; i < BDLEN; i++) {
            for(let j = 0; j < BDWIDTH; j++) {
                
                if(this.board[i][j] === this.player){
                    for(let p = 0; p < increment.length; p++) {
                        let row = i+increment[p][0];
                        let col = j+increment[p][1];
                        let cellFlip = [];
                        if(0 <= row && row < BDLEN && 0 <= col && col < BDWIDTH && this.board[row][col] === opp) {
                            while(0 <= row && row < BDLEN && 0 <= col && col < BDWIDTH && this.board[row][col] === opp) {
                                cellFlip.push([row,col]);
                                row += increment[p][0];
                                col += increment[p][1];
                            }
                            if(0 <= row && row < BDLEN && 0 <= col && col < BDWIDTH && this.board[row][col] === '') {
                                if(!(row*BDWIDTH+col in this.available)) this.available[row*BDWIDTH+col] = [];
                                this.available[row*BDWIDTH+col].push(...cellFlip);
                            }
                        }
                    }
                }
            }
        }
    }
    updatePlayer(playerClient) {
        this.player = playerClient === P1 ? P2 : P1;
    }
    boardFilled() {
        for(let i = 0; i < BDLEN; i++) {
            for(let j = 0; j < BDWIDTH; j++) {
                if(!this.board[i][j]) return false
            }
        }
        return true
    }
    updateWinner() {
        let count1 = 0, count2 = 0;
        if(this.boardFilled()) {
            for(let i = 0; i < BDLEN; i++) {
                for(let j = 0; j < BDWIDTH; j++) {
                    if(this.board[i][j] === P1){
                        count1++;
                    } else {
                        count2++;
                    }
                }
            }
            this.winner = count1 > count2 ? P1 : count1 === count2 ? 'TIE' : P2;
        } else {
            this.winner = '';
        }
    }
    clearGame() {
        this.board = new Array(BDLEN).fill(Array(BDWIDTH).fill(''));
        [this.board[3][3], this.board[3][4], this.board[4][3], this.board[4][4]] = [P1, P2, P2, P1];
        this.updateAvailable();
        this.player = P1;
        this.winner = '';
    }
}

function returnGame(game) {
    return {
        board: game.board,
        player: game.player,
        available: game.available,
        winner: game.winner
    }
}

function addGame(room) {

    const existingGame = games.find((game) => game.room === room)

    if(existingGame) {
        return {error: 'Game already exists'};
    }

    const game = new Othello(room);
    games.push(game);

    return returnGame(game);
}

function removeGame(room) {
    const index = games.findIndex((game) => game.room === room);
    if(index !== -1) {
        return games.splice(index, 1)[0];
    }
}

function getGame(room) {
    const existingGame = games.find((game) => game.room === room)
    if(!existingGame) return false;

    return returnGame(existingGame);
}

function updateGame(coord, playerClient, room) {
    const existingGame = games.find((game) => game.room === room)
    if(!existingGame) return ({error: 'Game does not exist'})

    if (coord) existingGame.updateBoard(coord, playerClient);
    existingGame.updatePlayer(playerClient);
    existingGame.updateAvailable();
    existingGame.updateWinner();

    return returnGame(existingGame);
}

function clearGame(room) {
    const existingGame = games.find((game) => game.room === room)
    if(!existingGame) return ({error: 'Game does not exist'})

    existingGame.clearGame();
    return returnGame(existingGame);
}

module.exports = {P1, P2, updateGame, getGame, clearGame, removeGame, addGame}