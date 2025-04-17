// Master Works Style Editor Application Logic
import { StylesUtil } from './defaultStyles.js';
import { StorageUtils } from './storageUtils.js';
import { UiUtils } from './uiUtils.js';

// Main application class
class MasterWorksApp {
  constructor() {
    // State
    this.catalog = {}; // Style catalog
    this.currentStyleKey = null; // Currently selected style
    this.currentStyle = null; // Current style data
    this.viewMode = 'basic'; // 'basic' or 'advanced'
    
    // Initialize
    this._init();
  }
  
  // Modify this function in app.js
  _init() {
    // Load catalog from storage
    this.catalog = window.StorageUtils.initStyleCatalog();

    // Set up UI
    this._setupUI();

    // If catalog is not empty, select the first style
    if (Object.keys(this.catalog).length > 0) {
      this.currentStyleKey = Object.keys(this.catalog)[0];
      this.currentStyle = this.catalog[this.currentStyleKey];
      this._updateStyleSelector();
      this._loadCurrentStyle();
    } else {
      // Show empty state instead of creating a default style
      document.getElementById('editor-tab').innerHTML = `
      <div class="empty-state">
      <h2>No Styles Found</h2>
      <p>Click "New Style" to create your first style or import an existing one.</p>
      </div>
      `;
      // Also update language and import/export tabs
      document.getElementById('language-editor-container').innerHTML = '<p>Create or import a style to begin.</p>';
    }

    // Set up event listeners
    this._setupEventListeners();
  }
  
  // Set up the main UI structure
  _setupUI() {
    // Main container
    const appContainer = document.getElementById('app-container');
    if (!appContainer) return;
    
    appContainer.innerHTML = `
      <div class="app-header">
        <h1>Master Works Style Editor</h1>
        <div class="style-controls">
          <div class="style-selector-container">
            <select id="style-selector">
              <!-- Styles will be added here -->
            </select>
            <button id="new-style-btn" class="button">New Style</button>
            <button id="delete-style-btn" class="button danger">Delete</button>
          </div>
          <div class="style-metadata">
            <div class="input-group">
              <label for="style-title">Style Title:</label>
              <input type="text" id="style-title" placeholder="Style Title">
            </div>
            <div class="input-group">
              <label for="style-author">Author:</label>
              <input type="text" id="style-author" placeholder="Your Name">
            </div>
          </div>
        </div>
      </div>
      
      <div class="main-tabs">
        <button id="tab-editor" class="main-tab-btn active" data-tab="editor">Style Editor</button>
        <button id="tab-languages" class="main-tab-btn" data-tab="languages">Languages</button>
        <button id="tab-import-export" class="main-tab-btn" data-tab="import-export">Import/Export</button>
      </div>
      
      <div class="main-content">
        <!-- Editor Tab -->
        <div id="editor-tab" class="main-tab-content active">
          <div class="view-mode-selector">
            <button id="basic-mode-btn" class="mode-btn active">Basic Mode</button>
            <button id="advanced-mode-btn" class="mode-btn">Advanced Mode</button>
          </div>
          <div id="tiers-container" class="tiers-container">
            <!-- Tier cards will be added here -->
          </div>
        </div>
        
        <!-- Languages Tab -->
        <div id="languages-tab" class="main-tab-content">
          <div id="language-editor-container">
            <!-- Language editor will be added here -->
          </div>
        </div>
        
        <!-- Import/Export Tab -->
        <div id="import-export-tab" class="main-tab-content">
          <div id="export-import-container">
            <!-- Export/Import panel will be added here -->
          </div>
        </div>
      </div>
    `;
    
    // Initialize the language editor
    this._initLanguageEditor();
    
    // Initialize the export/import panel
    this._initExportImportPanel();
  }
  
