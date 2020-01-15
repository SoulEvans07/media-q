/* based on https://github.com/yatsenkolesh/instagram-nodejs */
import fetch from 'node-fetch'
import formData from 'form-data'
import path from 'path'
import qs from 'qs'
import fs from 'fs'

import { searchCookie, downloadFile, getTimestampString, getDateString } from './helpers'

export class Instagram {

  constructor(serialObj) {
    if (serialObj) {
      this.username = serialObj.username
      this.csrfToken = serialObj.csrfToken
      this.sessionId = serialObj.sessionId
      this.essentialValues = serialObj.essentialValues
      this.rollout_hash = serialObj.rollout_hash
    } else {
      this.csrfToken = undefined
      this.sessionId = undefined

      this.essentialValues =  {
        sessionid   : undefined,
        ds_user_id  : undefined,
        csrftoken   : undefined,
        shbid       : undefined,
        rur         : undefined,
        mid         : undefined,
        shbts       : undefined,
        mcd         : undefined,
        ig_cb       : 1,
        //urlgen      : undefined //this needs to be filled in according to my RE
      }

      this.rollout_hash = undefined
    }

    this.userAgent = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.117 Safari/537.36'
    this.userIdFollowers = {}
    this.userIdFollows = {}

    this.baseHeader = {
      'accept-langauge': 'en-US;q=0.9,en;q=0.8,es;q=0.7',
      'origin': 'https://www.instagram.com',
      'referer': 'https://www.instagram.com/',
      'upgrade-insecure-requests': '1',
      'user-agent': this.userAgent,
    }
  }


  generateCookie(simple){
    if (simple) return 'ig_cb=1'

    let cookie = ''
    const length = Object.keys(this.essentialValues).length
    Object.entries(this.essentialValues).forEach((entry, i) => {
      const key = entry[0]
      const value = entry[1]

      if (value !== undefined) {
        cookie += key + '=' + value + (i < length - 1 ? '; ' : '')
      }
    })

    return cookie
  }

  combineWithBaseHeader(data){
    return Object.assign({ ...this.baseHeader }, data)
  }

  getCsrfToken() {
    return fetch('https://www.instagram.com', {
      method: 'get',
      headers: this.combineWithBaseHeader({
        'accept': 'text/html,application/xhtml+xml,application/xml;q0.9,image/webp,image/apng,*.*;q=0.8',
        'accept-encoding': 'gzip, deflate, br',
        'cookie': this.generateCookie(true)
      })
    }).then(res => {
      this.updateEssentialValues(res.headers._headers['set-cookie'].join(';'))
      return res.text()
    }).then(html => {
      this.updateEssentialValues(html, true)
      return this.essentialValues.csrftoken
    }).catch((e) =>
      console.log('Failed to get instagram csrf token\n', e)
    )
  }

  auth({ username, password }) {
    this.username = username

    const formdata = qs.stringify({ username, password, queryParams: {} })
    const options = {
      method  : 'post',
      body    : formdata,
      headers : this.combineWithBaseHeader({
        'accept'            : '*/*',
        'accept-encoding'   : 'gzip, deflate, br',
        'content-length'    : formdata.length,
        'content-type'      : 'application/x-www-form-urlencoded',
        'cookie'            : 'ig_cb=' + this.essentialValues.ig_cb,
        'x-csrftoken'       : this.csrfToken,
        'x-instagram-ajax'  : this.rollout_hash,
        'x-requested-with'  : 'XMLHttpRequest',
      })
    }

    return fetch('https://www.instagram.com/accounts/login/ajax/', options)
      .then(res => {
        this.updateEssentialValues(res.headers._headers['set-cookie'].join(';'))
        return this.essentialValues.sessionid
      }).catch((e) =>
        console.log('Instagram authentication failed (challenge required error):\n', e)
      )
  }

  async login(credentials) {
    this.csrfToken = await this.getCsrfToken()
    console.log('csrfToken:', this.csrfToken)

    this.sessionId = await this.auth(credentials)
    console.log('sessionId:', this.sessionId)
  }

