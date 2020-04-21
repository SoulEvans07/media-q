export const printProgressNum = function(index, length) {
  return `[${index.pad(3,' ')}/${length.pad(3, ' ')}]`
}

export const printProgressBar = function(index, length) {
  return '['.padEnd(index+1, '=') + ']'.padStart(length-index+1, '-')
}

export const downloadAll = function(instance, targetFolder, logger, io) {
  return new Promise((resolve, reject) => {
    let userDone = 0
    instance.getStoryUrls().then(storiesByUser => {
      const userCount = Object.keys(storiesByUser).length
      console.log("number of users with stories:", userCount)
      const stats = { count: 0, users: {} }

      const padName = Object.keys(storiesByUser).reduce((max, name) => name.length > max ? name.length : max, 0)

      Object.entries(storiesByUser).forEach(stories => {
        const user = stories[0]
        const storyItems = stories[1]
        stats.users[user] = { downloaded: 0, skipped: 0, count: storyItems.length, done: false }
        const userStat = stats.users[user]

        storyItems.forEach((item, index) => {
          instance.downloadStoryItem(user, item, targetFolder).then(res => {
            if (res.skipped) userStat.skipped++
            else { userStat.downloaded++; stats.count++ }

            if (userStat.downloaded + userStat.skipped === userStat.count) userStat.done = true
            const numberOfDone = Object.values(stats.users).reduce((doneCount, stat) => doneCount + (stat.done ? 1 : 0), 0)
            const isFinal = numberOfDone === userCount

            //if (logger) logger(user.padEnd(padName, ' '), userStat.downloaded, userStat.count, res.skipped)
            console.log(res.skipped ? 's' : 'd', user, stats.users[user], `${numberOfDone}/${userCount}`)
            io.emit('download', { story: res, user, stats: stats.users[user], numberOfDone, userCount })

            //if (isFinal) resolve(stats)
          })
        })

        resolve()
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
