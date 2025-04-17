// Default style template for Master Works
const DEFAULT_STYLE_TEMPLATE = {
  title: "New Style",
  author: "Your Name",
  
  // Tier 0 (Divine) - Rarity 5 with max expertise
  tier0: {
    // Tier name
    display_name_tier: {
      en: "Divine",
    },
    // Unified base item name
    display_base_name: {
      en: "Gear",
    },
    // Base curio name
    display_name_curio: {
      en: "Artifact",
    },
    // Base weapon name
    display_name_weapon: {
      en: "Arms",
    },
    // Base weapon name ranged
    display_name_weapon_ranged: {
      en: "Firearm",
    },
    // Base other item name
    display_name_other: {
      en: "Goods",
    },
    // Color for all items regardless of type
    base_unified_color: [255, 180, 30, 255],
    // Specific color for both ranged and melee
    weapons_unified_color: [255, 180, 30, 255],
    // Specific color for ranged
    weapons_ranged_color: [255, 180, 30, 255],
    // Curio specific color
    curio_color: [255, 180, 30, 255],
    // Other item specific color
    other_item_color: [255, 180, 30, 255],
    unified_active: true,
    unified_weapons_colors: true,
    unified_base_names: true,
    rarity: 5,
    needs_max_expertise: true
  },
  
  // Tier 1 (Legendary) - Rarity 5 without max expertise
  tier1: {
    display_name_tier: {
      en: "Legendary",
    },
    display_base_name: {
      en: "Gear",
    },
    display_name_curio: {
      en: "Artifact",
    },
    display_name_weapon: {
      en: "Arms",
    },
    display_name_weapon_ranged: {
      en: "Firearm",
    },
    display_name_other: {
      en: "Goods",
    },
    base_unified_color: [255, 0, 200, 255],
    weapons_unified_color: [255, 0, 200, 255],
    weapons_ranged_color: [255, 0, 200, 255],
    curio_color: [255, 0, 200, 255],
    other_item_color: [255, 0, 200, 255],
    unified_active: true,
    unified_weapons_colors: true,
    unified_base_names: true,
    rarity: 5,
    needs_max_expertise: false
  },
  
  // Tier 2 (Exalted) - Rarity 4
  tier2: {
    display_name_tier: {
      en: "Exalted",
    },
    display_base_name: {
      en: "Gear",
    },
    display_name_curio: {
      en: "Artifact",
    },
    display_name_weapon: {
      en: "Arms",
    },
    display_name_weapon_ranged: {
      en: "Firearm",
    },
    display_name_other: {
      en: "Goods",
    },
    base_unified_color: [255, 0, 220, 220],
    weapons_unified_color: [255, 0, 220, 220],
    weapons_ranged_color: [255, 0, 220, 220],
    curio_color: [255, 0, 220, 220],
    other_item_color: [255, 0, 220, 220],
    unified_active: true,
    unified_weapons_colors: true,
    unified_base_names: true,
    rarity: 4,
    needs_max_expertise: false
  },
  
  // Tier 3 (Enhanced) - Rarity 3
  tier3: {
    display_name_tier: {
      en: "Enhanced",
    },
    display_base_name: {
      en: "Gear",
    },
    display_name_curio: {
      en: "Artifact",
    },
    display_name_weapon: {
      en: "Arms",
    },
    display_name_weapon_ranged: {
      en: "Firearm",
    },
    display_name_other: {
      en: "Goods",
    },
    base_unified_color: [255, 50, 200, 100],
    weapons_unified_color: [255, 50, 200, 100],
    weapons_ranged_color: [255, 50, 200, 100],
    curio_color: [255, 50, 200, 100],
    other_item_color: [255, 50, 200, 100],
    unified_active: true,
    unified_weapons_colors: true,
    unified_base_names: true,
    rarity: 3,
    needs_max_expertise: false
  },
  
  // Tier 4 (Standard) - Rarity 2
  tier4: {
    display_name_tier: {
      en: "Standard",
    },
    display_base_name: {
      en: "Gear",
    },
    display_name_curio: {
      en: "Artifact",
    },
    display_name_weapon: {
      en: "Arms",
    },
    display_name_weapon_ranged: {
      en: "Firearm",
    },
    display_name_other: {
      en: "Goods",
    },
    base_unified_color: [255, 140, 180, 210],
    weapons_unified_color: [255, 140, 180, 210],
    weapons_ranged_color: [255, 140, 180, 210],
    curio_color: [255, 140, 180, 210],
    other_item_color: [255, 140, 180, 210],
    unified_active: true,
    unified_weapons_colors: true,
    unified_base_names: true,
    rarity: 2,
    needs_max_expertise: false
  },
  
  // Tier 5 (Common) - Rarity 1
  tier5: {
    display_name_tier: {
      en: "Common",
    },
    display_base_name: {
      en: "Gear",
    },
    display_name_curio: {
      en: "Artifact",
    },
    display_name_weapon: {
      en: "Arms",
    },
    display_name_weapon_ranged: {
      en: "Firearm",
    },
    display_name_other: {
      en: "Goods",
    },
    base_unified_color: [255, 180, 180, 180],
    weapons_unified_color: [255, 180, 180, 180],
    weapons_ranged_color: [255, 180, 180, 180],
    curio_color: [255, 180, 180, 180],
    other_item_color: [255, 180, 180, 180],
    unified_active: true,
    unified_weapons_colors: true,
    unified_base_names: true,
    rarity: 1,
    needs_max_expertise: false
  }
};

// List of supported languages
const SUPPORTED_LANGUAGES = {
  en: { name: "English", code: "en" },
  es: { name: "Spanish", code: "es" },
  "zh-cn": { name: "Chinese-Mandarin", code: "zh-cn" },
  it: { name: "Italian", code: "it" },
  ru: { name: "Russian", code: "ru" },
  "br-pt": { name: "Portuguese-Brazil", code: "br-pt" },
  ja: { name: "Japanese", code: "ja" },
  ko: { name: "Korean", code: "ko" },
  de: { name: "German", code: "de" },
  fr: { name: "French", code: "fr" },
  pl: { name: "Polish", code: "pl" }
};

// Create a new style with default template
function _createNewStyle(title, author) {
  const newStyle = JSON.parse(JSON.stringify(DEFAULT_STYLE_TEMPLATE));
  
  if (title) newStyle.title = title;
  if (author) newStyle.author = author;
  
  return newStyle;
}

// Generate a style key from title and author
function _generateStyleKey(title, author) {
  const cleanTitle = title.toLowerCase().replace(/[^a-z0-9]+/g, '_');
  const cleanAuthor = author.toLowerCase().replace(/[^a-z0-9]+/g, '_');
  
  return `${cleanTitle}_${cleanAuthor}`;
}

// Export functions
export const StylesUtil = {
  DEFAULT_STYLE_TEMPLATE,
  SUPPORTED_LANGUAGES,
  createNewStyle: _createNewStyle,
  generateStyleKey: _generateStyleKey
};