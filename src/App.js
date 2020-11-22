const express = require('express')
const bodyParser = require('body-parser')
const morgan = require('morgan')
const cors = require('cors')

const app = express()
const { APP_PORT } = process.env

app.use(bodyParser.urlencoded({ extended: false }))
app.use(morgan('dev'))
app.use(cors())

// import static files
app.use('/uploads', express.static('assets/uploads'))

// const tokenAuth = require('./middleware/auth')

const authRoute = require('./routes/auth')
const userRoute = require('./routes/users')

app.use('/auth', authRoute)
app.use('/users', userRoute)
// app.use('/news', tokenAuth, newsRoute)
// app.use('/bookmarks', tokenAuth, bookmarksRoute)

app.listen(APP_PORT, () => {
  console.log(`App listen on port ${APP_PORT}`)
})