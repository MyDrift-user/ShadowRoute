// Default redirects configuration
const DEFAULT_REDIRECTS = [
  {
    id: 'google',
    name: 'Google Search',
    description: 'Redirect Google Search to DuckDuckGo',
    enabled: true,
    sourceHost: 'google.com',
    targetHost: 'duckduckgo.com'
  },
  {
    id: 'youtube',
    name: 'YouTube',
    description: 'Redirect YouTube to Invidious (yewtu.be)',
    enabled: true,
    sourceHost: 'youtube.com',
    targetHost: 'yewtu.be'
  },
  {
    id: 'twitter',
    name: 'Twitter',
    description: 'Redirect Twitter to Nitter',
    enabled: true,
    sourceHost: 'twitter.com',
    targetHost: 'nitter.net'
  },
  {
    id: 'instagram',
    name: 'Instagram',
    description: 'Redirect Instagram to Bibliogram',
    enabled: true,
    sourceHost: 'instagram.com',
    targetHost: 'bibliogram.art'
  },
  {
    id: 'reddit',
    name: 'Reddit',
    description: 'Redirect Reddit to Teddit',
    enabled: true,
    sourceHost: 'reddit.com',
    targetHost: 'redlib.catsarch.com'
  }
];

async function getAllRedirects() {
  return new Promise((resolve) => {
    chrome.storage.sync.get(['customRedirects', 'defaultRedirectSettings'], (result) => {
      const customRedirects = result.customRedirects || [];
      
      const defaultSettings = result.defaultRedirectSettings || {};
      const defaultRedirects = DEFAULT_REDIRECTS.map(redirect => {
        if (defaultSettings[redirect.id] !== undefined) {
          return { ...redirect, enabled: defaultSettings[redirect.id] };
        }
        return redirect;
      });
      
      resolve([...defaultRedirects, ...customRedirects]);
    });
  });
}

async function saveDefaultRedirectSettings(settings) {
  return new Promise((resolve) => {
    chrome.storage.sync.set({ defaultRedirectSettings: settings }, resolve);
  });
}

async function saveCustomRedirects(redirects) {
  return new Promise((resolve) => {
    chrome.storage.sync.set({ customRedirects: redirects }, resolve);
  });
}

export {
  DEFAULT_REDIRECTS,
  getAllRedirects,
  saveDefaultRedirectSettings,
  saveCustomRedirects
};
