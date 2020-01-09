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

const targetFolder = __dirname + '/../target/'
const sessionFile = targetFolder + 'instagram/.session'

const main = async function() {
  const instagram = new Instagram()
  await instagram.login(instagram_cred)


}
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

const readSessionFile = function() {
  if (fs.existsSync(sessionFile)) {
    console.log('[read]')
    const content = fs.readFileSync(sessionFile)
    try {
      const session = JSON.parse(content)
      return session
    } catch (e) {
      return null
    }
  } else {
    return null
  }
}

const writeSessionFile = function(session) {
  console.log('[write]', session.essentialValues.ds_user_id)
  fs.writeFileSync(sessionFile, JSON.stringify(session))
}

const getInstagramInstance = async function() {
  const sessionObject = readSessionFile()
  const instagram = new Instagram(sessionObject)

  if (!instagram.sessionId) {
    console.log('[login]', instagram_cred.username)
    await instagram.login(instagram_cred)
  }

  if (!sessionObject) {
    writeSessionFile(instagram)
  }

  return instagram
}

const follow = async function(follow_id) {
  const instagram = await getInstagramInstance()

  let followed_users = await instagram.getFollowedUsers()
  console.log(followed_users.map(u => `${u.username}: ${u.id}`))

  let follow_user = followed_users.find(u => parseInt(u.id) === follow_id)

  if (follow_user) {
    console.log('found:', `${follow_user.username}: ${follow_user.id}`)
    const res = await instagram.unfollow(follow_id)
    console.log('unfollow', res.status, res.statusText)
  } else {
    console.log('found:', follow_user)
    const res = await instagram.follow(follow_id)
    console.log('follow', res.status, res.statusText)
  }

  followed_users = await instagram.getFollowedUsers()
  console.log(followed_users.map(u => u.username))
}

follow(304981900)


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