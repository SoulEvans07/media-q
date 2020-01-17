import fetch from 'node-fetch'
import fs from 'fs'

export const downloadFile = function(uri, filename){
  return new Promise((resolve, reject) => {
      fetch(uri).then(res => {
        const fileStream = fs.createWriteStream(filename)
        fileStream.on('close', resolve)

        res.body.pipe(fileStream)
        res.body.on('error', reject)
      }).catch(reject)
  })
}

export const searchCookie = function(cookies, key) {
  let pattern = `${key}=\\S*;`
  let match = cookies.match(new RegExp(pattern))
  if (match) {
    match = match[0]
    match = match.substring(key.length+1)
    match = match.substring(0, match.length - 1)
    return match
  }
}


export const getDateString = function(date) {
  return date.getFullYear() + '-' + (date.getMonth()+1).pad(2) + '-' + date.getDate().pad(2)
}

export const getTimeString = function(date) {
  return date.getHours().pad(2) + date.getMinutes().pad(2) + date.getSeconds().pad(2)
}

export const getTimestampString = function(date) {
  return getDateString(date) + '-' + getTimeString(date)
}

export const promiseLog = function(...args) {
  return new Promise((resolve, reject) => {
    console.log(...args)
    resolve()
  })
}