  // Set up event listeners
  _setupEventListeners() {
    // Style selector
    const styleSelector = document.getElementById('style-selector');
    if (styleSelector) {
      styleSelector.addEventListener('change', () => {
        this.currentStyleKey = styleSelector.value;
        this.currentStyle = this.catalog[this.currentStyleKey];
        this._loadCurrentStyle();
      });
    }
    
    // New style button
    const newStyleBtn = document.getElementById('new-style-btn');
    if (newStyleBtn) {
      newStyleBtn.addEventListener('click', () => {
        this._createNewStyle();
      });
    }
    
    // Delete style button
    const deleteStyleBtn = document.getElementById('delete-style-btn');
    if (deleteStyleBtn) {
      deleteStyleBtn.addEventListener('click', () => {
        this._deleteCurrentStyle();
      });
    }
    
    // Style metadata
    const styleTitle = document.getElementById('style-title');
    if (styleTitle) {
      styleTitle.addEventListener('change', () => {
        if (this.currentStyle) {
          // Update style title
          this.currentStyle.title = styleTitle.value;
          
          // Generate a new key if needed
          if (this.currentStyleKey) {
            const newKey = StylesUtil.generateStyleKey(
              this.currentStyle.title,
              this.currentStyle.author
            );
            
            // Only change key if it's different
            if (newKey !== this.currentStyleKey) {
              // Add with new key
              this.catalog[newKey] = this.currentStyle;
              // Remove old key
              delete this.catalog[this.currentStyleKey];
              // Update current key
              this.currentStyleKey = newKey;
              // Update selector
              this._updateStyleSelector();
            }
          }
          
          // Save to storage
          StorageUtils.saveStyleCatalog(this.catalog);
        }
      });
    }
    
    const styleAuthor = document.getElementById('style-author');
    if (styleAuthor) {
      styleAuthor.addEventListener('change', () => {
        if (this.currentStyle) {
          // Update style author
          this.currentStyle.author = styleAuthor.value;
          
          // Generate a new key if needed
          if (this.currentStyleKey) {
            const newKey = StylesUtil.generateStyleKey(
              this.currentStyle.title,
              this.currentStyle.author
            );
            
            // Only change key if it's different
            if (newKey !== this.currentStyleKey) {
              // Add with new key
              this.catalog[newKey] = this.currentStyle;
              // Remove old key
              delete this.catalog[this.currentStyleKey];
              // Update current key
              this.currentStyleKey = newKey;
              // Update selector
              this._updateStyleSelector();
            }
          }
          
          // Save to storage
          StorageUtils.saveStyleCatalog(this.catalog);
        }
      });
    }
    
    // Main tabs
    document.querySelectorAll('.main-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        // Update active button
        document.querySelectorAll('.main-tab-btn').forEach(b => {
          b.classList.remove('active');
        });
        btn.classList.add('active');
        
        // Update active content
        document.querySelectorAll('.main-tab-content').forEach(content => {
          content.classList.remove('active');
        });
        
        const tabId = btn.dataset.tab;
        document.getElementById(`${tabId}-tab`).classList.add('active');
        
        // Special actions for certain tabs
        if (tabId === 'languages') {
          this._refreshLanguageEditor();
        }
      });
    });
    
    // View mode selector
    document.getElementById('basic-mode-btn').addEventListener('click', () => {
      this.viewMode = 'basic';
      
      // Update active button
      document.getElementById('basic-mode-btn').classList.add('active');
      document.getElementById('advanced-mode-btn').classList.remove('active');
      
      // Reload tiers
      this._loadTiers();
    });
    
    document.getElementById('advanced-mode-btn').addEventListener('click', () => {
      this.viewMode = 'advanced';
      
      // Update active button
      document.getElementById('basic-mode-btn').classList.remove('active');
      document.getElementById('advanced-mode-btn').classList.add('active');
      
      // Reload tiers
      this._loadTiers();
    });
  }
  
  // Update the style selector dropdown
  _updateStyleSelector() {
    const styleSelector = document.getElementById('style-selector');
    if (!styleSelector) return;
    
    // Clear existing options
    styleSelector.innerHTML = '';
    
    // Add options for each style
    Object.entries(this.catalog).forEach(([key, style]) => {
      const option = document.createElement('option');
      option.value = key;
      option.textContent = `${style.title} by ${style.author}`;
      
      // Select the current style
      if (key === this.currentStyleKey) {
        option.selected = true;
      }
      
      styleSelector.appendChild(option);
    });
  }
  
  // Load the current style
  _loadCurrentStyle() {
    if (!this.currentStyle) return;
    
    // Update metadata fields
    document.getElementById('style-title').value = this.currentStyle.title || '';
    document.getElementById('style-author').value = this.currentStyle.author || '';
    
    // Load tiers
    this._loadTiers();
    
    // Refresh language editor
    this._refreshLanguageEditor();
  }
  
  // Load tiers for the current style
  _loadTiers() {
    const tiersContainer = document.getElementById('tiers-container');
    if (!tiersContainer || !this.currentStyle) return;
    
    // Clear existing tiers
    tiersContainer.innerHTML = '';
    
    // Get tier keys in order
    const tierKeys = ['tier0', 'tier1', 'tier2', 'tier3', 'tier4', 'tier5'];
    
    // Create tier cards
    tierKeys.forEach(tierKey => {
      if (!this.currentStyle[tierKey]) return;
      
      const tierData = this.currentStyle[tierKey];
      let tierCard;
      
      if (this.viewMode === 'basic') {
        tierCard = UiUtils.createBasicTierCard(tierKey, tierData, this._onTierChanged.bind(this));
      } else {
        tierCard = UiUtils.createAdvancedTierCard(tierKey, tierData, this._onTierChanged.bind(this));
      }
      
      tiersContainer.appendChild(tierCard);
    });
  }
  
  // Initialize the language editor
  _initLanguageEditor() {
    const container = document.getElementById('language-editor-container');
    if (!container) return;
    
    if (this.currentStyle) {
      const editor = UiUtils.createLanguageEditor(this.currentStyle, this._onStyleChanged.bind(this));
      container.innerHTML = '';
      container.appendChild(editor);
    } else {
      container.innerHTML = '<p>Select or create a style first.</p>';
    }
  }
  
  // Refresh the language editor
  _refreshLanguageEditor() {
    this._initLanguageEditor();
  }
  
  // Initialize the export/import panel
  _initExportImportPanel() {
    const container = document.getElementById('export-import-container');
    if (!container) return;
    
    const panel = UiUtils.createExportImportPanel();
    container.innerHTML = '';
    container.appendChild(panel);
    
    // Populate language dropdown
    const langSelect = document.getElementById('language-export-lang');
    if (langSelect) {
      Object.entries(StylesUtil.SUPPORTED_LANGUAGES).forEach(([code, langInfo]) => {
        if (code === 'en') return; // Already added
        
        const option = document.createElement('option');
        option.value = code;
        option.textContent = `${langInfo.name} (${code})`;
        langSelect.appendChild(option);
      });
    }
    
    // Set up export event listener
    const exportBtn = document.getElementById('export-btn');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        this._handleExport();
      });
    }
    
    // Copy export button
    const copyExportBtn = document.getElementById('copy-export-btn');
    if (copyExportBtn) {
      copyExportBtn.addEventListener('click', () => {
        const output = document.getElementById('export-output');
        if (output && output.value) {
          output.select();
          document.execCommand('copy');
          
          // Show feedback
          const originalText = copyExportBtn.textContent;
          copyExportBtn.textContent = 'Copied!';
          setTimeout(() => {
            copyExportBtn.textContent = originalText;
          }, 2000);
        }
      });
    }
    
    // Download export button
    const downloadExportBtn = document.getElementById('download-export-btn');
    if (downloadExportBtn) {
      downloadExportBtn.addEventListener('click', () => {
        this._handleDownloadExport();
      });
    }
    
    // Import file button
    const importFileBtn = document.getElementById('import-file-btn');
    if (importFileBtn) {
      importFileBtn.addEventListener('click', () => {
        const fileInput = document.getElementById('import-file');
        if (fileInput && fileInput.files && fileInput.files.length > 0) {
          this._handleFileImport(fileInput.files[0]);
        }
      });
    }
    
    // Import code button
    const importCodeBtn = document.getElementById('import-code-btn');
    if (importCodeBtn) {
      importCodeBtn.addEventListener('click', () => {
        const codeInput = document.getElementById('import-code');
        if (codeInput && codeInput.value) {
          this._handleCodeImport(codeInput.value);
        }
      });
    }
    
    // Language export button
    const langExportBtn = document.getElementById('language-export-btn');
    if (langExportBtn) {
      langExportBtn.addEventListener('click', () => {
        this._handleLanguageExport();
      });
    }
    
    // Language import button
    const langImportBtn = document.getElementById('language-import-btn');
    if (langImportBtn) {
      langImportBtn.addEventListener('click', () => {
        this._handleLanguageImport();
      });
    }
  }
  
  // Create a new style
  _createNewStyle() {
    // Create a new style with default template
    const newStyle = StylesUtil.createNewStyle('New Style', 'Your Name');
    
    // Generate a key
    const key = StylesUtil.generateStyleKey(newStyle.title, newStyle.author);
    
    // Add to catalog
    this.catalog[key] = newStyle;
    
    // Set as current style
    this.currentStyleKey = key;
    this.currentStyle = newStyle;
    
    // Save to storage
    StorageUtils.saveStyleCatalog(this.catalog);
    
    // Update UI
    this._updateStyleSelector();
    this._loadCurrentStyle();
  }
  
  // Delete the current style
  _deleteCurrentStyle() {
    if (!this.currentStyleKey) return;
    
    // Confirm deletion
    if (!confirm(`Are you sure you want to delete "${this.currentStyle.title}"?`)) {
      return;
    }
    
    // Remove from catalog
    delete this.catalog[this.currentStyleKey];
    
    // Save to storage
    StorageUtils.saveStyleCatalog(this.catalog);
    
    // If catalog is empty, create a new style
    if (Object.keys(this.catalog).length === 0) {
      this._createNewStyle();
    } else {
      // Select the first style
      this.currentStyleKey = Object.keys(this.catalog)[0];
      this.currentStyle = this.catalog[this.currentStyleKey];
    }
    
    // Update UI
    this._updateStyleSelector();
    this._loadCurrentStyle();
  }
  
  // Handler for tier changes
  _onTierChanged(tierKey, tierData) {
    if (!this.currentStyle) return;
    
    // Update the tier in the current style
    this.currentStyle[tierKey] = tierData;
    
    // Save to storage
    StorageUtils.saveStyleCatalog(this.catalog);
  }
  
  // Handler for style changes
  _onStyleChanged(styleData) {
    if (!this.currentStyleKey) return;
    
    // Update the style in the catalog
    this.catalog[this.currentStyleKey] = styleData;
    this.currentStyle = styleData;
    
    // Save to storage
    StorageUtils.saveStyleCatalog(this.catalog);
  }
  
  // Handle export action
  _handleExport() {
    const exportType = document.getElementById('export-type').value;
    const exportTarget = document.getElementById('export-target').value;
    const outputArea = document.getElementById('export-output');
    
    if (!outputArea) return;
    
    try {
      if (exportTarget === 'all') {
        // Export all styles
        if (exportType === 'lua') {
          outputArea.value = StorageUtils.exportAsLua(this.catalog);
        } else {
          outputArea.value = StorageUtils.exportCatalogAsJson(this.catalog);
        }
      } else {
        // Export current style
        if (!this.currentStyleKey) {
          outputArea.value = 'No style selected!';
          return;
        }
        
        if (exportType === 'lua') {
          // Create a temporary catalog with just the current style
          const tempCatalog = {
            [this.currentStyleKey]: this.currentStyle
          };
          outputArea.value = StorageUtils.exportAsLua(tempCatalog);
        } else {
          outputArea.value = StorageUtils.exportStyleAsJson(this.currentStyleKey, this.currentStyle);
        }
      }
    } catch (error) {
      outputArea.value = `Error exporting: ${error.message}`;
    }
  }
  
  // Handle download export
  _handleDownloadExport() {
    const exportType = document.getElementById('export-type').value;
    const exportTarget = document.getElementById('export-target').value;
    const outputArea = document.getElementById('export-output');
    
    if (!outputArea || !outputArea.value) return;
    
    let fileName;
    let mimeType;
    
    if (exportType === 'lua') {
      fileName = 'custom_styles.lua';
      mimeType = 'application/x-lua';
    } else {
      fileName = exportTarget === 'all' ? 'master_works_styles.json' : `${this.currentStyleKey}.json`;
      mimeType = 'application/json';
    }
    
    const blob = new Blob([outputArea.value], { type: mimeType });
    const url = URL.createObjectURL(blob);
    
    // Create a link and click it
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
  
  // Handle file import
  _handleFileImport(file) {
    if (!file) return;
    
    const reader = new FileReader();
    const importType = document.getElementById('import-type').value;
    
    reader.onload = (e) => {
      const content = e.target.result;
      
      try {
        let importedCatalog;
        
        if (importType === 'lua') {
          importedCatalog = StorageUtils.importFromLua(content);
        } else {
          importedCatalog = StorageUtils.importFromJson(content);
        }
        
        // Merge with existing catalog
        this.catalog = {
          ...this.catalog,
          ...importedCatalog
        };
        
        // Save to storage
        StorageUtils.saveStyleCatalog(this.catalog);
        
        // Select the first imported style
        const firstKey = Object.keys(importedCatalog)[0];
        if (firstKey) {
          this.currentStyleKey = firstKey;
          this.currentStyle = this.catalog[firstKey];
        }
        
        // Update UI
        this._updateStyleSelector();
        this._loadCurrentStyle();
        
        // Show success message
        alert(`Successfully imported ${Object.keys(importedCatalog).length} style(s)!`);
      } catch (error) {
        alert(`Error importing file: ${error.message}`);
      }
    };
    
    reader.onerror = () => {
      alert('Error reading file!');
    };
    
    reader.readAsText(file);
  }
  
  // Handle code import
  _handleCodeImport(code) {
    if (!code) return;
    
    const importType = document.getElementById('import-type').value;
    
    try {
      let importedCatalog;
      
      if (importType === 'lua') {
        importedCatalog = StorageUtils.importFromLua(code);
      } else {
        importedCatalog = StorageUtils.importFromJson(code);
      }
      
      // Merge with existing catalog
      this.catalog = {
        ...this.catalog,
        ...importedCatalog
      };
      
      // Save to storage
      StorageUtils.saveStyleCatalog(this.catalog);
      
      // Select the first imported style
      const firstKey = Object.keys(importedCatalog)[0];
      if (firstKey) {
        this.currentStyleKey = firstKey;
        this.currentStyle = this.catalog[firstKey];
      }
      
      // Update UI
      this._updateStyleSelector();
      this._loadCurrentStyle();
      
      // Clear the input
      document.getElementById('import-code').value = '';
      
      // Show success message
      alert(`Successfully imported ${Object.keys(importedCatalog).length} style(s)!`);
    } catch (error) {
      alert(`Error importing code: ${error.message}`);
    }
  }
  
  // Handle language export
  _handleLanguageExport() {
    if (!this.currentStyleKey) {
      alert('No style selected!');
      return;
    }
    
    const langSelect = document.getElementById('language-export-lang');
    if (!langSelect) return;
    
    const selectedLang = langSelect.value;
    let languages = null;
    
    if (selectedLang !== 'all') {
      languages = [selectedLang];
    }
    
    try {
      const exportData = StorageUtils.exportLanguageData(this.currentStyleKey, languages);
      
      // Show in a textarea
      const outputArea = document.getElementById('language-import-data');
      if (outputArea) {
        outputArea.value = exportData;
      }
      
      // Show success message
      alert('Language data exported successfully!');
    } catch (error) {
      alert(`Error exporting language data: ${error.message}`);
    }
  }
  
  // Handle language import
  _handleLanguageImport() {
    if (!this.currentStyleKey) {
      alert('No style selected!');
      return;
    }
    
    const importData = document.getElementById('language-import-data');
    if (!importData || !importData.value) {
      alert('No language data to import!');
      return;
    }
    
    try {
      StorageUtils.importLanguageData(this.currentStyleKey, importData.value);
      
      // Refresh style data
      this.currentStyle = this.catalog[this.currentStyleKey];
      
      // Refresh language editor
      this._refreshLanguageEditor();
      
      // Show success message
      alert('Language data imported successfully!');
      
      // Clear the input
      importData.value = '';
    } catch (error) {
      alert(`Error importing language data: ${error.message}`);
    }
  }
}

// Initialize the app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.masterWorksApp = new MasterWorksApp();
});
