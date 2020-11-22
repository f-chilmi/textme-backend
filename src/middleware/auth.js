require('dotenv').config()
const jwt = require('jsonwebtoken')
const responseStandard = require('../helpers/response')

module.exports = (req, res, next) => {
  const { authorization } = req.headers
  if (authorization && authorization.startsWith('Bearer ')) {
    const token = authorization.slice(7, authorization.length)
    try {
      jwt.verify(token, process.env.APP_KEY, (err, decode) => {
        if (err) {
          return responseStandard(res, 'Not verify', {}, 400, false)
        } else {
          req.user = decode
          next()
        }
      })
    } catch (err) {
      return responseStandard(res, `${err}`, {}, 400, false)
    }
  } else {
    return responseStandard(res, 'Forbidden access', {}, 400, false)
  }
}