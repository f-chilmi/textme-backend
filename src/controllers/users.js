const { User } = require('../models')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const responseStandard = require('../helpers/response')

module.exports = {
  registerUser: async (req, res) => {
    const {phone, username, picture} = req.body
    const result = await User.findAll({ where: { phone: phone }})
    if(result.length>0){
      const detailUser = {
        id: result[0].id,
        phone: result[0].phone
      }
      const token = jwt.sign({ detailUser }, process.env.APP_KEY, { expiresIn: '1 days' })
      responseStandard(res, 'User Logged In', {token}, 200, true)
    } else {
       const userRegistered = await User.create({phone: phone, username: username, picture: picture})
       console.log(userRegistered.dataValues.id)
      const detailUser = {
        id: userRegistered.dataValues.id,
        phone: userRegistered.dataValues.phone
      }
      const token = jwt.sign({ detailUser }, process.env.APP_KEY, { expiresIn: '1 days' })
      responseStandard(res, 'Success Registered', {token}, 200, true)
    }
  },
  showUser: async (req, res) => {
    const result = await User.findAll()
    responseStandard(res, 'List users', {result}, 200, true)
  }
}