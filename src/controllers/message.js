const { User, Chat } = require('../models')
const { Op } = require("sequelize")
const responseStandard = require('../helpers/response')

module.exports = {
  showChat: async (req, res) => {
    const { id } = req.user.detailUser
    const { friend } = req.params
    const chat = await Chat.findAll({
      attributes: { exclude: 'updatedAt' },
      where: { [Op.and]: [
        { [Op.or]: [{ id_sender: id }, { id_receiver: id }] },
        { [Op.or]: [{ id_sender: friend }, { id_receiver: friend }] }
      ]},
      order: [['createdAt', 'DESC']]
    })
    if(chat.length>0) {
      responseStandard(res, 'Message list', {chat}, 200, true)
    } else { 
      responseStandard(res, 'No message found', {}, 400, false)
    }
  },
  allChat0:  async (req, res) => {
    const { id } = req.user.detailUser
    const friend = [0, 1, 2,3,4,5,6,7,8,9]
    const chat = await Chat.findAll({
      attributes: { exclude: 'updatedAt' },
      where: { [Op.and]: [
        { [Op.or]: [{ id_sender: id }, { id_receiver: id }] },
        { [Op.or]: [{ id_sender: friend }, { id_receiver: friend }] }
      ]},
      order: [['createdAt', 'DESC']]
    })
    // const mapping = chat.map((item, index)=>{
    //   let sender = item.id_sender
    //   item.map
    //   if(sender===6){
    //     return index
    //   }
    // })
    // console.log(mapping)
    responseStandard(res, 'List Messages', {chat}, 200, true)
  },
  allChat:  async (req, res) => {
    const { id } = req.user.detailUser
    const chat = await Chat.findAll({
      // attributes: {
      //   exclude: 'id_sender'
      // },
      where: { 
        [Op.or]: [{ id_sender: id }, { id_receiver: id }]
      },
      // group: 'id_sender',
      order: [['createdAt', 'DESC']]
    })
    // const mapping = chat.map((item, index)=>{
    //   let sender = item.id_sender
    //   item.map
    //   if(sender===6){
    //     return index
    //   }
    // })
    // console.log(mapping)
    responseStandard(res, 'List Messages', {chat}, 200, true)
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