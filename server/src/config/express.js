import express from 'express'
import _ from 'lodash'
import bodyParser from 'body-parser'
import morgan from 'morgan'
import helmet from 'helmet'
import cors from 'cors'
import requireAll from 'require-all'

import { publicPath, routesPath, logs } from './vars'

const app = express()
app.use(express.json())

app.use(morgan(logs))
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

export default app
