import path from 'path'
import fs from 'fs'
import cron from 'node-cron'
import checkDiskSpace from 'check-disk-space'
import getSize from 'get-folder-size'
import mustache from 'mustache'

import * as mailHelper from './mail-helper'
import * as Instagram from './instagram-api'
import { instagram_cred } from './config/vars'
import { downloadAll, printProgressBar } from './instagramDownloader'
import { getTimestampString } from './helpers'

import {
  templateFolder,
  targetFolder,
  instagramFolder,
  storiesFolder,
  sessionFile,
  lockFile
} from './config/vars'

const getTemplate = function(name) {
  return fs.readFileSync(templateFolder + name + '.template', 'utf-8')
}


const getFileSize = function(path) {
  return new Promise((resolve, reject) => {
    getSize(path, (err, size) => {
      if (err) reject(err)
      resolve(size)
    })
  })
}

const printDiskStat = async function(label) {
  const diskSpace = await checkDiskSpace('/home')
  const folderSize = await getFileSize(instagramFolder)

  const stat = {
    path:  diskSpace.diskPath,
    size:  { b: diskSpace.size },
    free:  { b: diskSpace.free },
    insta: { b: folderSize },
    other: { b: diskSpace.size - diskSpace.free - folderSize }
  }

  stat.size.mb = Math.round(stat.size.b / 1000000)
  stat.free.mb = Math.round(stat.free.b / 1000000)
  stat.insta.mb = Math.round(stat.insta.b / 1000000)
  stat.other.mb = Math.round(stat.other.b / 1000000)

  stat.free.perc = Math.round(stat.free.b / stat.size.b * 10000) / 100
  stat.insta.perc = Math.round(stat.insta.b / stat.size.b * 10000) / 100
  stat.other.perc = Math.round(stat.other.b / stat.size.b * 10000) / 100

  stat.formatted =
    'free      : ' + (stat.free.mb + ' MB').padStart(8, ' ')  + '  ' + (stat.free.perc  + ' %').padStart(7, ' ') + '\n' +
    'instagram : ' + (stat.insta.mb + ' MB').padStart(8, ' ') + '  ' + (stat.insta.perc + ' %').padStart(7, ' ') + '\n' +
    'other     : ' + (stat.other.mb + ' MB').padStart(8, ' ') + '  ' + (stat.other.perc + ' %').padStart(7, ' ')

  console.log('\n')
  console.log(('= ' + label + ': ' + stat.path + ' ').padEnd(30, '='))
  console.log(stat.formatted)
  console.log('\n')

  return stat
}

const downloaderLogger = function(username, index, length, skipped) {
  console.log(`${skipped ? 'skipped   ' : 'downloaded'}: ${username} ${printProgressBar(index, length)}`)
}

const getDateTimeString = function(date) {
  return `${date.getFullYear()}.${(date.getMonth()+1).pad(2)}.${date.getDate().pad(2)} ` +
    `${date.getHours().pad(2)}:${date.getMinutes().pad(2)}:${date.getSeconds().pad(2)}`
}

const reorder = async function() {
  let fileNames = fs.readdirSync(storiesFolder)

  fileNames = fileNames.filter(fileName => {
    const fpath = path.join(storiesFolder, fileName)
    const stats = fs.lstatSync(fpath)
    return !stats.isDirectory()
  })

  fileNames.forEach(fileName => {
    const oldPath = path.join(storiesFolder, fileName)
    const date = fileName.match(/\d{4}-\d{2}-\d{2}/)[0]
    const folder = path.join(storiesFolder, date)
    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder)
    }
    const newPath = path.join(folder, fileName)
    fs.renameSync(oldPath, newPath)
  })
  console.log('Done reordering.')
}

const mailOptions = {
  from: 'Media-Q',
  to: 'szi.adam@simonyi.bme.hu',
  subject: 'no subj',
  html: '<b>No message?</b>'
}

const isLocked = function() {
  return fs.existsSync(lockFile)
}

const createLock = function() {
  const timestamp = getTimestampString(new Date())
  fs.writeFileSync(lockFile, timestamp)
}

const removeLock = function() {
  const timestamp = fs.readFileSync(lockFile)
  fs.unlinkSync(lockFile)
  return timestamp
}

export const main = async function() {
  //if (isLocked()) throw new Error('Action locked')

  createLock()

  const instagram = await Instagram.createInstance(instagram_cred, sessionFile)
  const subjectTemplate = 'MediaQ Report {{{ time }}}'
  const messageTemplate = getTemplate('stats.mail')
  const data = {
    time: getDateTimeString(new Date()),
    before: null,
    after: null,
    downloads: null
  }

  console.log(mustache.render(subjectTemplate, { time: data.time }))

  let diskstat = await printDiskStat('before')
  data.before = diskstat

  return downloadAll(instagram, storiesFolder, downloaderLogger).then(async (stats) => {
    //console.log('Done downloading\n')
    console.log('downloaded stories: ' + stats.count)
    if (stats.count > 0) {
      //console.log('------------------------')
      //console.log(Object.entries(stats.users).map(u => `${u[0]}: ${u[1]}` ).join('\n'))

      data.downloads = { count: stats.count, users: [] }
      Object.entries(stats.users).forEach(u => data.downloads.users.push({ username: u[0], count: u[1].downloaded }))
    } else {
      data.downloads = { count: 0, users: 'none' }
    }

    diskstat = await printDiskStat('after')
    data.after = diskstat

    mailOptions.subject = mustache.render(subjectTemplate, { time: data.time })
    mailOptions.html = mustache.render(messageTemplate, data)

    // mailHelper.sendMail(mailOptions, (error, info) => {
    //   if (error) console.log(error)
    //   console.log('Message sent: %s', info.messageId)
    // })

    removeLock()

    return data
  })
}

cron.schedule('0 */6 * * *', () => {
  main()
})
