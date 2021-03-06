import path from 'path'
import dotenv from 'dotenv-safe'

dotenv.config({
  path: path.join(__dirname, '../../.env'),
  sample: path.join(__dirname, '../../.env.example'),
  allowEmptyValues: true
});

export const env = process.env.NODE_ENV
export const port = process.env.PORT
export const host = process.env.NODE_ENV === 'dev' ? process.env.HOST || 'http://127.0.0.1' : process.env.HOST
export const logs = process.env.NODE_ENV === 'production' ? 'combined' : 'dev'

export const instagram_cred = {
  username: process.env.INSTA_USERNAME,
  password: process.env.INSTA_PASSWORD
}

export const mail_cred = {
  username: process.env.GMAIL_USERNAME,
  password: process.env.GMAIL_APP_PASSWORD
}

export const routesPath = path.join(__dirname, '../routes')
export const publicPath = path.join(__dirname, '../public')
export const templateFolder = path.join(__dirname, '../templates/')

export const targetFolder = path.join(__dirname, '../../target/')
export const trashbinFolder = path.join(targetFolder, 'trashbin')
export const instagramFolder = path.join(targetFolder, 'instagram/')
export const lockFile = path.join(instagramFolder, '.lock')
export const storiesFolder = path.join(instagramFolder, 'stories/')
export const sessionFile = path.join(targetFolder, 'instagram/.session')
