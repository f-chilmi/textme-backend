const { Notification } = require('../models')
const responseStandard = require('../helpers/response')

module.exports = {
  showUser: async (req, res) => {
    const { id } = req.user.detailUser
    const findToken = await Notification.findAll({where: { id_user: id } })
    responseStandard(res, 'Token', {findToken}, 200, true)
  },
  editUser: async (req, res) => {
    const { id } = req.user.detailUser
    const { token } = req.body
    let findToken = await Notification.findAll({where: { id_user: id } })
    // console.log(findToken)
    if(findToken==null || findToken.length==0){
      const create = await Notification.create({ id_user: id, token: token})
      // console.log('token is null')
      // console.log(create)
    } else {
      const update = await Notification.update({ token: token }, {where: { id_user: id } })
      // console.log(update)
    }
    findToken = await Notification.findAll({where: { id_user: id } })
    responseStandard(res, 'Token', {findToken}, 200, true)
  },
  showAll: async (req, res) => {
    const showAll = await Notification.findAll()
    responseStandard(res, 'All token', {showAll}, 200, true)
  }
}