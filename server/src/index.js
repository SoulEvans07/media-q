//import main from './main'
import { port, env } from './config/vars'
import server from './config/express'

server.listen(port, () => console.log('App running on: localhost:' + port + ' env: ' + env));
