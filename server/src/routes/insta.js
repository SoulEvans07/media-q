import express from 'express'

import * as instaController from '../controllers/instaController'

const router = express.Router()

router.get('/story/:filename', instaController.story.get)

export default router
