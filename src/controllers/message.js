const { User, Chat } = require('../models')
const { Op } = require("sequelize")
const responseStandard = require('../helpers/response')

module.exports = {
  showChat: async (req, res) => {
    const { id } = req.user.detailUser
    const { id1, id2 } = req.params
    const chat = await Chat.findAll({
      attributes: { exclude: 'updatedAt' },
      where: { [Op.and]: [
        { [Op.or]: [{ id_sender: id1 }, { id_receiver: id1 }] },
        { [Op.or]: [{ id_sender: id2 }, { id_receiver: id2 }] }
      ]},
      order: [['createdAt', 'DESC']]
    })
    console.log(chat)
    if(chat.length>0) {
      responseStandard(res, 'Message list', {chat}, 200, true)
    } else { 
      responseStandard(res, 'No message found', {}, 400, false)
    }
  },
  allChat:  async (req, res) => {
    const { id } = req.user.detailUser
    const chat = await Chat.findAll({
      include: { model: User, attributes: { exclude: ['createdAt', 'updatedAt'] } },
      attributes: { exclude: 'updatedAt' },
      where: { 
        [Op.or]: [{ id_sender: id }, { id_receiver: id }], 
        isLatest: true 
      },
      order: [['createdAt', 'DESC']]
    })
    responseStandard(res, 'List Messages', {chat}, 200, true)
  },
  postNewChat: async (req, res) => {
    const { id } = req.user.detailUser
    const { id_receiver, chat } = req.body
    let private = await Chat.findAll({
      attributes: { exclude: 'updatedAt' },
      where: { [Op.and]: [
        { [Op.or]: [{ id_sender: id }, { id_receiver: id }] },
        { [Op.or]: [{ id_sender: id_receiver }, { id_receiver: id_receiver }] }
      ]},
      order: [['createdAt', 'DESC']]
    })
    await Chat.update({isLatest: false}, {
      where: { 
        id_sender: {
          [Op.or]: [id, id_receiver]
        },
        id_receiver: {
          [Op.or]: [id, id_receiver]
        },
        isLatest: true 
      }
    })
    // if(private.length>1){
    //   await Chat.Update({isLatest: false}, {
    //     where: { [Op.and]: [
    //       { [Op.or]: [{ id_sender: id }, { id_receiver: id }] },
    //       { [Op.or]: [{ id_sender: id_receiver }, { id_receiver: id_receiver }] }
    //     ]}
    //   })
    // }    
    await Chat.create({ id_sender: id, id_receiver: id_receiver, message: chat, isLatest: true })
    private = await Chat.findAll({
      attributes: { exclude: 'updatedAt' },
      where: { [Op.and]: [
        { [Op.or]: [{ id_sender: id }, { id_receiver: id }] },
        { [Op.or]: [{ id_sender: id_receiver }, { id_receiver: id_receiver }] }
      ]},
      order: [['createdAt', 'DESC']]
    })
    responseStandard(res, 'Message send', { private }, 200, true)
  },
  newChat: async (req, res) => {
    const { id } = req.user.detailUser
    const { id_receiver, chat } = req.body
    let privateChat = await Chat.findAll({
      attributes: { exclude: 'updatedAt' },
      where: { [Op.and]: [
        { [Op.or]: [{ id_sender: id }, { id_receiver: id }] },
        { [Op.or]: [{ id_sender: id_receiver }, { id_receiver: id_receiver }] }
      ]},
      order: [['createdAt', 'DESC']]
    })
    if(privateChat.length>1){
      console.log('chat receive and send 1')
    } else {
      privateChat = await Chat.findAll({
        attributes: { exclude: 'updatedAt', include: 'isLatest' },
        where: { [Op.or]: [{ id_sender: id }, { id_receiver: id }]},
        order: [['createdAt', 'DESC']]
      })
    }
    const update = privateChat.map(item=>{
      item.isLatest = false
      item.save()
      return item.isLatest
    })
    const result = await Chat.create({ id_sender: id, id_receiver: id_receiver, message: chat, isLatest: true })
    let allChat = await Chat.findAll({
      attributes: { exclude: 'updatedAt', include: 'isLatest' },
      where: { [Op.and]: [
        { [Op.or]: [{ id_sender: id }, { id_receiver: id }] },
        { [Op.or]: [{ id_sender: id_receiver }, { id_receiver: id_receiver }] }
      ]},
      order: [['createdAt', 'DESC']]
    })
    if(allChat.length>1){
      console.log('chat receive and send 2')
    } else {
      allChat = await Chat.findAll({
        attributes: { exclude: 'updatedAt' },
        where: { [Op.or]: [{ id_sender: id }, { id_receiver: id }]},
        order: [['createdAt', 'DESC']]
      })
    }
    responseStandard(res, 'Message send', {allChat, allListChat}, 200, true)
  },
  deleteChat: async (req, res) => {
    // const { id } = req.user.detailUser
    const { id } = req.params
    const result = await Chat.findByPk(id)
    await result.destroy()
    responseStandard(res, 'Chat deleted', {}, 200, true)
  }
}