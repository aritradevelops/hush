export const constants = {
  APP_NAME: 'Hush',
  SERVER_URL: process.env.NEXT_PUBLIC_SERVER_URL,
  GOOGLE_CLIENT_ID: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
  GOOGLE_OAUTH_REDIRECT_URI: `${process.env.NEXT_PUBLIC_SERVER_URL}/v1/oauth/callback/google`,
  FACEBOOK_CLIENT_ID: process.env.NEXT_PUBLIC_FACEBOOK_CLIENT_ID,
  FACEBOOK_OAUTH_REDIRECT_URI: `${process.env.NEXT_PUBLIC_SERVER_URL}/v1/oauth/callback/facebook`,
  STUN_SERVER_URLS: process.env.NEXT_PUBLIC_STUN_SERVER_URLS!.split(',')
} as const

