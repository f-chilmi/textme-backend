const { User, Chat } = require('../models')
const { Op } = require("sequelize")
const responseStandard = require('../helpers/response')
const { pagination } = require('../helpers/pagination')
// const socket = require('../helpers/socket')
const io = require('../App')

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
    const user1 = await User.findByPk(id1)
    const user2 = await User.findByPk(id2)
    if(chat.length>0) {
      responseStandard(res, 'Message list', {user1, user2, chat}, 200, true)
    } else { 
      responseStandard(res, 'No message found', {user1, user2}, 200, true)
    }
  },
  allChat0: async (req, res) => {
    const { page = 1, limit = 10, search = '' } = req.query
    const offset = (page - 1) * limit
    const { id } = req.user.detailUser
    const chat = await Chat.findAndCountAll({
      include: [
        {model: User, as: 'sender', attributes: { exclude: ['createdAt', 'updatedAt'] }},
        {model: User, as: 'receiver', attributes: { exclude: ['createdAt', 'updatedAt'] }},
      ],
      attributes: { exclude: 'updatedAt' },
      where: { 
        [Op.or]: [{ id_sender: id }, { id_receiver: id }], 
        isLatest: true,
        message: { [Op.substring]: search },
      },
      offset: parseInt(offset),
      limit: parseInt(limit),
      order: [['createdAt', 'DESC']]
    })
    const pageInfo = pagination('message', req.query, page, limit, chat.count)
    responseStandard(res, 'List Messages', {chat, pageInfo}, 200, true)
  },
  allChat:  async (req, res) => {
    const { id } = req.user.detailUser
    const chat = await Chat.findAll({
      include: [
        {model: User, as: 'sender', attributes: { exclude: ['createdAt', 'updatedAt'] }},
        {model: User, as: 'receiver', attributes: { exclude: ['createdAt', 'updatedAt'] }},
      ],
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
    await Chat.create({ id_sender: id, id_receiver: id_receiver, message: chat, isLatest: true })
    private = await Chat.findAll({
      attributes: { exclude: 'updatedAt' },
      where: { [Op.and]: [
        { [Op.or]: [{ id_sender: id }, { id_receiver: id }] },
        { [Op.or]: [{ id_sender: id_receiver }, { id_receiver: id_receiver }] }
      ]},
      order: [['createdAt', 'DESC']]
    })
    io.emit(id_receiver, {id_sender: id, chat})
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