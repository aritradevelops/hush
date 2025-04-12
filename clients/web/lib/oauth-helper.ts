const GOOGLE_OAUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth"
const FACEBOOK_OAUTH_URL = "https://www.facebook.com/v18.0/dialog/oauth"
export function getGoogleOauthUrl() {
    const options = {
        redirect_uri: process.env.NEXT_PUBLIC_GOOLE_OAUTH_REDIRECT_URI!,
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
        access_type: 'offline',
        response_type: 'code',
        prompt: 'consent',
        scope: [
            'https://www.googleapis.com/auth/userinfo.profile',
            'https://www.googleapis.com/auth/userinfo.email',
        ].join(' ')

    }
    const qs = new URLSearchParams(options).toString()
    return `${GOOGLE_OAUTH_URL}?${qs}`
}

export function getFacebookOauthUrl() {
    const options = {
        redirect_uri: process.env.NEXT_PUBLIC_FACEBOOK_OAUTH_REDIRECT_URI!,
        client_id: process.env.NEXT_PUBLIC_FACEBOOK_CLIENT_ID!,
        scope: ['email', 'public_profile'].join(','),
        response_type: 'code',
    }
    const qs = new URLSearchParams(options).toString()
    return `${FACEBOOK_OAUTH_URL}?${qs}`
}