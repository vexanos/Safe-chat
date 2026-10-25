# Safe Chat

A private, real-time chat website with an Instagram-style design. Create an account, search a friend by username and send direct messages. Black and white UI, built with plain HTML, CSS and JavaScript on top of Firebase.

**Live demo:** https://vexanos.github.io/Safe-chat/

## Features

- Account system: create account and log in with a unique username and password
- Direct messages (one-to-one) with an inbox, like Instagram
- "Everyone" group chat for all users
- Typing indicator and Seen / Sent status in direct messages
- Chat history, with "Load older messages"
- Profile page: profile photo, display name and bio
- Change password from the profile page
- Share link button
- Black and white home page and bottom navigation (Home and Chat)
- Works on phone and desktop

## Tech stack

- HTML, CSS and JavaScript (a single `index.html` file, no build step)
- Firebase Authentication (Email/Password)
- Firebase Realtime Database
- GitHub Pages for hosting

## Setup

### 1. Firebase (free Spark plan)

1. Go to https://console.firebase.google.com and create a project.
2. **Authentication → Sign-in method → Add new provider → Email/Password** and enable the first switch (not "Email link"). Save.
3. **Realtime Database → Create database** (choose a location, start in locked mode).
4. Open the **Rules** tab, paste the rules below (also saved in `rules.json`) and press **Publish**.
5. **Project settings → General → Your apps → Web (`</>`)**, register an app and copy the `firebaseConfig` values.
6. Open `index.html`, find the `firebaseConfig` block and replace the `PASTE_HERE` values with yours (make sure `databaseURL` is included).

### 2. Database rules

```json
{
  "rules": {
    "messages": {
      ".read": "auth != null",
      ".indexOn": [
        "t"
      ],
      "$id": {
        ".write": "auth != null && !data.exists()",
        ".validate": "newData.child('uid').val() === auth.uid && newData.child('text').isString() && newData.child('text').val().length <= 500"
      }
    },
    "usernames": {
      ".read": "auth != null",
      "$k": {
        ".write": "auth != null && (!data.exists() || data.child('uid').val() === auth.uid)",
        ".validate": "newData.child('uid').val() === auth.uid"
      }
    },
    "dms": {
      "$cid": {
        ".read": "auth != null && (data.child('meta/a').val() === auth.uid || data.child('meta/b').val() === auth.uid)",
        "meta": {
          ".write": "auth != null && !data.exists() && newData.child('a').val() === auth.uid && $cid.contains(auth.uid) && $cid.contains(newData.child('b').val())",
          ".validate": "newData.hasChildren(['a','b'])"
        },
        "msgs": {
          ".indexOn": [
            "t"
          ],
          "$m": {
            ".write": "auth != null && !data.exists() && (root.child('dms/'+$cid+'/meta/a').val() === auth.uid || root.child('dms/'+$cid+'/meta/b').val() === auth.uid)",
            ".validate": "newData.child('uid').val() === auth.uid && newData.child('text').isString() && newData.child('text').val().length <= 500"
          }
        },
        "typing": {
          "$u": {
            ".write": "auth != null && $u === auth.uid && (root.child('dms/'+$cid+'/meta/a').val() === auth.uid || root.child('dms/'+$cid+'/meta/b').val() === auth.uid)",
            ".validate": "newData.isBoolean()"
          }
        },
        "seen": {
          "$u": {
            ".write": "auth != null && $u === auth.uid && (root.child('dms/'+$cid+'/meta/a').val() === auth.uid || root.child('dms/'+$cid+'/meta/b').val() === auth.uid)",
            ".validate": "newData.isNumber()"
          }
        }
      }
    },
    "inbox": {
      "$uid": {
        ".read": "auth != null && auth.uid === $uid",
        "$cid": {
          ".write": "auth != null",
          ".validate": "newData.hasChildren(['with','withUid','last','t'])"
        }
      }
    },
    "profiles": {
      ".read": "auth != null",
      "$uid": {
        ".write": "auth != null && auth.uid === $uid",
        ".validate": "newData.hasChildren() && (!newData.child('photo').exists() || (newData.child('photo').isString() && newData.child('photo').val().length < 40000)) && (!newData.child('bio').exists() || (newData.child('bio').isString() && newData.child('bio').val().length <= 150)) && (!newData.child('name').exists() || (newData.child('name').isString() && newData.child('name').val().length <= 30))"
      }
    }
  }
}
```

### 3. Host on GitHub Pages

1. Create a new public repository and upload `index.html` (and this README).
2. **Settings → Pages → Build and deployment → Deploy from a branch → main / (root) → Save**.
3. After a minute the site is live at `https://<your-username>.github.io/<repo>/`.
4. In Firebase go to **Authentication → Settings → Authorized domains → Add domain** and add `<your-username>.github.io` (without `https://` and without the repo name).

## How it works

- A username is turned into an internal login address (`username@safechat.app`), so no real email is needed. Firebase keeps usernames unique.
- Direct messages are stored under `dms/<chatId>`. Only the two people in a chat can read them (enforced by the database rules).
- Each user has a private `inbox` that lists their chats.
- Typing and seen state are stored under `dms/<chatId>/typing` and `dms/<chatId>/seen`.

## Notes

- The Firebase `apiKey` in `index.html` is not a secret. GitHub may show a "secret detected" alert for it. You can close that alert. Your data is protected by the database rules, not by hiding this key.
- You can change your password from the Profile tab. There is no "forgot password" email reset (accounts do not use real emails), so a forgotten password means creating a new account.
- Profile photos are resized to a small square and stored inside the Realtime Database (no Firebase Storage needed).
- Free plan limits apply (storage, downloads per month and simultaneous connections). Check https://firebase.google.com/pricing for the current numbers.
- Changing a username is not supported, because the username is the account login.

## Files

| File | Purpose |
| --- | --- |
| `index.html` | The whole app (HTML, CSS and JavaScript) |
| `rules.json` | Firebase Realtime Database rules |
| `README.md` | This file |