  updateEssentialValues(src, isHTML){
    if (!isHTML){
      const keys = Object.keys(this.essentialValues)

      keys.forEach(key => {
        if (!this.essentialValues[key]) {
          const value = searchCookie(src, key)
          this.essentialValues[key] = value !== '""' ? value : undefined
        }
      })
    } else {
      let subStr = src

      const startStr = '<script type="text/javascript">window._sharedData = '
      let start = subStr.indexOf(startStr) + startStr.length
      subStr = subStr.substr(start, subStr.length)

      subStr = subStr.substr(0, subStr.indexOf('</script>') - 1)

      const json = JSON.parse(subStr)

      this.essentialValues.csrftoken = json.config.csrf_token;
      this.rollout_hash = json.rollout_hash
    }
  }

  getUserDataByUsername(username) {
    const fetch_data = {
      method: 'get',
      headers: this.combineWithBaseHeader({
        'accept': 'text/html,application/xhtml+xml,application/xml;q0.9,image/webp,image/apng,*.*;q=0.8',
        'accept-encoding': 'gzip, deflate, br',
        'cookie': this.generateCookie()
      })
    }

    return fetch('https://www.instagram.com/' + username, fetch_data)
      .then(res => res.text()
      .then(function (data) {
        //console.log(data)

        const regex = /window\._sharedData = (.*);<\/script>/;
        const match = regex.exec(data);
        if (typeof match[1] === 'undefined') {
          return '';
        }
        return JSON.parse(match[1]).entry_data.ProfilePage[0];
      }))
  }

  isUserPrivate(username) {
    return this.getUserDataByUsername(username).then(data => data.user.is_private)
  }

  isUserIdPrivate(id) {
    return this.getUserDataById(id).then(data => data.user.is_private)
  }

  async getFollowedUsers(userId) {
    let follows = []
    let has_next = true
    let after = ''

    if (!userId) {
      userId = this.essentialValues.ds_user_id
    }

    while(has_next) {
      const requestVariables = {
        id: userId,
        include_reel: false,
        fetch_mutual: false,
        first: 50,
        after
      }

      const requestUrl = 'https://www.instagram.com/graphql/query/?query_hash=d04b0a864b4b54837c0d870b0e77e076' +
        '&variables=' + encodeURIComponent(JSON.stringify(requestVariables))

      const response = await fetch(requestUrl, {
        method: 'get',
        headers: this.combineWithBaseHeader({
          'accept': 'text/html,application/xhtml+xml,application/xml;q0.9,image/webp,image/apng,*.*;q=0.8',
          'accept-encoding': 'gzip, deflate, br',
          'cookie': this.generateCookie()
        })
      }).then(res => res.json())

      const edge_follow = response.data.user.edge_follow
      follows = follows.concat(edge_follow.edges)
      has_next = edge_follow.page_info.has_next_page
      after = edge_follow.page_info.end_cursor
    }

    this.userIdFollows[userId] = follows.map(u => u.node)
    return this.userIdFollows[userId]
  }

  async getFollowers(userId) {
    let followers = []
    let has_next = true
    let after = ''

    if (!userId) {
      userId = this.essentialValues.ds_user_id
    }

    while(has_next) {
      const requestVariables = {
        id: userId,
        include_reel: false,
        fetch_mutual: false,
        first: 50,
        after
      }

      const requestUrl = 'https://www.instagram.com/graphql/query/?query_hash=56066f031e6239f35a904ac20c9f37d9' +
        '&variables=' + encodeURIComponent(JSON.stringify(requestVariables))

      const response = await fetch(requestUrl, {
        method: 'get',
        headers: this.combineWithBaseHeader({
          'accept': 'text/html,application/xhtml+xml,application/xml;q0.9,image/webp,image/apng,*.*;q=0.8',
          'accept-encoding': 'gzip, deflate, br',
          'cookie': this.generateCookie()
        })
      }).then(res => res.json())

      const edge_followed_by = response.data.user.edge_followed_by
      followers = followers.concat(edge_followed_by.edges)
      has_next = edge_followed_by.page_info.has_next_page
      after = edge_followed_by.page_info.end_cursor
    }

    this.userIdFollowers[userId] = followers.map(u => u.node)
    return this.userIdFollowers[userId]
  }

  getDefaultHeaders() {
    return {
      'referer': 'https://www.instagram.com',
      'origin': 'https://www.instagram.com',
      'user-agent': this.userAgent,
      'x-instagram-ajax': '1',
      'x-requested-with': 'XMLHttpRequest',
      'x-csrftoken': this.csrfToken,
      'cookie': this.generateCookie()
    }
  }

  follow(userId) {
    const requestUrl = `https://www.instagram.com/web/friendships/${userId}/follow`
    return fetch(requestUrl, {
      method: 'post',
      headers: this.getDefaultHeaders()
    })
  }

