const GOOGLE_OAUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth"
export function getGoogleOauthUrl(){
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