const route = require('express').Router()

const userController = require('../controllers/users')

route.get('/', userController.showUser)

module.exports = route