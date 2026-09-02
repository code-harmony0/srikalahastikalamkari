/**
 * Master switch for taking the public site offline.
 *
 * When true:
 *  - every route is redirected to `/`, which renders the unavailable notice
 *  - the storefront chrome (header, footer, floating buttons) is not rendered
 *  - all brand metadata, JSON-LD and social cards are replaced with a neutral
 *    title, and the site is marked noindex
 *
 * Set to false to bring the site back exactly as it was.
 */
export const SITE_OFFLINE = true
