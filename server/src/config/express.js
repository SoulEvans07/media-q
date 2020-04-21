import express from 'express'
import http from 'http'
import socketIO from 'socket.io'
import _ from 'lodash'
import bodyParser from 'body-parser'
import morgan from 'morgan'
import helmet from 'helmet'
import cors from 'cors'
import requireAll from 'require-all'

import { publicPath, routesPath, logs } from './vars'

const app = express()
app.use(express.json())

const server = http.createServer(app)
export const io = socketIO(server)
app.use((req, res, next) => {
  req.io = io
  next()
})


//app.use(morgan(logs))
app.use(cors())

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json({ limit: '5mb' }))

app.use(helmet())
app.use('/static', express.static(publicPath))

const router = express.Router()
const routes = requireAll({
  dirname: routesPath,
  filter: /.+\.js$/,
  resolve: (r) => r.default
})

_.mapValues(routes, (value, key) => {
  const path = key.replace('.js', '')
  router.use('/api/' + path, value)
})

app.use(router)

export default server
