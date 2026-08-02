# Cloud sync setup (Firebase)

Cloud sync is optional. Without it, Arc runs local-first and the archive works in
the browser. This guide adds accounts so your weeks follow you across devices.

The code is already written (`lib/firebase.ts`, `lib/cloud.ts`,
`components/CloudProvider.tsx`). These are the console steps only you can do,
about ten minutes. Nothing here is a secret: Firebase web config is meant to be
public, and security is enforced by the Firestore rules below.

## 1. Create the Firebase project

1. Go to https://console.firebase.google.com and click **Add project**.
2. Name it (for example `arc`). Analytics is optional.

## 2. Add a web app and copy the config

1. In the project, click the **web** icon (`</>`) to register a web app.
2. Firebase shows a `firebaseConfig` object. You need these six values:
   `apiKey`, `authDomain`, `projectId`, `storageBucket`, `messagingSenderId`,
   `appId`.

## 3. Enable Google sign-in

1. Build → **Authentication** → **Get started**.
2. **Sign-in method** → enable **Google** → save.
3. **Authentication → Settings → Authorized domains**: add
   `arc-gold-beta.vercel.app` (and `localhost` is already there for local dev).

## 4. Create Firestore and set the rules

1. Build → **Firestore Database** → **Create database** → start in production mode.
2. **Rules** tab → paste this and publish. It scopes every user to their own weeks:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{uid}/weeks/{weekId} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
    }
  }
}
```

## 5. Put the config into the environment

Add the six values from step 2 as environment variables. Locally, in `.env.local`:

```
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
```

On Vercel: Project → **Settings → Environment Variables** → add the same six for
Production, then redeploy.

## 6. Verify

Open `/weeks`. A sync bar appears once Firebase is configured. Click **sign in
with Google**. Your local weeks push up, cloud weeks pull down, and the two
stores merge (newest wins per week). Sign in on another device to confirm they
follow you.

## How it works

- `users/{uid}/weeks/{weekId}` holds one document per saved week, the same shape
  as the local `SavedWeek`.
- Sign-in triggers a two-way merge (`mergeOnSignIn`): newest `savedAt` wins per
  id, and local-only weeks are pushed up.
- Every save and delete after that mirrors to the cloud, and no-ops when signed
  out or unconfigured, so nothing else in the app needs to know about Firebase.
