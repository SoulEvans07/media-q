import fs from 'fs'
import cron from 'node-cron'
import checkDiskSpace from 'check-disk-space'
import getSize from 'get-folder-size'

import * as mailHelper from './mail-helper'
import * as Instagram from './instagram-api'
import { instagram_cred } from './config/vars'
import { downloadAll } from './instagramDownloader'

Number.prototype.pad = function(length, char = '0') { return String(this).padStart(length, char) }

String.prototype.replaceAll = function (find, replace) {
  const escaped_find = find.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
  return this.replace(new RegExp(escaped_find, 'g'), replace);
}

const targetFolder = __dirname + '/../target/'
const instagramFolder = targetFolder + 'instagram/'
const downloadFolder = instagramFolder + 'stories/'
const sessionFile = targetFolder + 'instagram/.session'


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

/*
cron.schedule('7,9,11 * * * *', () => {
  console.log(new Date().toLocaleTimeString())
  main()
})
*/

//main()



let mailOptions = {
  from: 'Media-Q',
  to: 'szi.adam@simonyi.bme.hu',
  subject: 'MediaQ ✔',
  html: '<b>Hello world?</b>'
}

mailHelper.sendMail(mailOptions, (error, info) => {
    if (error) {
        return console.log(error);
    }
    console.log('Message sent: %s', info.messageId)
})

