const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 5
    },
    password: {
        type: String, 
        required: true
    },
    elo: {
        type: Number,
        required: true
    }
})

module.exports = mongoose.model('User', userSchema);