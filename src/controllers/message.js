const { User, Chat } = require('../models')
const responseStandard = require('../helpers/response')

module.exports = {
  showChat: async (req, res) => {
    const { id } = req.user.detailUser
    const chatSend = await Chat.findAll({ 
      attributes: {
        exclude: 'updatedAt'
      },
      include: { 
        model: User, 
        attributes: { exclude: ['createdAt', 'updatedAt'] }
      }, 
      where: { id_sender: id }
    })
    const chatReceive = await Chat.findAll({ 
      attributes: {
        exclude: 'updatedAt'
      },
      include: { 
        model: User, 
        attributes: { exclude: ['createdAt', 'updatedAt'] }
      }, 
      where: { id_receiver: id }
    })
    if(chatSend.length>0 || chatReceive.length>0) {
      responseStandard(res, 'Message list', {chatSend, chatReceive}, 200, true)
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
  },
  deleteChat: async (req, res) => {
    // const { id } = req.user.detailUser
    const { id } = req.params
    const result = await Chat.findByPk(id)
    await result.destroy()
    responseStandard(res, 'Chat deleted', {}, 200, true)
  }
}