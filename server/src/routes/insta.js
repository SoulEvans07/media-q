import express from 'express'

import * as instaController from '../controllers/instaController'

const router = express.Router()

router.get('/story/:id', instaController.getStory)

export default router
