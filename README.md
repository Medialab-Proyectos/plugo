# v0-plugo-app-development

This is a [Next.js](https://nextjs.org) project bootstrapped with [v0](https://v0.app).

## Built with v0

This repository is linked to a [v0](https://v0.app) project. You can continue developing by visiting the link below -- start new chats to make changes, and v0 will push commits directly to this repo. Every merge to `main` will automatically deploy.

[Continue working on v0 →](https://v0.app/chat/projects/prj_go2LLveZOT5whdfZtn8I5wi6YiXi)

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## Android wrapper

This repo now includes a Capacitor Android shell that loads the deployed web app inside an APK.

1. Set `CAPACITOR_APP_URL` to the public URL you want to embed.
2. Run `npm run mobile:android:sync`.
3. Open Android Studio with `npm run mobile:android:open` or build from `android/`.

For GitHub Actions, define the repository variable `CAPACITOR_APP_URL`. The workflow at `.github/workflows/android-apk.yml` will generate and upload a debug APK artifact.

## Learn More

To learn more, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.
- [v0 Documentation](https://v0.app/docs) - learn about v0 and how to use it.

<a href="https://v0.app/chat/api/kiro/clone/Medialab-Proyectos/v0-plugo-app-development" alt="Open in Kiro"><img src="https://pdgvvgmkdvyeydso.public.blob.vercel-storage.com/open%20in%20kiro.svg?sanitize=true" /></a>
