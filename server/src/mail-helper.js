import nodemailer from 'nodemailer'
import { mail_cred } from './config/vars'

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true, // true for 465, false for other ports
  auth: {
    user: mail_cred.username,
    pass: mail_cred.password
  }
})

transporter.sendMail = transporter.sendMail.bind(transporter)

export const sendMail = transporter.sendMail