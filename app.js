import express from 'express'
import path from 'path'
import cookieParser from 'cookie-parser'
import logger from 'morgan'
const __dirname = path.resolve()

const app = express()
import json from './routes/json.js'
import apis from './routes/apis.js'

app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))

app.use('/apis/json', json)
app.use('/apis/', apis)

const port = 5000
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

export default app
