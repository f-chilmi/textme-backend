const route = require('express').Router()

const userController = require('../controllers/users')

route.post('/register', userController.registerUser)

module.exports = route