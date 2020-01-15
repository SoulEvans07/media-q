import fs from 'fs'
import path from 'path'
import { AllHtmlEntities as entities } from 'html-entities'

import { storiesFolder } from '../config/vars'

const getStory = async function(req, res, next) {
  const date = req.params.filename.match(/\d{4}-\d{2}-\d{2}/)[0]
  const filePath = path.join(storiesFolder, date, req.params.filename)

  try {
    const base64_encoded = fs.readFileSync(filePath, { encoding: 'base64' })
    res.status(200).send("data:image/png;base64, " + base64_encoded)
  } catch (e) {
    console.log(e)
    res.status(500).send(e.message)
  }
}


export const story = {
  get: getStory
}