  unfollow(userId) {
    const requestUrl = `https://www.instagram.com/web/friendships/${userId}/unfollow`
    return fetch(requestUrl, {
      method: 'post',
      headers: this.getDefaultHeaders()
    })
  }

  getUserDataById(id) {
    let query = 'ig_user(' + id + '){id,username,external_url,full_name,profile_pic_url,biography,followed_by{count},follows{count},media{count},is_private,is_verified}'

    let form = new formData()
    form.append('q', query)

    return fetch('https://www.instagram.com/query/', {
      method: 'post',
      body: form,
      headers: this.getDefaultHeaders()
    }).then(res => res.json())
  }

  getStoryUrls() {
    const storyUserReqVariables = {
      only_stories: true,
      stories_prefetch: false,
      stories_video_dash_manifest: false
    }

    const storyUserReqUrl = 'https://www.instagram.com/graphql/query/' +
      '?query_hash=5ff0ea71b469b0c684df3e608a5af0b3' +
      '&variables=' + JSON.stringify(storyUserReqVariables)

    const headers = {
      'accept': 'application/json',
      'referer': 'https://www.instagram.com',
      'origin': 'https://www.instagram.com',
      'user-agent': this.userAgent,
      'x-instagram-ajax': '1',
      'x-requested-with': 'XMLHttpRequest',
      'x-csrftoken': this.csrfToken,
      'cookie': this.generateCookie()
    }

    return new Promise((resolve, reject) => {
      fetch(storyUserReqUrl, {
        method: 'get',
        headers: headers
      }).then(res => res.json()).then(res => {
        const storyNodes = res.data.user.feed_reels_tray.edge_reels_tray_to_reel.edges
        const users = []

        storyNodes.forEach(storyNode => {
          const userName = storyNode.node.user.username
          const userId = storyNode.node.user.id

          users.push(userId)
        })

        const storyReqVariables = {
          reel_ids: users,
          tag_names: [],
          location_ids: [],
          highlight_reel_ids: [],
          precomposed_overlay: false,
          show_story_viewer_list: true,
          story_viewer_fetch_count: 50,
          story_viewer_cursor: "",
          stories_video_dash_manifest: false
        }

        const storyReqUrl = 'https://www.instagram.com/graphql/query/' +
          '?query_hash=52a36e788a02a3c612742ed5146f1676'+
          '&variables=' + JSON.stringify(storyReqVariables)

        fetch(storyReqUrl, {
          url: storyReqUrl,
          method: 'get',
          headers: headers
        }).then(res => res.json()).then(response => {
          const reelsMedia = response.data.reels_media
          const stories = {}

          if(!reelsMedia) {
            console.log(response)
          }

          reelsMedia.forEach(media => {
            const userName = media.user.username
            const items = media.items

            stories[userName] = items.map(item => {
              const display_resources = item.display_resources

              if (item.is_video) {
                const video_resources = item.video_resources

                return {
                  timestamp: item.taken_at_timestamp,
                  is_video: true,
                  has_audio: item.has_audio,
                  thumbnail: display_resources[0].src,
                  video: video_resources[video_resources.length-1].src
                }
              } else {
                return {
                  timestamp: item.taken_at_timestamp,
                  is_video: false,
                  thumbnail: display_resources[0].src,
                  image: display_resources[display_resources.length-1].src
                }
              }
            })
          })

          resolve(stories)
        }).catch(err => reject(err))
      }).catch(err => reject(err))
    })
  }

  downloadStoryItem(username, item, targetFolder) {
    return new Promise((resolve, reject) => {
      let src = null
      let fileName = null
      const datetime = new Date(item.timestamp * 1000)

      if (item.is_video) {
        src = item.video
        fileName = username + '-' + getTimestampString(datetime) + '.mp4'
      } else {
        src = item.image
        fileName = username + '-' + getTimestampString(datetime) + '.jpg'
      }

      if (src) {
        const filePath = path.join(targetFolder, getDateString(datetime), fileName)
        try {
          if (fs.existsSync(filePath)){
            resolve({ fileName, skipped: true })
          } else {
            downloadFile(src, filePath).then(() => resolve({ fileName, skipped: false }))
          }
        } catch(e) {
          reject(e)
        }
      }
    })
  }
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
  fs.writeFileSync(sessionFilePath, JSON.stringify(session))
}

export const createInstance = async function(credentials, sessionFilePath) {
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
