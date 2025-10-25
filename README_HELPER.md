Launch helper (local launcher)

This project includes a small helper to launch Firefox from the local UI. It is intended for local development only and binds to 127.0.0.1.

Files added:
- launch-helper.js  — Node script that listens on localhost and starts firefox.exe

How to run

1. Install Node (if you don't already).
2. In a PowerShell terminal, from the project root run:

```powershell
# set a secret token (optional, defaults to 'local-secret')
$env:LAUNCH_SECRET = 'mysecret123'; npm run launch-helper
```

3. Optionally save the token in localStorage for the web UI to use:

```js
localStorage.setItem('launchToken', 'mysecret123')
```

4. Click the Firefox dock button in the UI; it will POST to the helper to launch Firefox.

Notes & security
- The helper binds to 127.0.0.1 only and requires the `X-Launch-Token` header.
- Use a strong token if you expose the machine to untrusted users.
- Adjust `launch-helper.js` if your Firefox is installed in a non-standard path.
