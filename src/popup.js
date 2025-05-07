import { DEFAULT_REDIRECTS, getAllRedirects, saveDefaultRedirectSettings, saveCustomRedirects } from './redirects.js';
document.addEventListener('DOMContentLoaded', async () => {
  const redirectList = document.getElementById('redirectList');
  const noRedirects = document.getElementById('noRedirects');
  const openOptionsButton = document.getElementById('openOptions');
  
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const currentUrl = new URL(tab.url);
  const currentHost = currentUrl.hostname.replace(/^www\./, '');
  
  const redirects = await getAllRedirects();
  const { defaultRedirectSettings } = await chrome.storage.sync.get('defaultRedirectSettings');
  const { customRedirects } = await chrome.storage.sync.get('customRedirects');
  
  const relevantRedirects = redirects.filter(redirect => {
    const sourceHost = redirect.sourceHost.replace(/^www\./, '');
    const targetHost = redirect.targetHost.replace(/^www\./, '');
    return sourceHost === currentHost || targetHost === currentHost;
  });
  
  if (relevantRedirects.length === 0) {
    redirectList.style.display = 'none';
    noRedirects.style.display = 'block';
  } else {
    redirectList.style.display = 'block';
    noRedirects.style.display = 'none';
    
    relevantRedirects.forEach(redirect => {
      const isEnabled = redirect.id.startsWith('custom_') 
        ? customRedirects?.find(r => r.id === redirect.id)?.enabled ?? false
        : defaultRedirectSettings?.[redirect.id] ?? false;
      
      const redirectItem = document.createElement('div');
      redirectItem.className = 'redirect-item';
      redirectItem.innerHTML = `
        <div class="redirect-name">${redirect.name}</div>
        <label class="switch">
          <input type="checkbox" data-id="${redirect.id}" ${isEnabled ? 'checked' : ''}>
          <span class="slider"></span>
        </label>
      `;
      
      const toggleSwitch = redirectItem.querySelector('input[type="checkbox"]');
      toggleSwitch.addEventListener('change', async (e) => {
        try {
          if (redirect.id.startsWith('custom_')) {
            const updatedCustomRedirects = customRedirects.map(r => 
              r.id === redirect.id ? { ...r, enabled: e.target.checked } : r
            );
            await saveCustomRedirects(updatedCustomRedirects);
          } else {
            const updatedDefaultSettings = {
              ...defaultRedirectSettings,
              [redirect.id]: e.target.checked
            };
            await saveDefaultRedirectSettings(updatedDefaultSettings);
          }
          
          await new Promise(resolve => setTimeout(resolve, 500));
          
          let targetUrl;
          if (e.target.checked) {
            targetUrl = `https://${redirect.targetHost}${currentUrl.pathname}${currentUrl.search}`;
          } else {
            targetUrl = `https://${redirect.sourceHost}${currentUrl.pathname}${currentUrl.search}`;
          }
          
          await chrome.tabs.update(tab.id, { url: targetUrl });
        } catch (error) {
          console.error('Error updating redirect:', error);
          e.target.checked = !e.target.checked;
        }
      });
      
      redirectList.appendChild(redirectItem);
    });
  }
  
  openOptionsButton.addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
  });
});
