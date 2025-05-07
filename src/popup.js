// Import the redirects module
import { DEFAULT_REDIRECTS } from './redirects.js';

document.addEventListener('DOMContentLoaded', async () => {
  const statusElement = document.getElementById('status');
  const openOptionsButton = document.getElementById('openOptions');
  
  chrome.storage.sync.get(['defaultRedirectSettings', 'customRedirects'], (result) => {
    const defaultSettings = result.defaultRedirectSettings || {};
    const customRedirects = result.customRedirects || [];
    
    let enabledCount = 0;
    
    for (const id in defaultSettings) {
      if (defaultSettings[id]) {
        enabledCount++;
      }
    }
    
    for (const redirect of customRedirects) {
      if (redirect.enabled) {
        enabledCount++;
      }
    }
    
    if (enabledCount > 0) {
      statusElement.textContent = `Active: ${enabledCount} redirects enabled`;
      statusElement.classList.add('enabled');
      statusElement.classList.remove('disabled');
    } else {
      statusElement.textContent = 'All redirects are disabled';
      statusElement.classList.add('disabled');
      statusElement.classList.remove('enabled');
    }
  });
  
  openOptionsButton.addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
  });
});
