import { getAllRedirects } from './redirects.js';

chrome.runtime.onInstalled.addListener(() => {
  console.log('Privacy Redirect extension installed');
  
  chrome.storage.sync.get(['customRedirects', 'defaultRedirectSettings'], (result) => {
    if (!result.customRedirects) {
      chrome.storage.sync.set({ customRedirects: [] });
    }
    if (!result.defaultRedirectSettings) {
      chrome.storage.sync.set({ defaultRedirectSettings: {} });
    }
    
    updateRedirectRules();
  });
});

function createRedirectRules(redirect, startId) {
  const rules = [];
  
  rules.push({
    id: startId,
    priority: 1,
    action: {
      type: 'redirect',
      redirect: {
        transform: {
          scheme: 'https',
          host: redirect.targetHost
        }
      }
    },
    condition: {
      urlFilter: `*://www.${redirect.sourceHost}/*`,
      resourceTypes: ['main_frame']
    }
  });
  
  rules.push({
    id: startId + 1,
    priority: 1,
    action: {
      type: 'redirect',
      redirect: {
        transform: {
          scheme: 'https',
          host: redirect.targetHost
        }
      }
    },
    condition: {
      urlFilter: `*://${redirect.sourceHost}/*`,
      excludedInitiatorDomains: [`www.${redirect.sourceHost}`],
      resourceTypes: ['main_frame']
    }
  });
  
  return rules;
}

async function updateRedirectRules() {
  try {
    const redirects = await getAllRedirects();
    const rules = [];
    
    let ruleId = 1;
    for (const redirect of redirects) {
      if (redirect.enabled) {
        const redirectRules = createRedirectRules(redirect, ruleId);
        rules.push(...redirectRules);
        ruleId += 2;
      }
    }
    
    const existingRules = await chrome.declarativeNetRequest.getDynamicRules();
    const existingRuleIds = existingRules.map(rule => rule.id);
    
    if (existingRuleIds.length > 0) {
      await chrome.declarativeNetRequest.updateDynamicRules({
        removeRuleIds: existingRuleIds
      });
    }
    
    if (rules.length > 0) {
      await chrome.declarativeNetRequest.updateDynamicRules({
        addRules: rules
      });
    }
    
    console.log('Updated redirect rules:', rules);
  } catch (error) {
    console.error('Error updating redirect rules:', error);
  }
}

chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'sync' && 
      (changes.customRedirects || changes.defaultRedirectSettings)) {
    console.log('Redirect settings changed, updating rules');
    updateRedirectRules();
  }
}); 