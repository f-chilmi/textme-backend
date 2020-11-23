const route = require('express').Router()
const uploadHelper = require('../helpers/upload')

const userController = require('../controllers/users')

route.get('/', userController.showUser)
route.get('/all', userController.showAllUser)
route.patch('/', uploadHelper, userController.editUser)

module.exports = route