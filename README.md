<p float="left">
   <a target="_blank" href="https://npmjs.org/package/netlify-plugin-gmail">
      <img src="https://nodei.co/npm/netlify-plugin-gmail.png?mini=true" alt="NPM" style="margin-right:10px;"/>
   </a>
   <a target="_blank" href="https://app.netlify.com/sites/netlify-plugin-gmail/deploys">
      <img src="https://api.netlify.com/api/v1/badges/d9e3c95e-a578-40f2-b4e8-6be9a7ad1dc4/deploy-status" alt="Netlify Status"/>
   </a>
</p>

# netlify-plugin-gmail 📨

> A Netlify Build Plugin for Gmail

This build plugin provides an alternative to [Netlify's native e-mail notification offering](https://docs.netlify.com/site-deploys/notifications/#email-notifications) by sending e-mail from a Gmail account on every
[Netlify](https://www.netlify.com/) successful or failed build.

## File-based installation

1. Create a netlify.toml in the root of your project. Your file should include
   the plugins section below:

   ```shell
   [[plugins]]
   package = "netlify-plugin-gmail"
   ```

2. From your project's base directory, use npm, yarn, or any other Node.js
   package manager to add this plugin to devDependencies in package.json.

   ```shell
   # use npm
   npm install -D netlify-plugin-gmail

   # or yarn
   yarn add -D netlify-plugin-gmail
   ```

## Configuration

You need to configure this plugin using
[build environment variables](https://docs.netlify.com/configure-builds/environment-variables/)
and configure your Gmail account. Plugin is using [Oauth2](#to-use-oauth2) authentication.

1. First, let’s set up an OAuth Client ID for your app.
2. Go to [Google Cloud APIs](https://console.developers.google.com/) and create
   a new project.
3. Search for “APIs & Services”
4. Click on “Credentials” > Click “+ Create credentials” > “OAuth client ID”
   Type: Web Application Name: “Enter Your Name of Client” Authorized redirect
   URIs: <https://developers.google.com/oauthplayground>
5. Copy both the `Client ID` and `Client Secret`.
6. Go to [Oauth Playground](https://developers.google.com/oauthplayground) >
   Click on Setting icon on the right > Enable Use your own Oauth credentials >
   Enter Oauth Client ID & Oatuh Client Secret that you get from the above
   step > Close
7. In Select & Authorize APIs, Type <https://mail.google.com> > Authorize APIs >
   Login with the account that you want to send from.
8. Click Exchange authorization code for tokens > Copy `Refresh Token`.
9. Set following
   [build environment variables](https://docs.netlify.com/configure-builds/environment-variables/):

```shell
GMAIL_SENDER_EMAIL="joedoe@email.com"
GMAIL_RECEIVER_EMAIL="jonhndoe@email.com" # comma separated list of recipients email addresses
GMAIL_AUTH_TYPE="oauth2" # optional - oauth2 is set by default
GMAIL_CLIENT_ID="12354613-blablablabla.apps.googleusercontent.com" # example value
GMAIL_CLIENT_SECRET="q_af1461fafa49faefvv3" # example value
GMAIL_REFRESH_TOKEN="8//423789fafafavaae-jkflamflaga6464848684_faf13fa16f4a984" # example value
OAUTH_PLAYGROUND = "https://developers.google.com/oauthplayground" # optional - this url is set by default
```

### All environment variables

| Variable                 | State                               | Example                                            | Default value                                 |
| ------------------------ | ----------------------------------- | -------------------------------------------------- | --------------------------------------------- |
| GMAIL_SENDER_EMAIL       | Required                            | `jonhndoe@email.com`                               |                                               |
| GMAIL_RECEIVER_EMAIL     | Required                            | `joedoe@email.com, johndoe@email.com`              |                                               |
| GMAIL_CLIENT_ID          | Required                            | `12354613-blablablabla.apps.googleusercontent.com` |                                               |
| GMAIL_CLIENT_SECRET      | Required                            | `q_af1461fafa49faefvv3`                            |                                               |
| GMAIL_REFRESH_TOKEN      | Required                            |                                                    |                                               |
| OAUTH_PLAYGROUND         | Optional                            | `https://developers.google.com/oauthplayground`    | https://developers.google.com/oauthplayground |
| GMAIL_AUTH_TYPE          | Optional                            | `oauth2` or `login`                                | oauth2                                        |
| ON_SUCCESS_BODY_FILEPATH | Optional                            | `/templates/success-message.ejs`                   | ${\_\_dirname}/templates/onSuccess.ejs        |
| ON_SUCCESS_SUBJECT       | Optional                            | `[NETLIFY] Build successfull 🎉`                   | [NETLIFY] Build successfull 🎉                |
| ON_ERROR_BODY_FILEPATH   | Optional                            | `/templates/error-message.ejs`                     | ${\_\_dirname}/templates/onError.ejs          |
| ON_ERROR_SUBJECT         | Optional                            | `[NETLIFY] Build unsuccessfull ❌`                 | [NETLIFY] Build unsuccessfull ❌              |

### Custom email subject and body

You can customize your email subject and body.

To change **subject**, set either `ON_SUCCESS_SUBJECT` or `ON_ERROR_SUBJECT`
environment variable.

```shell
ON_SUCCESS_SUBJECT="My custom subject for successfull build"
ON_ERROR_SUBJECT="My custom subject for failed build"
```

To change **email body**, set either `ON_SUCCESS_BODY_FILEPATH` or
`ON_ERROR_BODY_FILEPATH` environment variable to point to your
`*.ejs template file`.

```shell
ON_ERROR_BODY_FILEPATH=`/templates/success-message.ejs`
```

Create file `/templates/success-message.ejs` and put there your custom content:

```html
<h1>Netlify build for site <%= SITE_NAME %> has been sucesfull.</h1>
<p>
  Finished processing build request. Site <%= SITE_NAME %> is live ✨.
  <br />
  URL: <%= URL %> <br />
  DEPLOY_URL: <%= DEPLOY_URL %>
</p>
```

You can use following variables:

- `<%= URL %>`
- `<%= DEPLOY_URL %>`
- `<%= SITE_NAME %>`
- `<%= SITE_ID %>`
- `<%= DEPLOY_ID %>`
