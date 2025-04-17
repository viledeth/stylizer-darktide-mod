// UI Utilities for Master Works SPA

import { StylesUtil } from './defaultStyles.js';

// Create a tier card element for basic mode
function _createBasicTierCard(tierKey, tierData, onChange) {
  const tier = document.createElement('div');
  tier.className = 'tier-card';
  tier.dataset.tierKey = tierKey;
  
  // Get hex color for display
  const r = tierData.base_unified_color[1];
  const g = tierData.base_unified_color[2];
  const b = tierData.base_unified_color[3];
  const hexColor = _rgbToHex(r, g, b);
  
  // Create gradient for visual appeal
  const gradient = document.createElement('div');
  gradient.className = 'tier-card-gradient';
  gradient.id = `${tierKey}-gradient`;
  gradient.style.background = `linear-gradient(to bottom, ${hexColor}40 0%, var(--panel-bg) 100%)`;
  tier.appendChild(gradient);
  
  // Create tier header with color preview
  const header = document.createElement('div');
  header.className = 'tier-header';
  header.innerHTML = `
    <div class="tier-title">
      <span class="tier-color-preview" style="background-color: ${hexColor};"></span>
      <span class="tier-name">${tierData.display_name_tier.en || 'Unnamed'}</span>
      <span class="tier-tag">Rarity ${tierData.rarity}</span>
      ${tierData.needs_max_expertise ? '<span class="tier-tag max-expertise">Max Expertise</span>' : ''}
    </div>
  `;
  tier.appendChild(header);
  
  // Display name section
  const nameSection = document.createElement('div');
  nameSection.className = 'tier-section';
  nameSection.innerHTML = `
    <h3>Display Names</h3>
    <div class="input-group">
      <label for="${tierKey}-name">Quality Name:</label>
      <input type="text" id="${tierKey}-name" data-field="display_name_tier" data-lang="en" 
             value="${tierData.display_name_tier.en || ''}" placeholder="Quality Name">
    </div>
    <div class="input-group">
      <label for="${tierKey}-base-name">Base Item Name:</label>
      <input type="text" id="${tierKey}-base-name" data-field="display_base_name" data-lang="en"
             value="${tierData.display_base_name.en || ''}" placeholder="Base Item Name">
    </div>
  `;
  tier.appendChild(nameSection);
  
  // Color section
  const colorSection = document.createElement('div');
  colorSection.className = 'tier-section';
  colorSection.innerHTML = `
    <h3>Color</h3>
    <div class="color-picker">
      <div class="color-preview" style="background-color: ${hexColor};"></div>
      <div class="color-sliders">
        <div class="slider-row">
          <label>R:</label>
          <input type="range" min="0" max="255" value="${r}" data-color="r" class="color-slider">
          <input type="number" min="0" max="255" value="${r}" data-color="r" class="color-value">
        </div>
        <div class="slider-row">
          <label>G:</label>
          <input type="range" min="0" max="255" value="${g}" data-color="g" class="color-slider">
          <input type="number" min="0" max="255" value="${g}" data-color="g" class="color-value">
        </div>
        <div class="slider-row">
          <label>B:</label>
          <input type="range" min="0" max="255" value="${b}" data-color="b" class="color-slider">
          <input type="number" min="0" max="255" value="${b}" data-color="b" class="color-value">
        </div>
      </div>
    </div>
  `;
  tier.appendChild(colorSection);
  
  // Add options section
  const optionsSection = document.createElement('div');
  optionsSection.className = 'tier-section';
  
  // Only show options that make sense in basic mode
  optionsSection.innerHTML = `
    <h3>Options</h3>
    <div class="options-grid">
      <div class="option-item">
        <label class="checkbox-label">
          <input type="checkbox" data-option="unified_active" ${tierData.unified_active ? 'checked' : ''}>
          Use unified color
        </label>
      </div>
      <div class="option-item">
        <label class="checkbox-label">
          <input type="checkbox" data-option="unified_base_names" ${tierData.unified_base_names ? 'checked' : ''}>
          Use unified base names
        </label>
      </div>
    </div>
  `;
  tier.appendChild(optionsSection);
  
  // Add event listeners
  // Text inputs
  tier.querySelectorAll('input[type="text"]').forEach(input => {
    input.addEventListener('change', () => {
      const field = input.dataset.field;
      const lang = input.dataset.lang;
      
      if (!tierData[field]) {
        tierData[field] = {};
      }
      
      tierData[field][lang] = input.value;
      
      if (field === 'display_name_tier' && lang === 'en') {
        tier.querySelector('.tier-name').textContent = input.value || 'Unnamed';
      }
      
      if (onChange) onChange(tierKey, tierData);
    });
  });
  
  // Color sliders and inputs
  tier.querySelectorAll('.color-slider, .color-value').forEach(input => {
    input.addEventListener('input', (e) => {
      const colorComponent = input.dataset.color;
      const value = parseInt(input.value);
      
      // Update both range and number inputs
      tier.querySelectorAll(`[data-color="${colorComponent}"]`).forEach(el => {
        if (el !== e.target) {
          el.value = value;
        }
      });
      
      // Update the color in the data
      const idx = { r: 1, g: 2, b: 3 }[colorComponent];
      tierData.base_unified_color[idx] = value;
      
      // Also update all other color arrays to keep them in sync in basic mode
      tierData.weapons_unified_color[idx] = value;
      tierData.weapons_ranged_color[idx] = value;
      tierData.curio_color[idx] = value;
      tierData.other_item_color[idx] = value;
      
      // Update visual elements
      const hexColor = _rgbToHex(
        tierData.base_unified_color[1],
        tierData.base_unified_color[2],
        tierData.base_unified_color[3]
      );
      
      tier.querySelector('.color-preview').style.backgroundColor = hexColor;
      tier.querySelector('.tier-color-preview').style.backgroundColor = hexColor;
      tier.querySelector(`#${tierKey}-gradient`).style.background = 
        `linear-gradient(to bottom, ${hexColor}40 0%, var(--panel-bg) 100%)`;
      
      if (onChange) onChange(tierKey, tierData);
    });
  });
  
  // Checkboxes
  tier.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
    checkbox.addEventListener('change', () => {
      const option = checkbox.dataset.option;
      tierData[option] = checkbox.checked;
      
      if (onChange) onChange(tierKey, tierData);
    });
  });
  
  return tier;
}

