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


export const matchDateString = function(fileName) {
  return fileName.match(/\d{4}-\d{2}-\d{2}/)[0]
}

export const matchTimeString = function(fileName) {
  return fileName.match(/-\d{6}/)[0].substring(1)
}

export const matchDateTimeString = function(fileName) {
  return matchDateString(fileName) + '-' + matchTimeString(fileName)
}

export const convertDateTimeString = function(fileName) {
  const date = matchDateString(fileName)
  let time = matchTimeString(fileName)
  time = time.substring(0, 2) + ':' + time.substring(2, 4) + ':' + time.substring(4, 6)
  return Date.parse(date + ' ' + time)
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
