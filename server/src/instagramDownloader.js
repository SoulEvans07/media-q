import fs from 'fs'
import axios from 'axios'
import request from 'request'
import fetch from 'node-fetch'

const storyUserReqVariables = {
  only_stories: true,
  stories_prefetch: false,
  stories_video_dash_manifest: false
}

const storyUserReqUrl = 'https://www.instagram.com/graphql/query/' +
  '?query_hash=5ff0ea71b469b0c684df3e608a5af0b3' +
  '&variables=' + JSON.stringify(storyUserReqVariables)


export const getStoryUrls = function(cookies) {
  return new Promise((resolve, reject) => {
    axios({
      url: storyUserReqUrl,
      method: 'GET',
      headers: {
        accept: 'application/json',
        cookie: cookies
      }
    }).then(res => res.data).then(res => {
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
      
      axios({
        url: storyReqUrl,
        method: 'GET',
        headers: {
          accept: 'application/json',
          cookie: cookies
        }
      }).then(res => res.data).then(response => {
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

const download = function(uri, filename){
  return new Promise((resolve, reject) => {
    try {
      request(uri).pipe(fs.createWriteStream(filename)).on('close', resolve)
    } catch (e) {
      reject(e)
    }
  })
}

const IMG_PATTERN = /\/\w*\.jpg/
const VIDEO_PATTERN = /\/\w*\.mp4/

const zeroPad = (num, places) => String(num).padStart(places, '0')
const getTimestampString = function(date) {
  return date.getFullYear() + '-' + (date.getMonth()+1).pad(2) + '-' + date.getDate().pad(2) + '-' +
    date.getHours().pad(2) + date.getMinutes().pad(2) + date.getSeconds().pad(2)
}

const downloadItem = function(user, item, targetFolder) {
  return new Promise((resolve, reject) => {
    let src = null
    let fileName = null
    const datetime = new Date(item.timestamp * 1000)

    if (item.is_video) {
      src = item.video
      fileName = user + '-' + getTimestampString(datetime) + '.mp4'
    } else {
      src = item.image
      fileName = user + '-' + getTimestampString(datetime) + '.jpg'
    }

    if (src) {
      const filePath = targetFolder + fileName
      try {
        if (fs.existsSync(filePath)){
          resolve({ fileName, skipped: true })
        } else {
          download(src, filePath).then(() => resolve({ fileName, skipped: false }))
        }
      } catch(e) {
        reject(e)
      }
    }
  })
}

export const downloadAllOf = function(cookies, userName, targetFolder) {
  if (!userName) { 
    console.log("No userName given")
    return
  }

  return new Promise((resolve, reject) => {
    getStoryUrls(cookies).then(storiesByUser => {
      const storyItems = storiesByUser[userName]
      if(!storyItems) { 
        console.log("No matching user for: " + userName)
        return
      }

      const padNum = String(storyItems.length).length
      let index = 1
      storyItems.forEach(item => {
        downloadItem(userName, item, targetFolder).then(res => {
          console.log(`${printProgressBar(index, storyItems.length)}: ${res.fileName}`)
          if (index === storyItems.length) resolve()
          index++
        })
      })
    })
  })
  
}

const printProgressNum = function(index, length) {
  return `[${index.pad(3,' ')}/${length.pad(3, ' ')}]`
}

const printProgressBar = function(index, length) {
  return '['.padEnd(index+1, '=') + ']'.padStart(length-index+1, '-')
}

export const downloadAll = function(cookies, targetFolder) {
  return new Promise((resolve, reject) => {
    let userDone = 0
    getStoryUrls(cookies).then(storiesByUser => {
      const userCount = Object.values(storiesByUser).length
      console.log("number of users with stories:", userCount)

      const padName = Object.keys(storiesByUser).reduce((max, name) => name.length > max ? name.length : max, 0)
      console.log(padName)

      Object.entries(storiesByUser).forEach(stories => {
        const user = stories[0]
        const storyItems = stories[1]

        let index = 1
        storyItems.forEach(item => {
          downloadItem(user, item, targetFolder).then(res => {
            console.log(`${res.skipped ? 'skipped   ' : 'downloaded'}: ${user.padEnd(padName, ' ')} ${printProgressBar(index, storyItems.length)}`)
            
            if (index === storyItems.length) userDone++
            if (userDone === userCount) resolve()
            
            index++
          })
        })
      })

    })
  })
}

export const getFollowedUsers = async function(cookies, user_id) {
  let follows = []
  let has_next = true
  let after = ''

  if (!user_id) {
    user_id = cookies.match(/ds_user_id=\d*/)[0].substring('ds_user_id='.length)
  }

  while(has_next) {
    const requestVariables = {
      id: user_id,
      include_reel: false,
      fetch_mutual: false,
      first: 50,
      after
    }

    const requestUrl = 'https://www.instagram.com/graphql/query/?query_hash=d04b0a864b4b54837c0d870b0e77e076' +
      '&variables=' + JSON.stringify(requestVariables)

    const response = await axios({
      url: requestUrl,
      method: 'GET',
      headers: {
        accept: 'application/json',
        cookie: cookies
      }
    }).then(res => res.data)
    
    const edge_follow = response.data.user.edge_follow
    follows = follows.concat(edge_follow.edges)
    has_next = edge_follow.page_info.has_next_page
    after = edge_follow.page_info.end_cursor
  }

  return follows.map(u => u.node)
}


export const followUser = function(cookies, user_id) {
  return new Promise((resolve, reject) => {
    cookies = 'ig_cb=1; rur=ATN; ig_did=A282538E-FE49-495F-926A-20A68223CF80; mid=XhaCOwAEAAHO65G4iwf0paHIn7sY; ds_user_id=28080608909; csrftoken=9AXqNrwjAwja45BUKNY8kloKjDhxlbgB; sessionid=28080608909%3Al2WWA283UoFsjf%3A18;'
    const requestUrl = `https://www.instagram.com/web/friendships/${user_id}/follow/`
    
    let csrfToken = cookies.match(/csrftoken=\S*/)[0]
    csrfToken = csrfToken.substring('csrftoken='.length, csrfToken.length-1)
    
    let sessionId = cookies.match(/sessionid=\S*/)[0]
    sessionId = sessionId.substring('sessionid='.length, sessionId.length-1)
    

    const headers = {
      'referer': 'https://www.instagram.com/',
      'origin': 'https://www.instagram.com',
      'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.117 Safari/537.36',
      'x-instagram-ajax': '1',
      'x-requested-with': 'XMLHttpRequest',
      'x-csrftoken': csrfToken,
      cookie: 'sessionid=' + sessionId + '; csrftoken=' + csrfToken + ';'
    }
    console.log(headers)

    fetch(requestUrl, {
      'method': 'post',
      'headers': headers
    }).then(res => resolve(res)).catch(e => reject(e))
/*
    axios({
      url: requestUrl,
      method: 'POST',
      headers
    }).then(res => resolve(res)).catch(e => reject(e))
*/
  })
}