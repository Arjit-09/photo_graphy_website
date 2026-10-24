# Frame by Frame

A Next.js App Router photography portfolio with a scroll-driven couple → photographer → lens → flash → framed print → open album sequence.

## Develop

```sh
npm ci
npm run dev
```

## Validate and deploy

```sh
npm run typecheck
npm run build
```

The production site exports to `out/`. Serve it with any static host, or remove `output: 'export'` from `next.config.ts` to use Next.js server hosting. No server round trips are required for the scroll sequence. Images and fonts are local, videos load only when opened, and scroll updates use requestAnimationFrame and CSS transforms rather than per-frame React renders.

## Client handoff

- Replace the illustrative stock photography and films in `public/media/` with licensed client work.
- Update brand, copy, metadata, and the gallery data in `app/page.tsx` and `app/layout.tsx`.
- The enquiry form currently validates and downloads a brief. It does **not** send mail, create a booking, or store enquiries. Connect a real delivery service before launching a client booking campaign.
- Gentle mode disables the flash and large transforms. System reduced-motion preferences are respected automatically.
- Navigation, chapter controls, gallery filtering, album turning, lightbox, native video controls, FAQs, and the downloadable enquiry are implemented.
- Instagram references were inaccessible during development; the animation follows the supplied written storyboard.

## Asset sources

Illustrative photos downloaded from Unsplash image IDs: `1519741497674-611481863552`, `1511285560929-80b456fea0bc`, `1537633552985-df8429e8048b`, `1516035069371-29a1b244cc32`, `1470071459604-3b5ec3a7fe05`, `1524504388940-b1c1722653e1`, `1554048612-b6a482bc67e5`. Review the [Unsplash license](https://unsplash.com/license) when replacing or distributing assets.

Sample films from Mixkit: [Just married couple](https://mixkit.co/free-stock-video/just-married-couple-40599/) and [Newlyweds walking through a garden](https://mixkit.co/free-stock-video/newlyweds-walking-through-a-garden-40584/). Review the asset-specific [Mixkit license](https://mixkit.co/license/#videoFree) for the final client usage.

Self-hosted typography: DM Sans and Italiana from Google Fonts (SIL Open Font License).
