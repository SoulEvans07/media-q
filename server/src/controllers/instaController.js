import fs from 'fs'
import path from 'path'
import { AllHtmlEntities as entities } from 'html-entities'

import { storiesFolder } from '../config/vars'

const getStory = async function(req, res, next) {
  const fileName = req.params.filename
  const date = fileName.match(/\d{4}-\d{2}-\d{2}/)[0]
  const filePath = path.join(storiesFolder, date, fileName)

  if (fileName.endsWith('.jpg')) {
    try {
      const base64_encoded = fs.readFileSync(filePath, { encoding: 'base64' })
      return res.status(200).send("data:image/png;base64, " + base64_encoded)
    } catch (e) {
      console.log(e)
      return res.status(500).send(e.message)
    }
  } else if (fileName.endsWith('.mp4')) {
    return res.sendFile(filePath)
  }
}


export const story = {
  get: getStory
}
