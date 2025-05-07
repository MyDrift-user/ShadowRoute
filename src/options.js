import { 
  DEFAULT_REDIRECTS, 
  getAllRedirects, 
  saveDefaultRedirectSettings, 
  saveCustomRedirects 
} from './redirects.js';

// DOM elements
const defaultRedirectsContainer = document.getElementById('defaultRedirects');
const customRedirectsContainer = document.getElementById('customRedirects');
const addForm = document.getElementById('addForm');
const showAddFormButton = document.getElementById('showAddForm');
const saveRedirectButton = document.getElementById('saveRedirect');
const cancelAddButton = document.getElementById('cancelAdd');
const statusMessage = document.getElementById('statusMessage');

// Form fields
const nameInput = document.getElementById('name');
const descriptionInput = document.getElementById('description');
const sourceHostInput = document.getElementById('sourceHost');
const targetHostInput = document.getElementById('targetHost');

// Current state
let defaultSettings = {};
let customRedirects = [];
let editingIndex = -1;

async function init() {
  chrome.storage.sync.get(['defaultRedirectSettings', 'customRedirects'], (result) => {
    defaultSettings = result.defaultRedirectSettings || {};
    customRedirects = result.customRedirects || [];
    
    renderDefaultRedirects();
    renderCustomRedirects();
  });
}

function renderDefaultRedirects() {
  defaultRedirectsContainer.innerHTML = '';
  
  DEFAULT_REDIRECTS.forEach(redirect => {
    const isEnabled = defaultSettings[redirect.id] !== undefined 
      ? defaultSettings[redirect.id] 
      : redirect.enabled;
    
    const redirectItem = document.createElement('div');
    redirectItem.className = 'redirect-item';
    redirectItem.innerHTML = `
      <div class="redirect-content">
        <div class="redirect-name">${redirect.name}</div>
        ${redirect.description ? `<div class="redirect-description">${redirect.description}</div>` : ''}
        <div>
          <span class="redirect-pattern">From: ${redirect.sourceHost}</span>
          <a href="https://${redirect.targetHost}" target="_blank" class="redirect-target">To: ${redirect.targetHost}</a>
        </div>
      </div>
      <div class="redirect-actions">
        <label class="switch">
          <input type="checkbox" data-id="${redirect.id}" ${isEnabled ? 'checked' : ''}>
          <span class="slider"></span>
        </label>
      </div>
    `;
    
    // Add event listener for toggle
    const toggleSwitch = redirectItem.querySelector('input[type="checkbox"]');
    toggleSwitch.addEventListener('change', (e) => {
      toggleDefaultRedirect(redirect.id, e.target.checked);
    });
    
    defaultRedirectsContainer.appendChild(redirectItem);
  });
}

// Render custom redirects
function renderCustomRedirects() {
  customRedirectsContainer.innerHTML = '';
  
  if (customRedirects.length === 0) {
    customRedirectsContainer.innerHTML = '<p>No custom redirects added yet.</p>';
    return;
  }
  
  customRedirects.forEach((redirect, index) => {
    const redirectItem = document.createElement('div');
    redirectItem.className = 'redirect-item';
    redirectItem.innerHTML = `
      <div class="redirect-content">
        <div class="redirect-name">${redirect.name}</div>
        ${redirect.description ? `<div class="redirect-description">${redirect.description}</div>` : ''}
        <div>
          <span class="redirect-pattern">From: ${redirect.sourceHost}</span>
          <a href="https://${redirect.targetHost}" target="_blank" class="redirect-target">To: ${redirect.targetHost}</a>
        </div>
      </div>
      <div class="redirect-actions">
        <button class="edit-button" data-index="${index}">Edit</button>
        <button class="delete-button secondary" data-index="${index}">Delete</button>
        <label class="switch">
          <input type="checkbox" data-index="${index}" ${redirect.enabled ? 'checked' : ''}>
          <span class="slider"></span>
        </label>
      </div>
    `;
    
    // Add event listeners
    const toggleSwitch = redirectItem.querySelector('input[type="checkbox"]');
    toggleSwitch.addEventListener('change', (e) => {
      toggleCustomRedirect(index, e.target.checked);
    });
    
    const editButton = redirectItem.querySelector('.edit-button');
    editButton.addEventListener('click', () => {
      editCustomRedirect(index);
    });
    
    const deleteButton = redirectItem.querySelector('.delete-button');
    deleteButton.addEventListener('click', () => {
      deleteCustomRedirect(index);
    });
    
    customRedirectsContainer.appendChild(redirectItem);
  });
}

function toggleDefaultRedirect(id, enabled) {
  defaultSettings[id] = enabled;
  saveDefaultRedirectSettings(defaultSettings).then(() => {
    showStatus('Default redirect updated', 'success');
  });
}

function toggleCustomRedirect(index, enabled) {
  customRedirects[index].enabled = enabled;
  saveCustomRedirects(customRedirects).then(() => {
    showStatus('Custom redirect updated', 'success');
  });
}

function deleteCustomRedirect(index) {
  if (confirm('Are you sure you want to delete this redirect?')) {
    customRedirects.splice(index, 1);
    saveCustomRedirects(customRedirects).then(() => {
      renderCustomRedirects();
      showStatus('Custom redirect deleted', 'success');
    });
  }
}

// Edit custom redirect
function editCustomRedirect(index) {
  const redirect = customRedirects[index];
  
  nameInput.value = redirect.name;
  descriptionInput.value = redirect.description;
  sourceHostInput.value = redirect.sourceHost;
  targetHostInput.value = redirect.targetHost;
  
  editingIndex = index;
  
  addForm.style.display = 'block';
  showAddFormButton.style.display = 'none';
}

function addOrUpdateRedirect() {
  // Validate form
  if (!nameInput.value || !sourceHostInput.value || !targetHostInput.value) {
    showStatus('Please fill all required fields', 'error');
    return;
  }
  
  const redirect = {
    id: `custom_${Date.now()}`,
    name: nameInput.value,
    description: descriptionInput.value || '',
    enabled: true,
    sourceHost: sourceHostInput.value,
    targetHost: targetHostInput.value
  };
  
  if (editingIndex >= 0) {
    redirect.id = customRedirects[editingIndex].id;
    customRedirects[editingIndex] = redirect;
  } else {
    customRedirects.push(redirect);
  }
  
  saveCustomRedirects(customRedirects).then(() => {
    renderCustomRedirects();
    resetForm();
    
    if (editingIndex >= 0) {
      showStatus('Custom redirect updated', 'success');
    } else {
      showStatus('Custom redirect added', 'success');
    }
  });
}

function resetForm() {
  nameInput.value = '';
  descriptionInput.value = '';
  sourceHostInput.value = '';
  targetHostInput.value = '';
  editingIndex = -1;
  addForm.style.display = 'none';
  showAddFormButton.style.display = 'block';
}

function showStatus(message, type) {
  statusMessage.textContent = message;
  statusMessage.className = `status-message ${type}`;
  statusMessage.style.display = 'block';
  
  setTimeout(() => {
    statusMessage.style.display = 'none';
  }, 3000);
}

showAddFormButton.addEventListener('click', () => {
  addForm.style.display = 'block';
  showAddFormButton.style.display = 'none';
});

cancelAddButton.addEventListener('click', resetForm);

saveRedirectButton.addEventListener('click', addOrUpdateRedirect);

document.addEventListener('DOMContentLoaded', init);
