const express = require('express')
const bodyParser = require('body-parser')
const morgan = require('morgan')
const cors = require('cors')

const app = express()
const { APP_PORT } = process.env

// add socket
const server = require('http').createServer(app)
const io = require('socket.io')(server, {})
module.exports = io
io.on('connection', () => {
  console.log('A user connected to our socket')
})

app.use(bodyParser.urlencoded({ extended: false }))
app.use(morgan('dev'))
app.use(cors())

// import static files
app.use('/uploads', express.static('assets/uploads'))

const tokenAuth = require('./middleware/auth')

const authRoute = require('./routes/auth')
const userRoute = require('./routes/users')
const msgRoute = require('./routes/message')

app.use('/auth', authRoute)
app.use('/users', tokenAuth, userRoute)
app.use('/message', tokenAuth, msgRoute)

app.get('/', (req, res) => {
  return res.send('socket') 
})

server.listen(APP_PORT, () => {
  console.log(`App listen on port ${APP_PORT}`)
})