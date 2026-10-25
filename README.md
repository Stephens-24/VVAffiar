# Vincent & Vida — #VVAffair26

Wedding website for Vincent & Vida, Saturday 14 November 2026, St. Peter Parish, Vakpo.

A single static page: `index.html` plus the `assets` folder. No build step. Open `index.html` in a browser, or host the folder on any static host (GitHub Pages, Netlify, Vercel).

## What's on the page

- Hero, date and live countdown, photo slideshow, schedule with map links, gifts note and closing section
- Mobile-first layout from the Figma phone frame (393px), scaling up to the desktop frame (1440px)
- RSVP form: bottom sheet on phones, pop-up on larger screens
- Background music from YouTube, started by the guest's first tap or the music button

## RSVPs to Google Sheets

RSVPs are saved by a Google Apps Script, `rsvp-google-sheet/Code.gs`. Setup steps are at the top of that file. Once it's deployed, paste the Web app URL into `RSVP_ENDPOINT` near the top of the script in `index.html`.

## Publish with GitHub Pages

Repository **Settings → Pages → Build and deployment**: Source "Deploy from a branch", branch `main`, folder `/ (root)`. The site will be at `https://stephens-24.github.io/VVAffiar/`.
