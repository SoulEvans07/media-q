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

