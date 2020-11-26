const route = require('express').Router()

const messageController = require('../controllers/message')

// route.get('/', messageController.showChat)
route.get('/', messageController.allChat0)
route.get('/:id1/:id2', messageController.showChat)
route.post('/', messageController.postNewChat)
route.delete('/:id', messageController.deleteChat)

module.exports = route