// Create a tier card element for advanced mode
function _createAdvancedTierCard(tierKey, tierData, onChange) {
  const tier = document.createElement('div');
  tier.className = 'tier-card advanced';
  tier.dataset.tierKey = tierKey;
  
  // Get base color for display
  const r = tierData.base_unified_color[1];
  const g = tierData.base_unified_color[2];
  const b = tierData.base_unified_color[3];
  const hexColor = _rgbToHex(r, g, b);
  
  // Create gradient for visual appeal
  const gradient = document.createElement('div');
  gradient.className = 'tier-card-gradient';
  gradient.id = `adv-${tierKey}-gradient`;
  gradient.style.background = `linear-gradient(to bottom, ${hexColor}40 0%, var(--panel-bg) 100%)`;
  tier.appendChild(gradient);
  
  // Create tier header with color preview
  const header = document.createElement('div');
  header.className = 'tier-header';
  header.innerHTML = `
    <div class="tier-title">
      <span class="tier-color-preview" style="background-color: ${hexColor};"></span>
      <span class="tier-name">${tierData.display_name_tier.en || 'Unnamed'}</span>
      <span class="tier-tag">Rarity ${tierData.rarity}</span>
      ${tierData.needs_max_expertise ? '<span class="tier-tag max-expertise">Max Expertise</span>' : ''}
    </div>
  `;
  tier.appendChild(header);
  
  // Tier configuration tabs
  const tabContainer = document.createElement('div');
  tabContainer.className = 'tab-container';
  tabContainer.innerHTML = `
    <div class="tabs">
      <button class="tab-button active" data-tab="names">Names</button>
      <button class="tab-button" data-tab="colors">Colors</button>
      <button class="tab-button" data-tab="options">Options</button>
    </div>
  `;
  tier.appendChild(tabContainer);
  
  // Tab content container
  const tabContent = document.createElement('div');
  tabContent.className = 'tab-content';
  tier.appendChild(tabContent);
  
  // Names tab
  const namesTab = document.createElement('div');
  namesTab.className = 'tab-pane active';
  namesTab.dataset.tab = 'names';
  namesTab.innerHTML = `
    <div class="input-group">
      <label for="adv-${tierKey}-tier-name">Quality Name:</label>
      <input type="text" id="adv-${tierKey}-tier-name" data-field="display_name_tier" data-lang="en" 
             value="${tierData.display_name_tier.en || ''}" placeholder="Quality Name">
    </div>
    <div class="input-group">
      <label for="adv-${tierKey}-base-name">Base Item Name:</label>
      <input type="text" id="adv-${tierKey}-base-name" data-field="display_base_name" data-lang="en"
             value="${tierData.display_base_name.en || ''}" placeholder="Base Item Name">
    </div>
    <div class="input-group">
      <label for="adv-${tierKey}-curio-name">Curio Name:</label>
      <input type="text" id="adv-${tierKey}-curio-name" data-field="display_name_curio" data-lang="en"
             value="${tierData.display_name_curio.en || ''}" placeholder="Curio Name">
    </div>
    <div class="input-group">
      <label for="adv-${tierKey}-weapon-name">Weapon Name:</label>
      <input type="text" id="adv-${tierKey}-weapon-name" data-field="display_name_weapon" data-lang="en"
             value="${tierData.display_name_weapon.en || ''}" placeholder="Weapon Name">
    </div>
    <div class="input-group">
      <label for="adv-${tierKey}-ranged-name">Ranged Weapon Name:</label>
      <input type="text" id="adv-${tierKey}-ranged-name" data-field="display_name_weapon_ranged" data-lang="en"
             value="${tierData.display_name_weapon_ranged.en || ''}" placeholder="Ranged Weapon Name">
    </div>
    <div class="input-group">
      <label for="adv-${tierKey}-other-name">Other Item Name:</label>
      <input type="text" id="adv-${tierKey}-other-name" data-field="display_name_other" data-lang="en"
             value="${tierData.display_name_other.en || ''}" placeholder="Other Item Name">
    </div>
  `;
  tabContent.appendChild(namesTab);
  
  // Colors tab
  const colorsTab = document.createElement('div');
  colorsTab.className = 'tab-pane';
  colorsTab.dataset.tab = 'colors';
  
  // Function to create color control for a specific color property
  const createColorControl = (label, colorType, colorArray) => {
    const r = colorArray[1];
    const g = colorArray[2];
    const b = colorArray[3];
    const hexColor = _rgbToHex(r, g, b);
    
    return `
      <div class="color-control">
        <h4>${label}</h4>
        <div class="color-picker">
          <div class="color-preview" style="background-color: ${hexColor};" data-color-type="${colorType}"></div>
          <div class="color-sliders">
            <div class="slider-row">
              <label>R:</label>
              <input type="range" min="0" max="255" value="${r}" data-color="r" data-color-type="${colorType}" class="color-slider">
              <input type="number" min="0" max="255" value="${r}" data-color="r" data-color-type="${colorType}" class="color-value">
            </div>
            <div class="slider-row">
              <label>G:</label>
              <input type="range" min="0" max="255" value="${g}" data-color="g" data-color-type="${colorType}" class="color-slider">
              <input type="number" min="0" max="255" value="${g}" data-color="g" data-color-type="${colorType}" class="color-value">
            </div>
            <div class="slider-row">
              <label>B:</label>
              <input type="range" min="0" max="255" value="${b}" data-color="b" data-color-type="${colorType}" class="color-slider">
              <input type="number" min="0" max="255" value="${b}" data-color="b" data-color-type="${colorType}" class="color-value">
            </div>
          </div>
        </div>
      </div>
    `;
  };
  
  colorsTab.innerHTML = `
    <div class="color-options">
      ${createColorControl('Universal Color', 'base_unified_color', tierData.base_unified_color)}
      <hr class="color-divider">
      <div id="adv-${tierKey}-specific-colors" class="${tierData.unified_active ? 'hidden' : ''}">
        ${createColorControl('Weapons Universal', 'weapons_unified_color', tierData.weapons_unified_color)}
        <div id="adv-${tierKey}-ranged-color" class="${tierData.unified_weapons_colors ? 'hidden' : ''}">
          ${createColorControl('Ranged Weapons', 'weapons_ranged_color', tierData.weapons_ranged_color)}
        </div>
        ${createColorControl('Curios', 'curio_color', tierData.curio_color)}
        ${createColorControl('Other Items', 'other_item_color', tierData.other_item_color)}
      </div>
    </div>
  `;
  tabContent.appendChild(colorsTab);
  
  // Options tab
  const optionsTab = document.createElement('div');
  optionsTab.className = 'tab-pane';
  optionsTab.dataset.tab = 'options';
  optionsTab.innerHTML = `
    <div class="options-grid">
      <div class="option-item">
        <label class="checkbox-label">
          <input type="checkbox" data-option="unified_active" ${tierData.unified_active ? 'checked' : ''}>
          Use unified color for all items
        </label>
        <p class="option-description">When enabled, all items use the same color regardless of type.</p>
      </div>
      <div class="option-item">
        <label class="checkbox-label">
          <input type="checkbox" data-option="unified_weapons_colors" ${tierData.unified_weapons_colors ? 'checked' : ''}>
          Unify melee and ranged weapon colors
        </label>
        <p class="option-description">When enabled, both melee and ranged weapons use the same color.</p>
      </div>
      <div class="option-item">
        <label class="checkbox-label">
          <input type="checkbox" data-option="unified_base_names" ${tierData.unified_base_names ? 'checked' : ''}>
          Use unified base names for all items
        </label>
        <p class="option-description">When enabled, all items use the same base name.</p>
      </div>
      ${tierKey === 'tier0' ? `
      <div class="option-item locked">
        <label class="checkbox-label">
          <input type="checkbox" checked disabled>
          Requires maximum expertise
        </label>
        <p class="option-description">Tier 0 always requires maximum expertise.</p>
      </div>
      ` : ''}
    </div>
    <div class="rarity-control">
      <label for="adv-${tierKey}-rarity">Rarity Level:</label>
      <input type="number" id="adv-${tierKey}-rarity" min="1" max="5" value="${tierData.rarity}" data-field="rarity">
      <p class="option-description">Rarity level from 1 (lowest) to 5 (highest).</p>
    </div>
  `;
  tabContent.appendChild(optionsTab);
  
  // Add event listeners
  // Tab switching
  tier.querySelectorAll('.tab-button').forEach(button => {
    button.addEventListener('click', () => {
      // Deactivate all tabs
      tier.querySelectorAll('.tab-button').forEach(b => b.classList.remove('active'));
      tier.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
      
      // Activate clicked tab
      button.classList.add('active');
      const tabName = button.dataset.tab;
      tier.querySelector(`.tab-pane[data-tab="${tabName}"]`).classList.add('active');
    });
  });
  
  // Text inputs
  tier.querySelectorAll('input[type="text"]').forEach(input => {
    input.addEventListener('change', () => {
      const field = input.dataset.field;
      const lang = input.dataset.lang;
      
      if (!tierData[field]) {
        tierData[field] = {};
      }
      
      tierData[field][lang] = input.value;
      
      if (field === 'display_name_tier' && lang === 'en') {
        tier.querySelector('.tier-name').textContent = input.value || 'Unnamed';
      }
      
      if (onChange) onChange(tierKey, tierData);
    });
  });
  
  // Color sliders and inputs
  tier.querySelectorAll('.color-slider, .color-value').forEach(input => {
    input.addEventListener('input', (e) => {
      const colorComponent = input.dataset.color;
      const colorType = input.dataset.colorType;
      const value = parseInt(input.value);
      
      // Update both range and number inputs with the same data attributes
      tier.querySelectorAll(`[data-color="${colorComponent}"][data-color-type="${colorType}"]`).forEach(el => {
        if (el !== e.target) {
          el.value = value;
        }
      });
      
      // Update the color in the data
      const idx = { r: 1, g: 2, b: 3 }[colorComponent];
      tierData[colorType][idx] = value;
      
      // Update visual elements
      const hexColor = _rgbToHex(
        tierData[colorType][1],
        tierData[colorType][2],
        tierData[colorType][3]
      );
      
      // Update the specific color preview
      tier.querySelector(`.color-preview[data-color-type="${colorType}"]`).style.backgroundColor = hexColor;
      
      // If it's the base color, update header elements too
      if (colorType === 'base_unified_color') {
        tier.querySelector('.tier-color-preview').style.backgroundColor = hexColor;
        tier.querySelector(`#adv-${tierKey}-gradient`).style.background = 
          `linear-gradient(to bottom, ${hexColor}40 0%, var(--panel-bg) 100%)`;
      }
      
      if (onChange) onChange(tierKey, tierData);
    });
  });
  
  // Checkboxes
  tier.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
    checkbox.addEventListener('change', () => {
      const option = checkbox.dataset.option;
      tierData[option] = checkbox.checked;
      
      // Handle visibility of related controls
      if (option === 'unified_active') {
        const specificColorsDiv = tier.querySelector(`#adv-${tierKey}-specific-colors`);
        if (specificColorsDiv) {
          specificColorsDiv.classList.toggle('hidden', checkbox.checked);
        }
      }
      
      if (option === 'unified_weapons_colors') {
        const rangedColorDiv = tier.querySelector(`#adv-${tierKey}-ranged-color`);
        if (rangedColorDiv) {
          rangedColorDiv.classList.toggle('hidden', checkbox.checked);
        }
      }
      
      if (onChange) onChange(tierKey, tierData);
    });
  });
  
  // Number inputs
  tier.querySelectorAll('input[type="number"][data-field]').forEach(input => {
    input.addEventListener('change', () => {
      const field = input.dataset.field;
      const value = parseInt(input.value);
      
      if (field === 'rarity') {
        // Ensure rarity is in valid range
        const validValue = Math.max(1, Math.min(5, value));
        tierData[field] = validValue;
        input.value = validValue;
        
        // Update the rarity tag in the header
        tier.querySelector('.tier-tag').textContent = `Rarity ${validValue}`;
      } else {
        tierData[field] = value;
      }
      
      if (onChange) onChange(tierKey, tierData);
    });
  });
  
  return tier;
}

