# Changelog

## 1.1.0 (November 2026)

### Added

- Documents area, with the annual work plan in the featured place. It replaces the list of activities.
- Up to 10 photos per article, opened in full without cropping, in a gallery usable from the keyboard.
- Publish and save as draft buttons on articles, offers and documents.
- Offer pages with an optional poster, and price, deadline and apply button always in view.
- Roles: `ADMIN` for content, `SUPERADMIN` for accounts. Account management and activity log pages.
- Legal notice and privacy policy. The application form asks for consent to storage outside Benin.
- Page titles, link previews, sitemap and robots rules.
- Unit tests, browser tests, CI, CodeQL, Dependabot and database migrations.

### Changed

- Sign in uses an email code only. Passwords are gone.
- Applicants' documents move to a private bucket, PDF only, and are deleted after 6 months with their application.
- Rate limits are counted in PostgreSQL. The Upstash dependency is gone.
- Phone numbers and WhatsApp links follow the Benin format with the 01 prefix.
- Dates are shown in Benin time, and an offer stays open until the end of its last day.
- Photos are resized in the browser before upload.

### Fixed

- Admin routes and pages all check the session on the server, including deleting an application.
- Drafts no longer appear through the public API.
- Login codes come from a secure generator, are stored hashed and compared in constant time, with a limit on attempts that holds under parallel requests.
- The answer to a login code request no longer reveals which addresses have an account.
- Article HTML is sanitized, and the Content Security Policy uses a nonce instead of allowing inline scripts.
- Removing an account or changing a role applies at once instead of after the session expires.
- Storage no longer accepts anonymous uploads, and files are deleted with their content.
- Public pages no longer set cookies.
- Dependencies are updated: `npm audit` reports nothing for production packages.
- Form fields have labels, text reaches the required contrast, and error pages are in French.

## 1.0.0 (May 2026)

First version: news articles, tracking of the annual work plan, offers with online applications, and an admin area.
