/* eslint-disable no-console */
const nodemailer = require('nodemailer')
const ejs = require('ejs')
const { google } = require('googleapis')

async function sendGmail(template, { utils }) {
  const { OAuth2 } = google.auth

  const GetEnvironmentVar = (varname, defaultValue = undefined) => {
    const result = process.env[varname]
    if (result !== undefined) return result
    if (defaultValue === undefined)
      utils.build.failPlugin('Sending email has failed! ❌.', {
        error: `Environment variable "${varname}" not set.`,
      })
    return defaultValue
  }

  const GMAIL_SENDER_EMAIL = GetEnvironmentVar('GMAIL_SENDER_EMAIL')
  const GMAIL_RECEIVER_EMAIL = GetEnvironmentVar('GMAIL_RECEIVER_EMAIL')
  const GMAIL_AUTH_TYPE = GetEnvironmentVar('GMAIL_AUTH_TYPE', 'oauth2')

  const data = {
    URL: process.env['URL'],
    DEPLOY_URL: process.env['DEPLOY_URL'],
    SITE_NAME: process.env['SITE_NAME'],
    SITE_ID: process.env['SITE_ID'],
    DEPLOY_ID: process.env['DEPLOY_ID'],
  }

  let authConfig

  if (GMAIL_AUTH_TYPE.toLowerCase() === 'login') {
    const GMAIL_PASSWORD = GetEnvironmentVar('GMAIL_PASSWORD')
    authConfig = {
      type: GMAIL_AUTH_TYPE,
      user: GMAIL_SENDER_EMAIL,
      pass: GMAIL_PASSWORD,
    }
  } else if (GMAIL_AUTH_TYPE.toLowerCase() === 'oauth2') {
    const OAUTH_PLAYGROUND = GetEnvironmentVar(
      'OAUTH_PLAYGROUND',
      'https://developers.google.com/oauthplayground',
    )
    const GMAIL_CLIENT_ID = GetEnvironmentVar('GMAIL_CLIENT_ID')
    const GMAIL_CLIENT_SECRET = GetEnvironmentVar('GMAIL_CLIENT_SECRET')
    const GMAIL_REFRESH_TOKEN = GetEnvironmentVar('GMAIL_REFRESH_TOKEN')
    const oauth2Client = new OAuth2(
      GMAIL_CLIENT_ID,
      GMAIL_CLIENT_SECRET,
      OAUTH_PLAYGROUND,
    )
    oauth2Client.setCredentials({
      refresh_token: GMAIL_REFRESH_TOKEN,
    })
    const accessToken = oauth2Client.getAccessToken()
    authConfig = {
      type: GMAIL_AUTH_TYPE,
      user: GMAIL_SENDER_EMAIL,
      clientId: GMAIL_CLIENT_ID,
      clientSecret: GMAIL_CLIENT_SECRET,
      refreshToken: GMAIL_REFRESH_TOKEN,
      accessToken,
    }
  } else {
    utils.build.failPlugin('Sending email has failed! ❌.', {
      error: `Invalid GMAIL_AUTH_TYPE: "${GMAIL_AUTH_TYPE}".`,
    })
  }

  const ON_SUCCESS_SUBJECT = GetEnvironmentVar(
    'ON_SUCCESS_SUBJECT',
    `[NETLIFY] Site ${data.SITE_NAME} successfully build ✨`,
  )

  const ON_SUCCESS_BODY_FILEPATH = GetEnvironmentVar(
    'ON_SUCCESS_BODY_FILEPATH',
    `${__dirname}/templates/onSuccess.ejs`,
  )
  const ON_ERROR_SUBJECT = GetEnvironmentVar(
    'ON_ERROR_SUBJECT',
    `[NETLIFY] Site ${data.SITE_NAME} build failed ❌`,
  )
  const ON_ERROR_BODY_FILEPATH = GetEnvironmentVar(
    'ON_ERROR_BODY_FILEPATH',
    `${__dirname}/templates/onError.ejs`,
  )
  const TEMPLATES = {
    onSuccess: {
      filePath: ON_SUCCESS_BODY_FILEPATH,
      subject: ON_SUCCESS_SUBJECT,
    },
    onError: {
      filePath: ON_ERROR_BODY_FILEPATH,
      subject: ON_ERROR_SUBJECT,
    },
  }

  const smtpTransport = nodemailer.createTransport({
    service: 'gmail',
    auth: authConfig,
  })

  let mailOptions

  ejs.renderFile(
    TEMPLATES[template].filePath,
    data,
    {},
    (errorMessage, content) => {
      if (errorMessage) throw new Error(errorMessage)
      mailOptions = {
        from: GMAIL_SENDER_EMAIL,
        to: GMAIL_RECEIVER_EMAIL,
        subject: TEMPLATES[template].subject,
        html: content,
      }
    },
  )

  await smtpTransport.sendMail(mailOptions)
}

const netlifyPlugin = {
  onSuccess: async ({ utils }) => {
    await sendGmail('onSuccess', { utils })
    utils.status.show({
      title: 'SUCCESS ✔',
      summary: 'Email has been sent sucessfully! 📨',
    })
  },
  onError: async ({ utils }) => {
    await sendGmail('onError', { utils })
    utils.status.show({
      title: 'Status',
      summary: 'Email about failed build has been sent sucessfully! 📨',
    })
  },
}

module.exports = netlifyPlugin
