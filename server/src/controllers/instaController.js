import fs from 'fs'
import path from 'path'
import { AllHtmlEntities as entities } from 'html-entities'

import exif from '../helpers/exif-wrapper'
import Thumbler from '../helpers/thumbler-wrapper'
import ffmpeg from '../helpers/ffmpeg-wrapper'
import { storiesFolder } from '../config/vars'
import {
  getDateString,
  matchDateString,
  matchDateTimeString,
  convertDateTimeString
} from '../helpers'

import { main } from '../main'

const getMetaData = async function(filePath) {
  const meta = { is_video: filePath.endsWith('.mp4') }

  if (meta.is_video) {
    const data = await ffmpeg.ffprobe(filePath)
    meta.width = data.streams[0].width
    meta.height = data.streams[0].height
    meta.duration = data.streams[0].duration
  } else {
    const data = await exif.getImageData(filePath)
    //console.log(data)
    meta.width = parseInt(data['image width'])
    meta.height = parseInt(data['image height'])
  }

  return meta
}

const listStories = async function(req, res, next) {
  const THUMBNAIL_EXT = '.thumbnail.jpg'
  const THUMBNAIL_COMPRESSION = 0.1

  let date = req.params.date
  if (date === 'latest') {
    date = getDateString(new Date())
  }

  const dateFolder = path.join(storiesFolder, date)
  if (!fs.existsSync(dateFolder)) {
    return res.status(404).send()
  }

  const files = fs.readdirSync(dateFolder)

  const itemsMap = {}
  files.forEach(file => {
    const is_template = file.endsWith(THUMBNAIL_EXT)
    const base = file.substr(0, file.length - (is_template ? THUMBNAIL_EXT.length : 4 ))
    if (itemsMap[base] === undefined) {
      itemsMap[base] = {
        src: null,
        thumbnail: null,
        is_video: undefined
      }
    }

    if (file.endsWith(THUMBNAIL_EXT)) {
      itemsMap[base].thumbnail = file
    } else {
      itemsMap[base].date = convertDateTimeString(file)
      itemsMap[base].src = file
      itemsMap[base].is_video = file.endsWith('.mp4')
    }
  })

  // await Object.entries(itemsMap).forEachAsync(async entry => {
  //   const key = entry[0]
  //   const item = entry[1]
  //
  //   const srcPath = path.join(dateFolder, item.src)
  //   const thumbnailName = key + THUMBNAIL_EXT
  //   const thumbnailPath = path.join(dateFolder, thumbnailName)
  //
  //
  //   if (item.thumbnail === null) {
  //     try {
  //       const meta = await getMetaData(srcPath)
  //
  //       const options = {
  //         type: item.is_video ? 'video' : 'image',
  //         input: srcPath,
  //         output: thumbnailPath,
  //         size: `${100}x${Math.round(meta.height * (100 / meta.width))}`
  //       }
  //       if (item.is_video) {
  //         options.time = '00:00:00'
  //       }
  //
  //       try {
  //         const newThumbnail = await Thumbler(options)
  //         item.thumbnail = thumbnailName
  //       } catch (e) {
  //         console.log(e)
  //       }
  //     } catch (e) {
  //       console.log(e)
  //     }
  //   }
  // })

  let itemsList = Object.values(itemsMap)
  itemsList.sort((a, b) => a.date - b.date).reverse()

  return res.status(200).send(itemsList)
}

const getStory = async function(req, res, next) {
  const fileName = req.params.filename
  const date = matchDateString(fileName)
  const filePath = path.join(storiesFolder, date, fileName)
  const is_video = fileName.endsWith('.mp4')

  return res.sendFile(filePath)

  // if (fileName.endsWith('.jpg')) {
  //   try {
  //     const base64_encoded = fs.readFileSync(filePath, { encoding: 'base64' })
  //     return res.status(200).send("data:image/png;base64, " + base64_encoded)
  //   } catch (e) {
  //     console.log(e)
  //     return res.status(500).send(e.message)
  //   }
  // } else if (fileName.endsWith('.mp4')) {
  //   return res.sendFile(filePath)
  // }
}

const refresh = function(req, res, next) {
  main()
    .then(result => res.status(200).send(result))
    .catch(e => res.status(500).send(e.message))
}


export const story = {
  list: listStories,
  get: getStory,

  refresh: refresh
}
