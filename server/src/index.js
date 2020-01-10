import fs from 'fs'
import cron from 'node-cron'
import checkDiskSpace from 'check-disk-space'
import getSize from 'get-folder-size'
import * as Instagram from './instagram-api'

import { instagram_cred } from './config/vars'
import { downloadAll } from './instagramDownloader'

Number.prototype.pad = function(length, char = '0') { return String(this).padStart(length, char) }

const targetFolder = __dirname + '/../target/'
const instagramFolder = targetFolder + 'instagram/'
const downloadFolder = instagramFolder + 'stories/'
const sessionFile = targetFolder + 'instagram/.session'

const followAll = async function() {
  const instagram = await Instagram.createInstance(instagram_cred, sessionFile)

  //let followed_users = await instagram.getFollowedUsers(175081363)
  //let private_users = followed_users.filter(u => u.is_private)
  //let public_users = followed_users.filter(u => !u.is_private)
  //private_users = private_users.map(u => ({ username: u.username, id: u.id }))
  //public_users = public_users.map(u => ({ username: u.username, id: u.id }))

  //fs.writeFileSync(instagramFolder + 'private_users.json', JSON.stringify(private_users))
  //fs.writeFileSync(instagramFolder + 'public_users.json', JSON.stringify(public_users))

  const to_follow = JSON.parse(fs.readFileSync(instagramFolder + 'public_users.json'))
  const first_few = to_follow.slice(0, 10)

  const successfull = []
  const failed = []
  try {
    first_few.forEach(async (user, i) => {
      console.log('tried    :', user.username)
      setTimeout(() => {
        instagram.follow(user.id).then(res => {
          console.log('followed :', user.username, res.status, res.statusText)
          
          if (res.status == 200) {
            successfull.push(user)
          } else {
            failed.push(user)
          }
        }).catch(e => {
          console.log('failed   :', user.username, res.status, res.statusText)
          failed.push(user)
        }).then(() => {
          if (successfull.length + failed.length === first_few.length) {
            console.log('Done.')
            fs.writeFileSync(instagramFolder + 'successfull.json', JSON.stringify(successfull))
            fs.writeFileSync(instagramFolder + 'failed.json', JSON.stringify(failed))
          }
        })
      }, i * 1000)
    })
  } catch(e) { console.log(e) }
}

const getFileSize = function(path) {
  return new Promise((resolve, reject) => {
    getSize(path, (err, size) => {
      if (err) reject(err)
      resolve(size)
    })
  })
}

const printDiskStat = async function() {
  const diskSpace = await checkDiskSpace('/home')
  const folderSize = await getFileSize(instagramFolder)

  const stat = {
    path:  diskSpace.diskPath,
    size:  diskSpace.size,
    free:  diskSpace.free,
    insta: folderSize,
    other: diskSpace.size - diskSpace.free - folderSize
  }

  console.log('\n')
  console.log('= ' + stat.path + ' '.padEnd(22, '='))
  console.log('free      : ' + ((stat.free  / 1000000).toFixed(0) + ' MB').padStart(8, ' ') + '  ' + ((stat.free  / stat.size * 100).toFixed(2) + ' %').padStart(7, ' '))
  console.log('instagram : ' + ((stat.insta / 1000000).toFixed(0) + ' MB').padStart(8, ' ') + '  ' + ((stat.insta / stat.size * 100).toFixed(2) + ' %').padStart(7, ' '))
  console.log('other     : ' + ((stat.other / 1000000).toFixed(0) + ' MB').padStart(8, ' ') + '  ' + ((stat.other / stat.size * 100).toFixed(2) + ' %').padStart(7, ' '))
  console.log('\n')
}

const main = async function() {
  const instagram = await Instagram.createInstance(instagram_cred, sessionFile)
  
  await printDiskStat()

  downloadAll(instagram, downloadFolder).then(async () => {
    console.log('Done downloading')

    await printDiskStat()
  })
}

cron.schedule('7,9,11 * * * *', () => {
  console.log(new Date().toLocaleTimeString())
  main()
})
