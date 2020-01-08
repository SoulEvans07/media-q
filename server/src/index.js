import fs from 'fs'
import checkDiskSpace from 'check-disk-space'
import getSize from 'get-folder-size'
import cron from 'node-cron'

import { instagram } from './config/vars'
import { getStoryUrls, downloadAllOf, downloadAll } from './instagramDownloader'
import { login } from './instagramLogin'

Number.prototype.pad = function(length, char = '0') { return String(this).padStart(length, char) }

/*
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
*/

/*
cron.schedule('* * * * *', () => {
  console.log(new Date().toLocaleTimeString())

  checkDiskSpace('/home').then((diskSpace) => {
    console.log(diskSpace)
  })

  const target = '/home/soul/Pictures/Wallpapers'
  getSize(target, (err, size) => {
    if (err) { throw err; }
   
    console.log(size + ' bytes');
    console.log((size / 1000 / 1000).toFixed(2) + ' MB');
  })
})
*/

const target = __dirname + '/../target/instagram/'
login(instagram).then(creds => {
  if (creds) {
    //downloadAllOf(creds, 'bukkitbrown', target).then(() => console.log('Done'))
    downloadAll(creds, target).then(() => console.log('Done'))
  } else {
    console.log('no cred')
  }
}).catch(err => {
  console.log(err)
})
