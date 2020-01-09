import fs from 'fs'
import checkDiskSpace from 'check-disk-space'
import getSize from 'get-folder-size'
import cron from 'node-cron'
import Instagram from './instagram-api'

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


const readSessionFile = function(sessionFilePath) {
  if (fs.existsSync(sessionFilePath)) {
    console.log('[read]')
    const content = fs.readFileSync(sessionFilePath)
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

const writeSessionFile = function(instance, sessionFilePath) {
  const session = {
    username: instance.username,
    csrfToken: instance.csrfToken,
    sessionId: instance.sessionId,
    essentialValues: instance.essentialValues,
    rollout_hash: instance.rollout_hash
  }
  console.log('[write]', session.username)
  fs.writeFileSync(sessionFile, JSON.stringify(session))
}

const getInstagramInstance = async function(credentials, sessionFilePath) {
  const sessionObject = readSessionFile(sessionFilePath)
  const instagram = new Instagram(sessionObject && credentials.username === sessionObject.username ? sessionObject : null)

  if (!instagram.sessionId) {
    console.log('[login]', credentials.username)
    await instagram.login(credentials)

    if (instagram.sessionId) {
      writeSessionFile(instagram, sessionFilePath)
    }
  }

  return instagram
}

const follow = async function(follow_id) {
  const instagram = await getInstagramInstance(instagram_cred, sessionFile)

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
    console.log('follow', res.status, res.statusText, '\n', res.url || res.request.path)
  }

  followed_users = await instagram.getFollowedUsers()
  console.log(followed_users.map(u => u.username))
}

follow(304981900)


