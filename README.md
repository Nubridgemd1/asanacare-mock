# Asana Care & Mental Wellness — website

Telepsychiatry practice of **Asana Aruna, MSN, APRN, PMHNP-BC** — 100% online across **Texas & California**. Modeled on the Oasis Behavioral Health design, in Asana's **violet + green** brand.

Live (GitHub Pages): the **main site** is the repo root; **admin** is `admin.html`.

## Pages
| File | What |
|---|---|
| `index.html` | Main site — hero, provider feature (headshot), psychiatric evaluations, photo reel, insurance, contact |
| `about.html` | About Asana — bio, credentials, headshot |
| `psychiatric-evaluations.html` | Service detail page |
| `journal.html` | The Asana Journal — 10 shareable articles with live comments |
| `admin.html` | Practice admin — appointments, content, comment moderation (passcode `asana2026`) |
| `assets/` | Headshot, photo-reel images, logo (inline SVG), `oasis-sync.js` |

## Booking
The **Book Now** modal links to the practice's real schedulers:
- **Tebra** — https://www.tebra.com/care/practice/asana-care-mental-wellness-884819
- **Zocdoc** — https://www.zocdoc.com/practice/asana-care-and-mental-wellness-144556

A secondary "send a request" form can email the office and log to admin (set a Web3Forms key).

## Contact
- info@asanacarementalwellness.com · (559) 372-4506 · Fax (559) 372-4507
- Psychology Today: https://www.psychologytoday.com/us/psychiatrists/asana-aruna-los-angeles-ca/1506593

## Shared / live data (optional)
`assets/oasis-sync.js` runs in **local/demo mode** by default (keys blank) so the site shows the built-in Asana details. To make admin edits live and shared across devices, create a free Supabase project (run `SUPABASE-SETUP.sql` + `SUPABASE-STORAGE.sql`) and paste the Project URL + anon key into `assets/oasis-sync.js`.
