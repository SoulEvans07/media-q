export const printProgressNum = function(index, length) {
  return `[${index.pad(3,' ')}/${length.pad(3, ' ')}]`
}

export const printProgressBar = function(index, length) {
  return '['.padEnd(index+1, '=') + ']'.padStart(length-index+1, '-')
}

export const downloadAll = function(instance, targetFolder, logger) {
  return new Promise((resolve, reject) => {
    let userDone = 0
    instance.getStoryUrls().then(storiesByUser => {
      const userCount = Object.values(storiesByUser).length
      console.log("number of users with stories:", userCount)
      const stats = { count: 0, users: {} }

      const padName = Object.keys(storiesByUser).reduce((max, name) => name.length > max ? name.length : max, 0)

      Object.entries(storiesByUser).forEach(stories => {
        const user = stories[0]
        const storyItems = stories[1]

        let index = 1
        storyItems.forEach(item => {
          instance.downloadStoryItem(user, item, targetFolder).then(res => {
            if (logger) logger(user.padEnd(padName, ' '), index, storyItems.length, res.skipped)

            if (!res.skipped && stats.users[user]) { stats.users[user]++; stats.count++; }
            if (!res.skipped && !stats.users[user]) { stats.users[user] = 1; stats.count++; }
            
            if (index === storyItems.length) userDone++
            if (userDone === userCount) resolve(stats)
            
            index++
          })
        })
      })

    })
  })
}

export const downloadAllOf = function(instance, userName, targetFolder) {
  if (!userName) { 
    console.log("No userName given")
    return
  }

  return new Promise((resolve, reject) => {
    instance.getStoryUrls(cookies).then(storiesByUser => {
      const storyItems = storiesByUser[userName]
      if(!storyItems) { 
        console.log("No matching user for: " + userName)
        return
      }

      const padNum = String(storyItems.length).length
      let index = 1
      storyItems.forEach(item => {
        instance.downloadStoryItem(userName, item, targetFolder).then(res => {
          console.log(`${printProgressBar(index, storyItems.length)}: ${res.fileName}`)
          if (index === storyItems.length) resolve()
          index++
        })
      })
    })
  })
  
}
