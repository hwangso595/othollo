const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const User = require('../models/user');

exports.users_signup_user = (req, res, next) => {
    User.find({username: req.body.username}).exec()
        .then(user => {
            if (user.length >= 1) {
                return res.status(409).json({
                    message: "Username already exists"
            });
            } else {
                bcrypt.hash(req.body.password, 10, (err, hash) => {
                    if (err) {
                        return res.status(500).json({
                            error: err
                        });
                    } else {
                        const user = new User({
                            username: req.body.username,
                            password: hash,
                            elo: 1200
                        })
                        user.save()
                            .then(result => {
                                console.log(result);
                                res.status(201).json({
                                    message: "User created"
                                })
                            })
                            .catch(err => {
                                res.status(500).json({
                                    error: err
                                });
                            })
                    }
                });
            }
            
        })
}

exports.users_login_user = (req, res, next) => {
    User.find({username: req.body.username})
        .exec()
        .then(user => {
            if (user.length < 1) {
                return res.status(401).json({
                    message: "Auth failed"
                });
            } else {
                bcrypt.compare(req.body.password, user[0].password, (err, result) => {
                    if (result) {
                        const token = jwt.sign(
                            {
                                username: user[0].username,
                                userId: user[0]._id
                            }, 
                            process.env.JWT_KEY, 
                            {
                                expiresIn: "1h"
                            }
                        );
                        return res.status(200).json({
                            message: "Auth successful",
                            token: token
                        });
                    }
                    return res.status(401).json({
                        message: "Auth failed"
                    });
                }) 
            }
        })
        .catch(err => {
            res.status(500).json({
                error: err
            });
        });

}

exports.users_delete_user = (req, res, next) => {
    User.remove({_id: req.params.userId}).exec()
        .then(result => {
            res.status(200).json({
                message: "User deleted"
            });
        })
        .catch(err => {
            res.status(500).json({
                error: err
            });
        });
}

exports.users_update_elo = (req, res, next) => {
    User.update({_id: req.params.id}, {$set: {elo: req.body.newElo}})
        .exec()
        .then(result => {
            console.log(result);
            if (result) {
                res.status(200).json({
                    message: 'Updated elo successfully',
                });
            }
            else res.status(404).json({
                message: 'No valid entry found for ID'
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({error: err});
        });
}