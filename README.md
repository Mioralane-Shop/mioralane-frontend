This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Security: rendering user content

**If you need to render user content as HTML, you cannot.** Use React's text
rendering — `{value}` inside JSX escapes it, and that is what every screen here
relies on.

If you truly need HTML, ping the security team first — you're about to add an XSS
sink that CI will reject.

`npm run verify:no-html-sinks` enforces this. It fails on
`dangerouslySetInnerHTML`, `innerHTML`, `outerHTML`, `insertAdjacentHTML`,
`document.write`, `srcdoc` / `srcDoc`, `eval(`, `new Function(`, and the string
forms of `setTimeout` / `setInterval` anywhere under `src/` — and on any
`href={…}` that reads a URL-carrying value, because a stored URL may only become
an href through `safeHref()` (`src/lib/safe-href.ts`).

Do not expect the CSP to catch this for you: `src/middleware.ts` ships
`Content-Security-Policy-Report-Only` **permanently**, by decision — enforcing it
would break every prerendered route (see the note in that file). A Report-Only
policy reports a violation *after* the sink has run. This invariant is what stops
the sink being written.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
