const { User, Chat, Notification } = require('../models')
const { Op } = require("sequelize")
const responseStandard = require('../helpers/response')
const { pagination } = require('../helpers/pagination')
// const socket = require('../helpers/socket')
const io = require('../App')
const admin = require('firebase-admin')
const serviceAccount = require('../config/textme-312ad-firebase-adminsdk-ho0u0-50beee19eb.json')

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://textme-312ad.firebaseio.com"
});

module.exports = {
  showChat: async (req, res) => {
    const { id } = req.user.detailUser
    const { id1, id2 } = req.params
    const { token } = req.body
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

    let findToken = await Notification.findAll({where: { id_user: id } })
    console.log(findToken)
    if(findToken==null || findToken.length==0){
      const create = await Notification.create({ id_user: id, token: token})
      console.log(create)
    } else {
      const update = await Notification.update({ token: token }, {where: { id_user: id } })
      console.log(update)
    }
    // findToken = await Notification.findAll({where: { id_user: id } })

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
    const send = await Chat.create({ id_sender: id, id_receiver: id_receiver, message: chat, isLatest: true })
    const sender = await User.findByPk(id)
    private = await Chat.findAll({
      attributes: { exclude: 'updatedAt' },
      where: { [Op.and]: [
        { [Op.or]: [{ id_sender: id }, { id_receiver: id }] },
        { [Op.or]: [{ id_sender: id_receiver }, { id_receiver: id_receiver }] }
      ]},
      order: [['createdAt', 'DESC']]
    })
    // console.log(sender.dataValues.username)
    let {username} = sender.dataValues
    username == null ? username='New user' : null
    io.emit(id_receiver, {id_sender: id, chat})

    const findToken = await Notification.findAll({where: { id_user: id } })
    // console.log(findToken[0].dataValues)

    admin.messaging().send({
      token: findToken[0].dataValues.token,
      // topic: 'message',
      notification: {
        title: username,
        body: send.dataValues.message,
      }
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