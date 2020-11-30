const route = require('express').Router()

const notifController = require('../controllers/notification')

route.get('/', notifController.showUser)
route.get('/all', notifController.showAll)
route.patch('/', notifController.editUser)
// route.post('/', notifController.newUser)

module.exports = route