// Create language editor interface
function _createLanguageEditor(styleData, onChange) {
  const container = document.createElement('div');
  container.className = 'language-editor';
  
  // Create language selection dropdown
  const languageSelector = document.createElement('div');
  languageSelector.className = 'language-selector';
  
  let langOptions = '';
  Object.entries(StylesUtil.SUPPORTED_LANGUAGES).forEach(([code, langInfo]) => {
    langOptions += `<option value="${code}">${langInfo.name} (${code})</option>`;
  });
  
  languageSelector.innerHTML = `
    <div class="selector-header">
      <h3>Select Language</h3>
      <select id="language-select">
        ${langOptions}
      </select>
      <button id="add-language-btn" class="button">Add Language</button>
    </div>
    <div class="current-languages">
      <h4>Current Languages</h4>
      <div id="language-badges" class="language-badges">
        <!-- Language badges will be added here -->
      </div>
    </div>
  `;
  container.appendChild(languageSelector);
  
  // Create content area for language fields
  const languageContent = document.createElement('div');
  languageContent.className = 'language-content';
  languageContent.innerHTML = `
    <div id="language-fields" class="language-fields">
      <p class="language-instruction">Select a language and click "Add Language" to begin editing translations.</p>
    </div>
  `;
  container.appendChild(languageContent);
  
  // Function to update language badges
  function updateLanguageBadges() {
    const badgesContainer = container.querySelector('#language-badges');
    badgesContainer.innerHTML = '';
    
    // Collect all used languages across all tiers
    const usedLanguages = new Set(['en']); // Always include English
    
    Object.entries(styleData).forEach(([key, value]) => {
      if (!key.startsWith('tier')) return;
      
      const tier = value;
      ['display_name_tier', 'display_base_name', 'display_name_curio', 
       'display_name_weapon', 'display_name_weapon_ranged', 'display_name_other'].forEach(nameField => {
        if (tier[nameField]) {
          Object.keys(tier[nameField]).forEach(lang => usedLanguages.add(lang));
        }
      });
    });
    
    // Create badges for each language
    usedLanguages.forEach(lang => {
      const langInfo = StylesUtil.SUPPORTED_LANGUAGES[lang] || { name: lang, code: lang };
      const badge = document.createElement('div');
      badge.className = 'language-badge';
      badge.dataset.lang = lang;
      badge.innerHTML = `
        <span>${langInfo.name}</span>
        ${lang !== 'en' ? '<button class="delete-lang-btn">×</button>' : ''}
      `;
      badgesContainer.appendChild(badge);
      
      // Add delete event listener if not English
      if (lang !== 'en') {
        badge.querySelector('.delete-lang-btn').addEventListener('click', () => {
          if (confirm(`Are you sure you want to remove all ${langInfo.name} translations from this style?`)) {
            deleteLanguage(lang);
          }
        });
      }
    });
  }
  
  // Function to delete a language
  function deleteLanguage(lang) {
    // Remove this language from all tiers and fields
    Object.entries(styleData).forEach(([key, value]) => {
      if (!key.startsWith('tier')) return;
      
      const tier = value;
      ['display_name_tier', 'display_base_name', 'display_name_curio', 
       'display_name_weapon', 'display_name_weapon_ranged', 'display_name_other'].forEach(nameField => {
        if (tier[nameField] && tier[nameField][lang]) {
          delete tier[nameField][lang];
        }
      });
    });
    
    // Update UI
    updateLanguageBadges();
    
    // If this was the currently selected language, clear the editor
    const currentLang = container.querySelector('#language-select').value;
    if (currentLang === lang) {
      container.querySelector('#language-fields').innerHTML = 
        '<p class="language-instruction">Select a language and click "Add Language" to begin editing translations.</p>';
    }
    
    if (onChange) onChange(styleData);
  }
  
  // Function to create language fields for a specific language
  function createLanguageFields(lang) {
    const fieldsContainer = container.querySelector('#language-fields');
    fieldsContainer.innerHTML = '';
    
    if (!StylesUtil.SUPPORTED_LANGUAGES[lang]) {
      fieldsContainer.innerHTML = '<p class="error">Selected language is not supported.</p>';
      return;
    }
    
    const langInfo = StylesUtil.SUPPORTED_LANGUAGES[lang];
    
    // Add language header
    const header = document.createElement('div');
    header.className = 'language-header';
    header.innerHTML = `<h3>Editing ${langInfo.name} (${lang})</h3>`;
    fieldsContainer.appendChild(header);
    
    // Create tabs for different tiers
    const tabsContainer = document.createElement('div');
    tabsContainer.className = 'lang-tabs-container';
    tabsContainer.innerHTML = `
      <div class="lang-tabs">
        <button class="lang-tab-button active" data-lang-tab="all">All Tiers</button>
        ${Object.keys(styleData)
            .filter(key => key.startsWith('tier'))
            .map(key => `<button class="lang-tab-button" data-lang-tab="${key}">${styleData[key].display_name_tier.en || key}</button>`)
            .join('')}
      </div>
    `;
    fieldsContainer.appendChild(tabsContainer);
    
    // Create tab content
    const tabContent = document.createElement('div');
    tabContent.className = 'lang-tab-content';
    fieldsContainer.appendChild(tabContent);
    
    // Create the "All Tiers" tab pane
    const allTiersPane = document.createElement('div');
    allTiersPane.className = 'lang-tab-pane active';
    allTiersPane.dataset.langTab = 'all';
    
    // Add a form with all editable fields
    allTiersPane.innerHTML = `
      <form id="all-tiers-form">
        <div class="input-group bulk-action">
          <label for="bulk-tier-name">Quality Name (All Tiers):</label>
          <input type="text" id="bulk-tier-name" placeholder="Leave empty to set individually">
          <button type="button" class="apply-btn" data-field="display_name_tier">Apply</button>
        </div>
        
        <div class="input-group bulk-action">
          <label for="bulk-base-name">Base Item Name (All Tiers):</label>
          <input type="text" id="bulk-base-name" placeholder="Leave empty to set individually">
          <button type="button" class="apply-btn" data-field="display_base_name">Apply</button>
        </div>
        
        <div class="input-group bulk-action">
          <label for="bulk-curio-name">Curio Name (All Tiers):</label>
          <input type="text" id="bulk-curio-name" placeholder="Leave empty to set individually">
          <button type="button" class="apply-btn" data-field="display_name_curio">Apply</button>
        </div>
        
        <div class="input-group bulk-action">
          <label for="bulk-weapon-name">Weapon Name (All Tiers):</label>
          <input type="text" id="bulk-weapon-name" placeholder="Leave empty to set individually">
          <button type="button" class="apply-btn" data-field="display_name_weapon">Apply</button>
        </div>
        
        <div class="input-group bulk-action">
          <label for="bulk-ranged-name">Ranged Weapon Name (All Tiers):</label>
          <input type="text" id="bulk-ranged-name" placeholder="Leave empty to set individually">
          <button type="button" class="apply-btn" data-field="display_name_weapon_ranged">Apply</button>
        </div>
        
        <div class="input-group bulk-action">
          <label for="bulk-other-name">Other Item Name (All Tiers):</label>
          <input type="text" id="bulk-other-name" placeholder="Leave empty to set individually">
          <button type="button" class="apply-btn" data-field="display_name_other">Apply</button>
        </div>
      </form>
    `;
    tabContent.appendChild(allTiersPane);
    
    // Create individual tier tab panes
    Object.keys(styleData)
      .filter(key => key.startsWith('tier'))
      .forEach(tierKey => {
        const tier = styleData[tierKey];
        const tierPane = document.createElement('div');
        tierPane.className = 'lang-tab-pane';
        tierPane.dataset.langTab = tierKey;
        
        tierPane.innerHTML = `
          <form id="${tierKey}-lang-form">
            <div class="input-group">
              <label for="${tierKey}-tier-name-${lang}">Quality Name:</label>
              <input type="text" id="${tierKey}-tier-name-${lang}" 
                     data-tier="${tierKey}" data-field="display_name_tier" data-lang="${lang}"
                     value="${tier.display_name_tier[lang] || ''}" 
                     placeholder="${tier.display_name_tier.en || ''}">
            </div>
            
            <div class="input-group">
              <label for="${tierKey}-base-name-${lang}">Base Item Name:</label>
              <input type="text" id="${tierKey}-base-name-${lang}" 
                     data-tier="${tierKey}" data-field="display_base_name" data-lang="${lang}"
                     value="${tier.display_base_name[lang] || ''}" 
                     placeholder="${tier.display_base_name.en || ''}">
            </div>
            
            <div class="input-group">
              <label for="${tierKey}-curio-name-${lang}">Curio Name:</label>
              <input type="text" id="${tierKey}-curio-name-${lang}" 
                     data-tier="${tierKey}" data-field="display_name_curio" data-lang="${lang}"
                     value="${tier.display_name_curio[lang] || ''}" 
                     placeholder="${tier.display_name_curio.en || ''}">
            </div>
            
            <div class="input-group">
              <label for="${tierKey}-weapon-name-${lang}">Weapon Name:</label>
              <input type="text" id="${tierKey}-weapon-name-${lang}" 
                     data-tier="${tierKey}" data-field="display_name_weapon" data-lang="${lang}"
                     value="${tier.display_name_weapon[lang] || ''}" 
                     placeholder="${tier.display_name_weapon.en || ''}">
            </div>
            
            <div class="input-group">
              <label for="${tierKey}-ranged-name-${lang}">Ranged Weapon Name:</label>
              <input type="text" id="${tierKey}-ranged-name-${lang}" 
                     data-tier="${tierKey}" data-field="display_name_weapon_ranged" data-lang="${lang}"
                     value="${tier.display_name_weapon_ranged[lang] || ''}" 
                     placeholder="${tier.display_name_weapon_ranged.en || ''}">
            </div>
            
            <div class="input-group">
              <label for="${tierKey}-other-name-${lang}">Other Item Name:</label>
              <input type="text" id="${tierKey}-other-name-${lang}" 
                     data-tier="${tierKey}" data-field="display_name_other" data-lang="${lang}"
                     value="${tier.display_name_other[lang] || ''}" 
                     placeholder="${tier.display_name_other.en || ''}">
            </div>
          </form>
        `;
        
        tabContent.appendChild(tierPane);
      });
    
    // Add event listeners for inputs
    tabContent.querySelectorAll('input[data-tier][data-field]').forEach(input => {
      input.addEventListener('change', () => {
        const tierKey = input.dataset.tier;
        const field = input.dataset.field;
        const langCode = input.dataset.lang;
        
        if (!styleData[tierKey][field]) {
          styleData[tierKey][field] = {};
        }
        
        styleData[tierKey][field][langCode] = input.value;
        
        if (onChange) onChange(styleData);
      });
    });
    
    // Add event listeners for bulk actions
    allTiersPane.querySelectorAll('.apply-btn').forEach(button => {
      button.addEventListener('click', () => {
        const field = button.dataset.field;
        const inputId = `bulk-${field.replace('display_name_', '').replace('_', '-')}-name`;
        const value = document.getElementById(inputId).value.trim();
        
        if (!value) return; // Don't apply empty values
        
        // Apply to all tiers
        Object.keys(styleData)
          .filter(key => key.startsWith('tier'))
          .forEach(tierKey => {
            if (!styleData[tierKey][field]) {
              styleData[tierKey][field] = {};
            }
            
            styleData[tierKey][field][lang] = value;
            
            // Update the individual tier form if it exists
            const tierInput = document.getElementById(`${tierKey}-${field.replace('display_name_', '').replace('_', '-')}-name-${lang}`);
            if (tierInput) {
              tierInput.value = value;
            }
          });
        
        if (onChange) onChange(styleData);
        
        // Clear the bulk input
        document.getElementById(inputId).value = '';
        
        // Show success message
        const msg = document.createElement('div');
        msg.className = 'success-message';
        msg.textContent = `Applied to all tiers successfully!`;
        button.parentNode.appendChild(msg);
        
        setTimeout(() => {
          msg.remove();
        }, 3000);
      });
    });
    
    // Add tab switching
    tabsContainer.querySelectorAll('.lang-tab-button').forEach(button => {
      button.addEventListener('click', () => {
        // Deactivate all tabs
        tabsContainer.querySelectorAll('.lang-tab-button').forEach(b => b.classList.remove('active'));
        fieldsContainer.querySelectorAll('.lang-tab-pane').forEach(p => p.classList.remove('active'));
        
        // Activate clicked tab
        button.classList.add('active');
        const tabName = button.dataset.langTab;
        fieldsContainer.querySelector(`.lang-tab-pane[data-lang-tab="${tabName}"]`).classList.add('active');
      });
    });
  }
  
  // Add event listeners
  // Add language button
  container.querySelector('#add-language-btn').addEventListener('click', () => {
    const langSelect = container.querySelector('#language-select');
    const selectedLang = langSelect.value;
    
    createLanguageFields(selectedLang);
    updateLanguageBadges();
  });
  
  // Initialize language badges
  updateLanguageBadges();
  
  return container;
}

