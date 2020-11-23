const route = require('express').Router()

const messageController = require('../controllers/message')

route.get('/', messageController.showChat)
route.post('/', messageController.newChat)
route.delete('/:id', messageController.deleteChat)

module.exports = route