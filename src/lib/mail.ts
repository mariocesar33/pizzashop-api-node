import nodemailer from 'nodemailer'

export async function createMailTransport() {
  const account = await nodemailer.createTestAccount()

  return nodemailer.createTransport({
    host: account.smtp.host,
    port: account.smtp.port,
    secure: account.smtp.secure,
    debug: true,
    auth: {
      user: account.user,
      pass: account.pass,
    },
  })
}
