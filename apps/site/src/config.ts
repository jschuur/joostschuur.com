// Place any global data in this file.
// You can import this data from anywhere in your site by using the `import` keyword.

export const SITE_TITLE = 'Joost Schuur';
export const SITE_DESCRIPTION =
  'JavaScript, product developemt, workflow tools, content curation and more.';
export const TWITTER_HANDLE = '@joostschuur';
export const MY_NAME = 'Joost Schuur';
export const GOOGLE_ANALYTICS_ID = 'G-3GLM22RF0C';
export const FEATURED_POST_COUNT = 4;

// setup in astro.config.mjs
const BASE_URL = new URL(import.meta.env.SITE);
export const SITE_URL = BASE_URL.origin;
