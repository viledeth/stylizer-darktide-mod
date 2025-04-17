// Storage and Import/Export Utilities for Master Works SPA

// Local storage key for style catalog
const STORAGE_KEY = 'masterworks_style_catalog';

// Initialize style catalog from local storage or create empty one
function _initStyleCatalog() {
  const catalogData = localStorage.getItem(STORAGE_KEY);
  
  if (catalogData) {
    try {
      return JSON.parse(catalogData);
    } catch (e) {
      console.error('Failed to parse style catalog from localStorage:', e);
      return {};
    }
  }
  
  return {}; // Return empty catalog if nothing found
}

// Save style catalog to local storage
function _saveStyleCatalog(catalog) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(catalog));
    return true;
  } catch (e) {
    console.error('Failed to save style catalog to localStorage:', e);
    return false;
  }
}

// Add or update a style in the catalog
function _updateStyle(styleKey, styleData) {
  const catalog = _initStyleCatalog();
  
  catalog[styleKey] = styleData;
  
  return _saveStyleCatalog(catalog);
}

// Delete a style from the catalog
function _deleteStyle(styleKey) {
  const catalog = _initStyleCatalog();
  
  if (catalog[styleKey]) {
    delete catalog[styleKey];
    return _saveStyleCatalog(catalog);
  }
  
  return false; // Style not found
}

// Export all styles as Lua code
function _exportAsLua(catalog) {
  // Start with the Lua opening
  let luaCode = `-- Master Works Custom Styles
-- This file contains all user-defined custom styles for Master Works
-- It can be edited manually or through the Master Works Style Editor SPA

local CUSTOM_STYLES = {
`;

  // Add each style
  Object.entries(catalog).forEach(([styleKey, styleData]) => {
    luaCode += `    -- ${styleData.title} style by ${styleData.author}\n`;
    luaCode += `    ${styleKey} = {\n`;
    luaCode += `        title = "${styleData.title}",\n`;
    luaCode += `        author = "${styleData.author}",\n`;
    
    // Add each tier
    Object.entries(styleData).forEach(([key, value]) => {
      if (key.startsWith('tier')) {
        luaCode += `        \n        -- ${_getTierDisplayName(styleData, key)}\n`;
        luaCode += `        ${key} = {\n`;
        
        // Process tier properties
        Object.entries(value).forEach(([propKey, propValue]) => {
          if (typeof propValue === 'object' && !Array.isArray(propValue)) {
            // Handle nested objects (like display_name_tier)
            luaCode += `            ${propKey} = {\n`;
            Object.entries(propValue).forEach(([langKey, langValue]) => {
              if (langKey.includes('-')) {
                luaCode += `                ["${langKey}"] = "${langValue}",\n`;
              } else {
                luaCode += `                ${langKey} = "${langValue}",\n`;
              }
            });
            luaCode += `            },\n`;
          } else if (Array.isArray(propValue)) {
            // Handle color arrays
            luaCode += `            ${propKey} = { ${propValue.join(', ')} },\n`;
          } else if (typeof propValue === 'boolean') {
            // Handle booleans
            luaCode += `            ${propKey} = ${propValue},\n`;
          } else if (typeof propValue === 'number') {
            // Handle numbers
            luaCode += `            ${propKey} = ${propValue},\n`;
          }
        });
        
        luaCode += `        },\n`;
      }
    });
    
    luaCode += `    },\n\n`;
  });
  
  // Close the Lua table and return
  luaCode += `}

return CUSTOM_STYLES`;

  return luaCode;
}

// Helper to get a readable tier name for comments
function _getTierDisplayName(styleData, tierKey) {
  try {
    const tier = styleData[tierKey];
    const displayName = tier.display_name_tier.en || 'Tier';
    const rarity = tier.rarity || '?';
    
    let result = `${displayName} (Rarity ${rarity})`;
    
    if (tier.needs_max_expertise) {
      result += ' with max expertise';
    }
    
    return result;
  } catch (e) {
    return tierKey;
  }
}

