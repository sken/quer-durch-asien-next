// Sections of the site that are built already. Links to the others render as
// plain labels ("kommt bald") instead of links to pages that would 404.
// Remove an entry from SOON when its page lands.
export const SOON = new Set(["/packliste/", "/impressum/", "/datenschutz/"]);

export const isSoon = (href: string) => SOON.has(href);
