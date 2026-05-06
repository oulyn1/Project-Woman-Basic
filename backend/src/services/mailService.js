import nodemailer from 'nodemailer'

import { env } from '~/config/environment'

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: env.MAIL_USER,
    pass: env.MAIL_PASSWORD
  }
})

// Hàm gửi mail
export const sendMail = async (to, subject, text) => {
  const mailOptions = {
    from: '"PNJ Support" <pnj.com.vn@gmail.com>',
    to,
    subject,
    text
  }

  await transporter.sendMail(mailOptions)
}
