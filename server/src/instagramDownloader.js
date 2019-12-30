import axios from 'axios'

const storyUserReqVariables = {
  only_stories: true,
  stories_prefetch: false,
  stories_video_dash_manifest: false
}

const storyUserReqUrl = 'https://www.instagram.com/graphql/query/' +
  '?query_hash=5ff0ea71b469b0c684df3e608a5af0b3' +
  '&variables=' + JSON.stringify(storyUserReqVariables)

export const getStoryUrls = function(cookie) {
  return new Promise((resolve, reject) => {
    axios({
      url: storyUserReqUrl,
      method: 'GET',
      headers: {
        accept: 'application/json',
        cookie: cookie
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
          cookie: cookie
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


const download = function(url, fileName) {
  var xhr = new XMLHttpRequest();
  xhr.open('GET', url, true);
  xhr.responseType = 'blob';

  xhr.onprogress = function(event) {
    if (event.lengthComputable) {
        var percentComplete = (event.loaded / event.total)*100;
        //yourShowProgressFunction(percentComplete);
    } 
  };

  xhr.onload = function(event) {
    if (this.status == 200) {
      _saveBlob(this.response, fileName);
    }
    else {
      //yourErrorFunction()
    }
  };

  xhr.onerror = function(event){
    //yourErrorFunction()
  };

  xhr.send();
}


const _saveBlob = function(response, fileName) {
  if(navigator.msSaveBlob){
    //OK for IE10+
    navigator.msSaveBlob(response, fileName);
  }
  else{
    _html5Saver(response, fileName);
  }
}

function _html5Saver(blob , fileName) {
  var a = document.createElement("a");
  document.body.appendChild(a);
  a.style = "display: none";
  var url = window.URL.createObjectURL(blob);
  a.href = url;
  a.download = fileName;
  a.click();
  document.body.removeChild(a);
}

const IMG_PATTERN = /\/\w*\.jpg/
const VIDEO_PATTERN = /\/\w*\.mp4/

const downloadItem = function(user, item) {
  let src = null
  let file = null

  if (item.is_video) {
    src = item.video
    file = src.match(VIDEO_PATTERN)[0].substring(1)
  } else {
    src = item.image
    file = src.match(IMG_PATTERN)[0].substring(1)
  }

  if (src) {
    download(src, user + '-' + file)
  }
}

export const downloadAllOf = function(userName) {
  if (!userName) { 
    console.log("No userName given")
    return
  }

  getStoryUrls().then(stories => {
    console.log("number of users:", Object.values(stories).length)

    const selected = stories[userName]
    if(!selected) { 
      console.log("No matching user for: " + userName)
      return
    }
    console.log("found user:")
    console.log(selected)

    selected.forEach(item => {
      downloadItem(userName, item)
    })
  })
}

export const downloadAll = function() {
  getStoryUrls().then(storiesByUser => {
    console.log("number of users:", Object.values(storiesByUser).length)

    Object.entries(storiesByUser).forEach(story => {
      const user = story[0]
      const stories = story[1]

      console.log(`downloading: ${user} [0/${stories.length}]`)
      stories.forEach((item, index) => {
        downloadItem(user, item)
        console.log(`downloading: ${user} [${index+1}/${stories.length}]`)
      })
    })
  })
}