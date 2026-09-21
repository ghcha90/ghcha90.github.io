# Gyuhyon Lab website

Public site: https://ghcha90.github.io/

Content is maintained in `content/*.json` through Pages CMS. Keep the JSON field
names, `.pages.yml`, and `assets/site.js` in sync when changing the content model.

## Publishing

GitHub Pages uses the **GitHub Actions** publishing source. Every push to `main`,
including a Pages CMS save, runs `.github/workflows/pages.yml`. The workflow renders
all seven pages from the current JSON, tests the output, and deploys `dist/`.
Do not switch Pages back to direct branch publishing: the source HTML is a template.

The static Korean HTML contains the actual content and navigation before JavaScript
runs. The same renderer continues to support English and remember the visitor's
language preference. If runtime content requests fail, the rendered page remains.

## Local development

With Node.js 22 or newer:

```sh
npm install --ignore-scripts
npx playwright install chromium
npm run build
npm test
```

`BROWSER_CHANNEL=msedge` can select an installed Edge browser for local checks.
Only public HTML, assets, content JSON, images, robots.txt, and sitemap.xml enter
the output. Source scripts and repository configuration are not deployed.

Per-page Korean/English titles and descriptions live in the HTML head's `data-ko`
and `data-en` attributes. The build generates structured data from the current
public site and professor records. The approved hero headline is unchanged.

## Search registration

Sitemap: https://ghcha90.github.io/sitemap.xml

Register the HTTPS URL in Google Search Console and Naver Search Advisor separately,
verify ownership, and submit the sitemap. Deployment does not perform those account
registrations or guarantee search indexing/rankings.
