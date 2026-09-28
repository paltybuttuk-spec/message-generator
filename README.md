# MsgGen -> Messenger link (with offline queue)
MsgGen.apk is a Trusted Web Activity: it just opens https://paltybuttuk-spec.github.io/message-generator/.
So you update the website and the installed app updates itself — no APK rebuild.

1. In your `message-generator` GitHub repo, add `messenger-link.js` and replace `index.html` and `sw.js` with these versions
   (index.html only gains one `<script src="messenger-link.js">` line; sw.js only bumps the cache to v3 and caches the new file).
2. Commit. Wait for GitHub Pages to redeploy, then open the app twice (the second open picks up the new service worker).
3. Deploy the Messenger server over HTTPS, create a bot in a chat (see the Messenger README), then in MsgGen tap
   **Messenger settings** and enter the server URL and bot token.
4. Generate a message -> **Send to Messenger**. Offline? It queues on the phone ("N queued") and sends by itself when back online.
MsgGen itself already worked offline (cached shell); this adds offline sending.
