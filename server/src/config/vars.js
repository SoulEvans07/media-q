import path from 'path'
import dotenv from 'dotenv-safe'

dotenv.config({
  path: path.join(__dirname, '../../.env'),
  sample: path.join(__dirname, '../../.env.example'),
  allowEmptyValues: true
});

export const instagram = {
  username: process.env.INSTA_USERNAME,
  password: process.env.INSTA_PASSWORD
}