// Export single style as JSON
function _exportStyleAsJson(styleKey, styleData) {
  return JSON.stringify({
    style_key: styleKey,
    ...styleData
  }, null, 2);
}

// Export all styles as JSON
function _exportCatalogAsJson(catalog) {
  return JSON.stringify(catalog, null, 2);
}

function _importFromLua(luaCode) {
  try {
    // Extract the CUSTOM_STYLES table content between curly braces
    const match = luaCode.match(/local\s+CUSTOM_STYLES\s*=\s*\{([\s\S]*)\}\s*return/m);

    if (!match || !match[1]) {
      throw new Error('Could not find CUSTOM_STYLES table in the Lua code');
    }

    const tableContent = match[1];
    const catalog = {};

    // Improved regex to find complete style entries from start to finish
    // This looks for style_key = { ... } patterns with proper nesting support
    const stylePattern = /(\w+)\s*=\s*\{([\s\S]*?)^\s*\},/gm;

    let styleMatch;
    while ((styleMatch = stylePattern.exec(tableContent)) !== null) {
      const styleKey = styleMatch[1].trim();
      const styleContent = styleMatch[2];

      // Create a new style object
      const style = {
        title: '',
        author: ''
      };

      // Extract title and author
      const titleMatch = styleContent.match(/title\s*=\s*"([^"]*)"/);
      if (titleMatch) style.title = titleMatch[1];

      const authorMatch = styleContent.match(/author\s*=\s*"([^"]*)"/);
      if (authorMatch) style.author = authorMatch[1];

      // Extract tier data with improved tier pattern
      const tierPattern = /(tier\d+)\s*=\s*\{([\s\S]*?)^\s*\},/gm;

      let tierMatch;
      while ((tierMatch = tierPattern.exec(styleContent)) !== null) {
        const tierKey = tierMatch[1];
        const tierContent = tierMatch[2];

        // Process tier data here...
        // (rest of your existing tier processing code)

        // Create new tier object with defaults
        const tier = {
          display_name_tier: { en: '' },
          display_base_name: { en: '' },
          display_name_curio: { en: '' },
          display_name_weapon: { en: '' },
          display_name_weapon_ranged: { en: '' },
          display_name_other: { en: '' },
          base_unified_color: [255, 255, 255, 255],
          weapons_unified_color: [255, 255, 255, 255],
          weapons_ranged_color: [255, 255, 255, 255],
          curio_color: [255, 255, 255, 255],
          other_item_color: [255, 255, 255, 255],
          unified_active: true,
          unified_weapons_colors: true,
          unified_base_names: true,
          rarity: parseInt(tierKey.replace('tier', '')) === 0 ? 5 : 5 - parseInt(tierKey.replace('tier', '')),
          needs_max_expertise: tierKey === 'tier0'
        };

        // (process tier properties as in your original code)

        // Add tier to style
        style[tierKey] = tier;
      }

      // Add style to catalog
      catalog[styleKey] = style;
    }

    return catalog;
  } catch (e) {
    console.error('Failed to parse Lua code:', e);
    throw e;
  }
}

// Import from JSON
function _importFromJson(jsonData) {
  try {
    const data = JSON.parse(jsonData);
    
    // Handle single style import
    if (data.style_key && Object.keys(data).length > 1) {
      const styleKey = data.style_key;
      delete data.style_key;
      
      return { [styleKey]: data };
    }
    
    // Handle full catalog import
    return data;
  } catch (e) {
    console.error('Failed to parse JSON data:', e);
    throw e;
  }
}

