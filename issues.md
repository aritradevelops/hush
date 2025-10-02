## Issues

[x] Missing OAuth in Registration and Reset-Password Pages
[x] OAuth Call Not Setting `email_verified` to True
[x] Cookies Not Setting
[x] socket is not connecting from client
[x] On Chrome Auto-Insert Validation Not Being Removed
[x] contact section is not showing email
[x] on group refresh sent messages showing sending
[x] unread count is wrong
[ ] sometimes events are not syncing due to broken socket (hard to reproduce)
[x] on adding new contact all the buttons are showing loading state
[x] already added contacts are coming may be due to cache
[ ] channel secret sync issue
[ ] on import key sync the public key to the server
[ ] also if users losts his key sync the new key to the server and delete the old one
    and if other users fails to decrypt message (due to old key being present in cache)
    then update the cache to fetch the new key
[ ] if user is not added then not able to join the call (clients/web/app/(chat-app)/calls/components/peer-video.tsx:42)
[x] when remote peer leaves the call my screen gets black
[x] add contact modal showing multiple entries of same person