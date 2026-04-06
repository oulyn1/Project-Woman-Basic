import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'pnj.com.vn@gmail.com',
    pass: 'yuci qpkx suze uqjt '
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
