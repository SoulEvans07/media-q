/* based on https://github.com/yatsenkolesh/instagram-nodejs */
import fetch from 'node-fetch'
import formData from 'form-data'

export default class Instagram {

  constructor(csrfToken, sessionId) {
    this.csrfToken = csrfToken
    this.sessionId = sessionId
    this.userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3440.106 Safari/537.36'
    this.userIdFollowers = {}
    this.userIdFollows = {}
    this.timeoutForCounter = 300
    this.timeoutForCounterValue = 30000
    this.paginationDelay = 30000
    this.receivePromises = {}
    this.searchTypes = ['location', 'hashtag']

    this.essentialValues = {
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

  updateEssentialValues(src, isHTML){
    if (!isHTML){
      const keys = Object.keys(this.essentialValues)

        for (let i = 0; i < keys.length; i++){
          let key = keys[i];
          if (!this.essentialValues[key]){
            for (let cookie in src){
              if (src[cookie].includes(key) && !src[cookie].includes(key + '=""')){
                let cookieValue = src[cookie].split(';')[0].replace(key + '=', '')
                this.essentialValues[key] = cookieValue
                break
              }
            }
          }
        }
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
      headers:
        this.combineWithBaseHeader(
          {
            'accept': 'text/html,application/xhtml+xml,application/xml;q0.9,image/webp,image/apng,*.*;q=0.8',
            'accept-encoding': 'gzip, deflate, br',
            'cookie': this.generateCookie()
          }
        )
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

  isPrivate(username) {
    return this.getUserDataByUsername(username).then(data => data.user.is_private)
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

  getCsrfToken() {
    return fetch('https://www.instagram.com',{
      method: 'get',
      headers: this.combineWithBaseHeader({
        'accept': 'text/html,application/xhtml+xml,application/xml;q0.9,image/webp,image/apng,*.*;q=0.8',
        'accept-encoding': 'gzip, deflate, br',
        'cookie': this.generateCookie(true)
      })
    }).then(res => {
      this.updateEssentialValues(res.headers._headers['set-cookie'])
      return res.text()
    }).then(html => {
      this.updateEssentialValues(html, true)
      return this.essentialValues.csrftoken
    }).catch((e) =>
      console.log('Failed to get instagram csrf token\n', e)
    )
  }

  auth({ username, password }) {
    const formdata = 'username=' + username + '&password=' + password + '&queryParams=%7B%7D'

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
        this.updateEssentialValues(res.headers._headers['set-cookie'])
        return this.essentialValues.sessionid;
      }).catch((e) =>
        console.log('Instagram authentication failed (challenge required error):\n', e)
      )
  }

  getHeaders() {
    return {
      'referer': 'https://www.instagram.com/p/BT1ynUvhvaR/?taken-by=yatsenkolesh',
      'origin': 'https://www.instagram.com',
      'user-agent': this.userAgent,
      'x-instagram-ajax': '1',
      'x-requested-with': 'XMLHttpRequest',
      'x-csrftoken': this.csrfToken,
      cookie: ' sessionid=' + this.sessionId + '; csrftoken=' + this.csrfToken + ';'
    }
  }

  follow(userId) {
    return fetch('https://www.instagram.com/web/friendships/' + userId + '/follow', {
      method: 'post',
      headers: this.getHeaders()
    })
  }

  unfollow(userId) {
    return fetch('https://www.instagram.com/web/friendships/' + userId + '/unfollow', {
      method: 'post',
      headers: this.getHeaders()
    })
  }

  getUserDataById(id) {
    let query = 'ig_user(' + id + '){id,username,external_url,full_name,profile_pic_url,biography,followed_by{count},follows{count},media{count},is_private,is_verified}'

    let form = new formData();
    form.append('q', query)

    return fetch('https://www.instagram.com/query/', {
      method: 'post',
      body: form,
      headers: this.getHeaders()
    }).then(res => res.json())
  }
}
