const { User, Chat } = require('../models')
const responseStandard = require('../helpers/response')

module.exports = {
  showChat: async (req, res) => {
    const { id } = req.user.detailUser
    const result = await Chat.findAll({ where: { id_sender: id }})
    if(result.length>0) {
      responseStandard(res, 'Message list', {result}, 200, true)
    } else { 
      responseStandard(res, 'No message found', {}, 400, false)
    }
  },
  newChat: async (req, res) => {
    const { id } = req.user.detailUser
    const { id_receiver, chat } = req.body
    const result = await Chat.create({ id_sender: id, id_receiver: id_receiver, message: chat})
    console.log(result.dataValues)
    responseStandard(res, 'Message send', {result}, 200, true)
  }
}