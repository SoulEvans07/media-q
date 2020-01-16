import polyfills from './polyfills'
import { port, env } from './config/vars'
import server from './config/express'

//import main from './main'

server.listen(port, () => console.log('App running on: localhost:' + port + ' env: ' + env));
