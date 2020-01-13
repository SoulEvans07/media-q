import path from 'path'
import dotenv from 'dotenv-safe'

dotenv.config({
  path: path.join(__dirname, '../../.env'),
  sample: path.join(__dirname, '../../.env.example'),
  allowEmptyValues: true
});

export const instagram_cred = {
  username: process.env.INSTA_USERNAME,
  password: process.env.INSTA_PASSWORD
}

export const mail_cred = {
  username: process.env.GMAIL_USERNAME,
  password: process.env.GMAIL_APP_PASSWORD
}
