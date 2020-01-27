import express from 'express'
import rateLimit from 'express-rate-limit'

import * as instaController from '../controllers/instaController'

const router = express.Router()

router.get('/story/refresh', rateLimit({ windowMs: 5 * 60 * 1000, max: 1 }), instaController.story.refresh)
router.get('/story/list/:date', instaController.story.list)

router.get('/story/dates', instaController.story.dates)



router.get('/story/:filename', instaController.story.get)
router.delete('/story/:filename', instaController.story.delete)

export default router
