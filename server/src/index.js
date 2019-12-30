import fs from 'fs'

import { instagram } from './config/vars'
import { getStoryUrls } from './instagramDownloader'
import { login } from './instagramLogin'

login(instagram).then(creds => {
  if (creds) {
    getStoryUrls(creds).then(storiesByUser => {
      console.log("number of users:", Object.values(storiesByUser).length)
    }).catch(err => console.log(err))

    const target = __dirname + '/../target/'
    const instagram = 'instagram/'

    if (false) {
      if (!fs.existsSync(target + instagram)){
        fs.mkdirSync(target + instagram)

        const metaFile = '.meta'
        fs.writeFileSync(target+instagram+metaFile, "Hey there!")
      }
    }
  } else {
    console.log("no cred")
  }
}).catch(err => {
  console.log(err)
})