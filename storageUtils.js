// Storage and Import/Export Utilities for Make Me Special SPA
// At the beginning of storageUtils.js, add:
console.log("StorageUtils module loading...");
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
  let luaCode = `-- Make Me Special Custom Styles
  -- This file contains all user-defined custom styles for Make Me Special
  -- It can be edited manually or through the Make Me Special Style Editor SPA

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
    console.log("Starting Lua import...");

    // Clean up the code - remove comments
    let cleanCode = luaCode.replace(/--\[\[[\s\S]*?\]\]/g, ''); // Remove multi-line comments
    cleanCode = cleanCode.split('\n').map(line => {
      const commentPos = line.indexOf('--');
      return commentPos >= 0 ? line.substring(0, commentPos) : line;
    }).join('\n');

    // Locate the CUSTOM_STYLES table
    const tableMatch = cleanCode.match(/local\s+CUSTOM_STYLES\s*=\s*\{([\s\S]*)\}\s*return/);
    if (!tableMatch) {
      throw new Error("Could not find CUSTOM_STYLES table in Lua code");
    }

    const tableContent = tableMatch[1];
    const catalog = {};

    // Helper function to find all styles in the Lua table content
    function findStyles(content) {
      const styles = {};
      let currentStyleKey = null;
      let braceLevel = 0;
      let currentContent = '';
      let inStyle = false;

      // Process line by line
      const lines = content.split('\n');
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        if (!inStyle) {
          // Look for style start: key = {
          const match = line.match(/^(\w+)\s*=\s*\{/);
            if (match) {
              currentStyleKey = match[1];
              inStyle = true;
              braceLevel = 1; // We've found the opening brace
              currentContent = line + '\n';
            }
          } else {
            // We're inside a style definition
            currentContent += line + '\n';

            // Count braces to track nesting
            for (let j = 0; j < line.length; j++) {
              if (line[j] === '{') braceLevel++;
              if (line[j] === '}') braceLevel--;
            }

            // If braces are balanced and we've hit a comma after closing brace, style definition is complete
            if (braceLevel === 0 && line.endsWith(',')) {
              styles[currentStyleKey] = currentContent;
              inStyle = false;
              currentStyleKey = null;
              currentContent = '';
            }
          }
        }

        return styles;
      }

      // Various helper functions for extraction
      function extractStringValue(content, key) {
        const regex = new RegExp(`\\b${key}\\s*=\\s*"([^"]*)"`, 'i');
        const match = regex.exec(content);
        return match ? match[1] : '';
      }

      function extractTable(content, key) {
        const pattern = new RegExp(`\\b${key}\\s*=\\s*\\{([^]*?)\\}`, 'i');
        const match = pattern.exec(content);
        return match ? match[1].trim() : null;
      }

      function extractLangEntries(tableContent) {
        const entries = {};

        // Match both formats: en = "value" and ["en"] = "value"
        const regex1 = /\b(\w+)\s*=\s*"([^"]*)"/g;
        const regex2 = /\["([^"]*)"\]\s*=\s*"([^"]*)"/g;

        let match;
        while ((match = regex1.exec(tableContent)) !== null) {
          entries[match[1]] = match[2];
        }

        while ((match = regex2.exec(tableContent)) !== null) {
          entries[match[1]] = match[2];
        }

        return entries;
      }

      function extractColorArray(content, key) {
        const pattern = new RegExp(`\\b${key}\\s*=\\s*\\{\\s*([\\d,\\s]+)\\s*\\}`, 'i');
        const match = pattern.exec(content);

        if (match) {
          return match[1].split(',').map(v => parseInt(v.trim()));
        }

        return null;
      }

      function extractBoolValue(content, key) {
        const pattern = new RegExp(`\\b${key}\\s*=\\s*(true|false)\\b`, 'i');
        const match = pattern.exec(content);

        if (match) {
          return match[1].toLowerCase() === 'true';
        }

        return null;
      }

      function extractNumberValue(content, key) {
        const pattern = new RegExp(`\\b${key}\\s*=\\s*(\\d+)\\b`, 'i');
        const match = pattern.exec(content);

        if (match) {
          return parseInt(match[1]);
        }

        return null;
      }

      function extractTierBlocks(styleData) {
        const tiers = {};
        const tierRegex = /\s*(tier\d+)\s*=\s*\{/g;

          let match;
          while ((match = tierRegex.exec(styleData)) !== null) {
            const tierKey = match[1];
            const startPos = match.index;

            // Find the closing brace for this tier block
            let braceLevel = 1;
            let endPos = startPos + match[0].length;

            for (let i = endPos; i < styleData.length; i++) {
              if (styleData[i] === '{') braceLevel++;
              if (styleData[i] === '}') braceLevel--;

              if (braceLevel === 0) {
                endPos = i + 1;
                break;
              }
            }

            // Extract the tier content including braces
            tiers[tierKey] = styleData.substring(startPos, endPos);
          }

          return tiers;
        }

        // Process tier data
        function processTier(tierKey, tierContent) {
          // Create tier with default values
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

          // Process display names
          const nameFields = [
            'display_name_tier',
            'display_base_name',
            'display_name_curio',
            'display_name_weapon',
            'display_name_weapon_ranged',
            'display_name_other'
          ];

          for (const field of nameFields) {
            const langTable = extractTable(tierContent, field);
            if (langTable) {
              const langEntries = extractLangEntries(langTable);
              for (const [lang, value] of Object.entries(langEntries)) {
                tier[field][lang] = value;
              }
            }
          }

          // Process color arrays
          const colorFields = [
            'base_unified_color',
            'weapons_unified_color',
            'weapons_ranged_color',
            'curio_color',
            'other_item_color'
          ];

          for (const field of colorFields) {
            const colorArray = extractColorArray(tierContent, field);
            if (colorArray && colorArray.length >= 4) {
              tier[field] = colorArray;
            }
          }

          // Process boolean fields
          const boolFields = [
            'unified_active',
            'unified_weapons_colors',
            'unified_base_names',
            'needs_max_expertise'
          ];

          for (const field of boolFields) {
            const value = extractBoolValue(tierContent, field);
            if (value !== null) {
              tier[field] = value;
            }
          }

          // Extract rarity
          const rarity = extractNumberValue(tierContent, 'rarity');
          if (rarity !== null) {
            tier.rarity = rarity;
          }

          return tier;
        }

        // Process style data
        function processStyle(styleKey, styleData) {
          const style = {
            title: extractStringValue(styleData, 'title'),
            author: extractStringValue(styleData, 'author')
          };

          console.log(`Style ${styleKey}: "${style.title}" by "${style.author}"`);

          // Extract all tier blocks
          const tierBlocks = extractTierBlocks(styleData);
          console.log(`Found ${Object.keys(tierBlocks).length} tier blocks in style ${styleKey}`);

          // Process each tier
          for (const [tierKey, tierContent] of Object.entries(tierBlocks)) {
            const tier = processTier(tierKey, tierContent);
            if (tier) {
              style[tierKey] = tier;
              console.log(`Processed tier ${tierKey} - Name: "${tier.display_name_tier.en}", Color: [${tier.base_unified_color.join(', ')}]`);
            }
          }

          return style;
        }

        // Find and process all styles
        const styles = findStyles(tableContent);
        console.log(`Found ${Object.keys(styles).length} styles in Lua file`);

        // Process each style
        for (const [styleKey, styleData] of Object.entries(styles)) {
          const processedStyle = processStyle(styleKey, styleData);
          if (processedStyle) {
            catalog[styleKey] = processedStyle;
          }
        }

        return catalog;
      } catch (e) {
        console.error("Error importing Lua:", e);
        throw e;
      }
    }
    // Helper function to process a style block
    function _processStyleBlock(styleBlock) {
      try {
        // Create a new style object
        const style = {
          title: '',
          author: ''
        };

        // Extract title and author
        const titleMatch = styleBlock.match(/title\s*=\s*"([^"]*)"/);
        if (titleMatch) style.title = titleMatch[1];

        const authorMatch = styleBlock.match(/author\s*=\s*"([^"]*)"/);
        if (authorMatch) style.author = authorMatch[1];

        // Extract tier blocks
        let tierMatch;
        const tierRegex = /(tier\d+)\s*=\s*\{([^]*?)^\s*\},/gm;

        while ((tierMatch = tierRegex.exec(styleBlock)) !== null) {
          const tierKey = tierMatch[1];
          const tierContent = tierMatch[2];

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

          // Extract display name properties
          for (const nameType of ['display_name_tier', 'display_base_name', 'display_name_curio',
            'display_name_weapon', 'display_name_weapon_ranged', 'display_name_other']) {
            // Match both formats: property = { en = "value" } and property = { ["en"] = "value" }
            const nameRegex = new RegExp(`${nameType}\\s*=\\s*\\{([^{}]*)\\}`, 'i'); // Added 'i' for case insensitivity
            const nameMatch = nameRegex.exec(tierContent);

          if (nameMatch) {
            const langData = nameMatch[1];

            // Try to find direct english match first
            const enMatch = /\s*en\s*=\s*"([^"]*)"/i.exec(langData);
            if (enMatch) {
              tier[nameType].en = enMatch[1];
            }

            // Handle both ["lang"] = "value" and lang = "value" formats for all languages
            const langMatches = langData.matchAll(/\s*((?:\["?([^"\]]+)"?\])|(\w+))\s*=\s*"([^"]*)"/g);

            for (const langMatch of Array.from(langMatches)) {
              const langKey = langMatch[2] || langMatch[3];
              const langValue = langMatch[4];
              if (langKey && langValue) {
                tier[nameType][langKey.toLowerCase()] = langValue; // Convert key to lowercase for consistency
              }
            }
          }
            }

            // Extract color properties
            for (const colorType of ['base_unified_color', 'weapons_unified_color', 'weapons_ranged_color',
              'curio_color', 'other_item_color']) {
              const colorRegex = new RegExp(`${colorType}\\s*=\\s*\\{\\s*([\\d,\\s]+)\\s*\\}`, 'i'); // Added 'i' for case insensitivity
              const colorMatch = colorRegex.exec(tierContent);

            if (colorMatch) {
              const colorValues = colorMatch[1].split(',').map(n => parseInt(n.trim()));
              if (colorValues.length >= 4) {
                // IMPORTANT: Ensure color array is correctly formatted
                // Your Lua format might have RGBA or ARGB - make sure it's what your app expects
                // Assuming format is [A, R, G, B] as in your defaults
                tier[colorType] = [
                  colorValues[0], // Alpha
                  colorValues[1], // R
                  colorValues[2], // G
                  colorValues[3]  // B
                ];
              }
            }
              }

              // Extract boolean properties
              for (const boolType of ['unified_active', 'unified_weapons_colors', 'unified_base_names', 'needs_max_expertise']) {
                const boolRegex = new RegExp(`${boolType}\\s*=\\s*(true|false)`, 'i'); // Added 'i' for case insensitivity
                const boolMatch = boolRegex.exec(tierContent);

                if (boolMatch) {
                  tier[boolType] = boolMatch[1].toLowerCase() === 'true';
                }
              }

              // Extract rarity
              const rarityMatch = /rarity\s*=\s*(\d+)/i.exec(tierContent); // Added 'i' for case insensitivity
              if (rarityMatch) {
                tier.rarity = parseInt(rarityMatch[1]);
              }

              // Add debugging info for colors
              console.log(`Extracted tier ${tierKey} data:`, {
                name: tier.display_name_tier.en,
                colors: {
                  base: tier.base_unified_color,
                  weapons: tier.weapons_unified_color,
                  ranged: tier.weapons_ranged_color,
                  curio: tier.curio_color,
                  other: tier.other_item_color
                }
              });

              // Add tier to style
              style[tierKey] = tier;
        }

        return style;
      } catch (e) {
        console.error('Error processing style block:', e);
        return null;
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
    // At the end of storageUtils.js, add:
    console.log("StorageUtils module loaded, exposing to window.");
    window.StorageUtils = StorageUtils;
    console.log("Window.StorageUtils set to:", window.StorageUtils);
