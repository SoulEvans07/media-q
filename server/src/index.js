import fs from 'fs'
import checkDiskSpace from 'check-disk-space'
import getSize from 'get-folder-size'
import cron from 'node-cron'
import Instagram from './instagram-api'
import Instagram2 from 'instagram-nodejs-without-api'

import { instagram_cred } from './config/vars'
import { login } from './instagramLogin'
import { 
  getStoryUrls, 
  downloadAllOf, 
  downloadAll, 
  getFollowedUsers,
  followUser
} from './instagramDownloader'

Number.prototype.pad = function(length, char = '0') { return String(this).padStart(length, char) }

/*
login(instagram_cred).then(cookies => {
  if (cookies) {
    getStoryUrls(cookies).then(storiesByUser => {
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

const my_follow = function() {
  const target = __dirname + '/../target/instagram/'
  login(instagram_cred).then(async cookies => {
    if (cookies) {
      //downloadAllOf(cookies, 'bukkitbrown', target).then(() => console.log('Done'))
      //downloadAll(cookies, target).then(() => console.log('Done'))

      const user_id = "175081363"
      //const user_id = "304981900"
      followUser(cookies, user_id)
        .then(res => console.log('[res]', res.status))
        .catch(e => console.log('[error]', e.message))
      .then(async () => {
        const followed_users = await getFollowedUsers(cookies)
        console.log(followed_users.map(u => u.username))
      })
    } else {
      console.log('no session cookie')
    }
  }).catch(err => {
    console.log(err)
  })
}

//const cookies = `target=""; Domain=instagram.com; expires=Thu, 01-Jan-1970 00:00:00 GMT; Max-Age=0; Path=/;target=""; Domain=.instagram.com; expires=Thu, 01-Jan-1970 00:00:00 GMT; Max-Age=0; Path=/;target=""; Domain=i.instagram.com; expires=Thu, 01-Jan-1970 00:00:00 GMT; Max-Age=0; Path=/;target=""; Domain=.i.instagram.com; expires=Thu, 01-Jan-1970 00:00:00 GMT; Max-Age=0; Path=/;target=""; Domain=www.instagram.com; expires=Thu, 01-Jan-1970 00:00:00 GMT; Max-Age=0; Path=/;target=""; Domain=.www.instagram.com; expires=Thu, 01-Jan-1970 00:00:00 GMT; Max-Age=0; Path=/;target=""; expires=Thu, 01-Jan-1970 00:00:00 GMT; Max-Age=0; Path=/;csrftoken=1N5d38qAvMXxRFfei1OEts6pkzKQXaMs; Domain=.instagram.com; expires=Thu, 07-Jan-2021 03:58:23 GMT; Max-Age=31449600; Path=/; Secure;ig_did=CC4DDE8E-A659-42D7-8B24-C26D64854BE0; Domain=.instagram.com; expires=Sun, 06-Jan-2030 03:58:23 GMT; HttpOnly; Max-Age=315360000; Path=/; Secure;rur=ATN; Domain=.instagram.com; HttpOnly; Path=/; Secure;mid=Xhak3QAEAAH_4S1Z1q8t29K48QLH; Domain=.instagram.com; expires=Sun, 06-Jan-2030 03:58:23 GMT; Max-Age=315360000; Path=/; Secure;ds_user_id=28080608909; Domain=.instagram.com; expires=Wed, 08-Apr-2020 03:58:23 GMT; Max-Age=7776000; Path=/; Secure;sessionid=28080608909%3AQY1cP0kqpf6mnF%3A6; Domain=.instagram.com; expires=Fri, 08-Jan-2021 03:58:23 GMT; HttpOnly; Max-Age=31536000; Path=/; Secure`
//const cookies = await login(instagram_cred)
//instagram.csrfToken = cookies.match(/csrftoken=\S*/)[0]
//instagram.csrfToken = instagram.csrfToken.substring('csrftoken='.length, instagram.csrfToken.length-1)
//instagram.sessionId = cookies.match(/sessionid=\S*/)[0]
//instagram.sessionId = instagram.sessionId.substring('sessionid='.length, instagram.sessionId.length-1)

const instagram = new Instagram()
const follow = async function() {
  console.log(instagram_cred)

  instagram.csrfToken = await instagram.getCsrfToken()
  instagram.sessionId = await instagram.auth(instagram_cred)

  console.log(instagram.csrfToken)
  console.log(instagram.sessionId)

  const res = await instagram.follow(304981900)
  console.log(res.status, res.statusText)
  //console.log(instagram.essentialValues)
}

follow().then(async () => {
  //const cookies = await login(instagram_cred)
  const followed_users = await instagram.getFollowedUsers()
  console.log(followed_users.map(u => u.username))

  const followers = await instagram.getFollowers()
  console.log(followers.map(u => u.username))
})


const download_all = function() {
  const target = __dirname + '/../target/instagram/'
  login(instagram_cred).then(async cookies => {
    if (cookies) {
      //downloadAllOf(cookies, 'bukkitbrown', target).then(() => console.log('Done'))
      downloadAll(cookies, target).then(() => console.log('Done'))
    } else {
      console.log('no session cookie')
    }
  }).catch(err => {
    console.log(err)
  })
}

//download_all()

const get_followers = function() {
  login(instagram_cred).then(async cookies => {
    if (cookies) {
      let followed_users = await getFollowedUsers(cookies, 28080608909)
      followed_users = followed_users.map(u => { return { username: u.username, id: u.id } })
      //console.log(followed_users.find(u => u.username === "mqueue.dev"))
      console.log(followed_users)
    } else {
      console.log('no session cookie')
    }
  }).catch(err => {
    console.log(err)
  })
}

//get_followers()