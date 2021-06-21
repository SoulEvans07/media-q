import cron from 'node-cron'

import polyfills from './polyfills'
import { port, env } from './config/vars'
import server, { io } from './config/express'
import { main } from './main'

server.listen(port, () => console.log('App running on: localhost:' + port + ' env: ' + env))


cron.schedule('0 3,7,11,15,19,23 * * *', () => {
  main(io)
    .then(result => console.log(result))
    .catch(e => console.log(e.message))
})