// Create export/import interface
function _createExportImportPanel() {
  const container = document.createElement('div');
  container.className = 'export-import-panel';
  
  container.innerHTML = `
    <div class="panel-section export-section">
      <h3>Export</h3>
      <div class="export-options">
        <div class="option-group">
          <label for="export-type">Format:</label>
          <select id="export-type">
            <option value="lua">Lua (game-ready)</option>
            <option value="json">JSON (backup)</option>
          </select>
        </div>
        <div class="option-group">
          <label for="export-target">Export:</label>
          <select id="export-target">
            <option value="all">All Styles</option>
            <option value="current">Current Style</option>
          </select>
        </div>
        <button id="export-btn" class="button primary">Export</button>
      </div>
      <div class="export-output">
        <textarea id="export-output" readonly placeholder="Export output will appear here"></textarea>
        <div class="export-actions">
          <button id="copy-export-btn" class="button">Copy to Clipboard</button>
          <button id="download-export-btn" class="button">Download File</button>
        </div>
      </div>
    </div>
    
    <div class="panel-section import-section">
      <h3>Import</h3>
      <div class="import-options">
        <div class="option-group">
          <label for="import-type">Format:</label>
          <select id="import-type">
            <option value="lua">Lua</option>
            <option value="json">JSON</option>
          </select>
        </div>
        <div class="option-group file-import">
          <label for="import-file">From File:</label>
          <input type="file" id="import-file" accept=".lua,.json">
          <button id="import-file-btn" class="button">Import File</button>
        </div>
      </div>
      <div class="import-input">
        <label for="import-code">Or Paste Code:</label>
        <textarea id="import-code" placeholder="Paste Lua or JSON code here"></textarea>
        <button id="import-code-btn" class="button primary">Import Code</button>
      </div>
    </div>
    
    <div class="panel-section language-section">
      <h3>Language Import/Export</h3>
      <div class="language-export">
        <h4>Export Language Data</h4>
        <div class="option-group">
          <label for="language-export-lang">Language:</label>
          <select id="language-export-lang">
            <option value="all">All Languages</option>
            <option value="en">English (en)</option>
            <!-- Other languages will be added dynamically -->
          </select>
        </div>
        <button id="language-export-btn" class="button">Export Language Data</button>
      </div>
      <div class="language-import">
        <h4>Import Language Data</h4>
        <textarea id="language-import-data" placeholder="Paste language JSON data here"></textarea>
        <button id="language-import-btn" class="button primary">Import Language Data</button>
      </div>
    </div>
  `;
  
  return container;
}

// Helper to convert RGB to hex
function _rgbToHex(r, g, b) {
  return `#${[r, g, b].map(x => {
    const hex = x.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('')}`;
}

// Export functions
export const UiUtils = {
  createBasicTierCard: _createBasicTierCard,
  createAdvancedTierCard: _createAdvancedTierCard,
  createLanguageEditor: _createLanguageEditor,
  createExportImportPanel: _createExportImportPanel,
  rgbToHex: _rgbToHex
};