// Import language data
function _importLanguageData(styleKey, languageData) {
  try {
    const data = JSON.parse(languageData);
    const catalog = _initStyleCatalog();
    
    // Check if style exists
    if (!catalog[styleKey]) {
      throw new Error(`Style "${styleKey}" not found in catalog`);
    }
    
    // Get the style
    const style = catalog[styleKey];
    
    // Check if this is language_data format
    if (data.language_data) {
      // Process each language
      Object.entries(data.language_data).forEach(([lang, tierData]) => {
        // Process each tier
        Object.entries(tierData).forEach(([tierKey, nameData]) => {
          // Check if tier exists
          if (!style[tierKey]) return;
          
          // Process each name property
          Object.entries(nameData).forEach(([nameKey, nameValue]) => {
            // Check if property exists
            if (!style[tierKey][nameKey]) return;
            
            // Update the language entry
            style[tierKey][nameKey][lang] = nameValue;
          });
        });
      });
    } else {
      // Handle other formats (possibly just language codes at top level)
      Object.entries(data).forEach(([lang, tierData]) => {
        if (typeof tierData === 'object' && !Array.isArray(tierData)) {
          // Process each tier
          Object.entries(tierData).forEach(([tierKey, nameData]) => {
            // Check if tier exists
            if (!style[tierKey]) return;
            
            // Process each name property
            Object.entries(nameData).forEach(([nameKey, nameValue]) => {
              // Check if property exists
              if (!style[tierKey][nameKey]) return;
              
              // Update the language entry
              style[tierKey][nameKey][lang] = nameValue;
            });
          });
        }
      });
    }
    
    // Save updated catalog
    _saveStyleCatalog(catalog);
    
    return true;
  } catch (e) {
    console.error('Failed to import language data:', e);
    throw e;
  }
}

// Export language data for a style
function _exportLanguageData(styleKey, languages = null) {
  const catalog = _initStyleCatalog();
  
  // Check if style exists
  if (!catalog[styleKey]) {
    throw new Error(`Style "${styleKey}" not found in catalog`);
  }
  
  // Get the style
  const style = catalog[styleKey];
  
  // Prepare language data
  const result = {
    style_key: styleKey,
    language_data: {}
  };
  
  // List of name properties to export
  const nameProperties = [
    'display_name_tier',
    'display_base_name',
    'display_name_curio',
    'display_name_weapon',
    'display_name_weapon_ranged',
    'display_name_other'
  ];
  
  // Get all languages used in the style if none specified
  if (!languages) {
    const usedLanguages = new Set();
    
    Object.values(style).forEach(tierOrMeta => {
      if (typeof tierOrMeta !== 'object' || !tierOrMeta) return;
      
      // Skip non-tier properties
      if (!tierOrMeta.display_name_tier) return;
      
      // Check each name property
      nameProperties.forEach(nameProp => {
        if (tierOrMeta[nameProp]) {
          Object.keys(tierOrMeta[nameProp]).forEach(lang => usedLanguages.add(lang));
        }
      });
    });
    
    languages = Array.from(usedLanguages);
  }
  
  // Extract language data for each language
  languages.forEach(lang => {
    result.language_data[lang] = {};
    
    // Process each tier
    Object.entries(style).forEach(([key, value]) => {
      // Skip non-tier properties
      if (!key.startsWith('tier')) return;
      
      result.language_data[lang][key] = {};
      
      // Extract name properties for this language
      nameProperties.forEach(nameProp => {
        if (value[nameProp] && value[nameProp][lang]) {
          result.language_data[lang][key][nameProp] = value[nameProp][lang];
        }
      });
    });
  });
  
  return JSON.stringify(result, null, 2);
}
// At the end of storageUtils.js, add:
window.StorageUtils = StorageUtils;
// Export functions
export const StorageUtils = {
  initStyleCatalog: _initStyleCatalog,
  saveStyleCatalog: _saveStyleCatalog,
  updateStyle: _updateStyle,
  deleteStyle: _deleteStyle,
  exportAsLua: _exportAsLua,
  exportStyleAsJson: _exportStyleAsJson,
  exportCatalogAsJson: _exportCatalogAsJson,
  importFromLua: _importFromLua,
  importFromJson: _importFromJson,
  importLanguageData: _importLanguageData,
  exportLanguageData: _exportLanguageData
};
