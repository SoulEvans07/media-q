import { AllHtmlEntities as entities } from 'html-entities'

import { instagramFolder } from '../config/vars'

export const getStory = async function(req, res, next) {
  const filePath = instagramFolder + req.params.id

  try {
    const bitmap = fs.readFileSync(filePath)
    res.status(200).send(bitmap)
  } catch (e) {
    res.status(500).send(e)
  }
}


export const story = {
  get: getStory
}
