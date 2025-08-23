// Search utilities with NLP keyword mapping for service categories

export interface KeywordMapping {
  [key: string]: string[];
}

// NLP keyword mapping for service categories
export const serviceKeywords: KeywordMapping = {
  // Automotive
  automotive: [
    'car', 'vehicle', 'auto', 'truck', 'motorcycle', 'bike', 'engine', 'brake', 'tire', 'tyre',
    'battery', 'oil', 'mechanic', 'repair', 'service', 'maintenance', 'garage', 'workshop',
    'transmission', 'clutch', 'suspension', 'exhaust', 'radiator', 'windshield', 'bodywork'
  ],
  
  // Carpentry & Woodwork
  carpentry: [
    'wood', 'wooden', 'timber', 'furniture', 'cabinet', 'table', 'chair', 'desk', 'shelf',
    'door', 'window', 'frame', 'deck', 'fence', 'carpenter', 'joinery', 'woodwork',
    'flooring', 'laminate', 'hardwood', 'custom', 'build', 'repair', 'restoration'
  ],
  
  // Electrical
  electrical: [
    'electric', 'electricity', 'power', 'wire', 'wiring', 'socket', 'outlet', 'switch',
    'lighting', 'light', 'lamp', 'electrician', 'installation', 'repair', 'maintenance',
    'circuit', 'breaker', 'panel', 'voltage', 'current', 'bulb', 'fan', 'appliance'
  ],
  
  // Plumbing
  plumbing: [
    'water', 'pipe', 'pipes', 'plumber', 'drain', 'leak', 'faucet', 'tap', 'toilet',
    'shower', 'bath', 'basin', 'sink', 'geyser', 'heater', 'boiler', 'pump',
    'sewage', 'drainage', 'blockage', 'installation', 'repair', 'maintenance'
  ],
  
  // Painting
  painting: [
    'paint', 'painter', 'color', 'colour', 'wall', 'interior', 'exterior', 'brush',
    'roller', 'spray', 'primer', 'varnish', 'coating', 'decoration', 'decorating',
    'finish', 'texture', 'mural', 'artistic', 'touch-up'
  ],
  
  // Gardening & Landscaping
  gardening: [
    'garden', 'gardening', 'landscape', 'lawn', 'grass', 'plant', 'tree', 'flower',
    'hedge', 'pruning', 'trimming', 'mowing', 'landscaping', 'irrigation', 'sprinkler',
    'compost', 'fertilizer', 'soil', 'seeds', 'outdoor', 'yard', 'maintenance'
  ],
  
  // Home Repairs
  'home-repairs': [
    'repair', 'fix', 'maintenance', 'handyman', 'general', 'odd', 'jobs', 'home',
    'house', 'property', 'renovation', 'improvement', 'restoration', 'upgrade',
    'installation', 'assembly', 'mounting', 'hanging', 'fixing'
  ],
  
  // Technology Support
  'tech-support': [
    'computer', 'laptop', 'pc', 'technology', 'tech', 'software', 'hardware', 'internet',
    'wifi', 'network', 'printer', 'phone', 'smartphone', 'tablet', 'setup',
    'installation', 'troubleshooting', 'repair', 'upgrade', 'virus', 'malware'
  ],
  
  // Photography
  photography: [
    'photo', 'photography', 'photographer', 'camera', 'picture', 'portrait', 'wedding',
    'event', 'commercial', 'studio', 'shoot', 'session', 'editing', 'video',
    'videography', 'drone', 'aerial'
  ],
  
  // Catering & Food
  catering: [
    'food', 'catering', 'chef', 'cook', 'cooking', 'kitchen', 'meal', 'restaurant',
    'party', 'event', 'wedding', 'birthday', 'celebration', 'buffet', 'menu',
    'cuisine', 'baking', 'cake', 'dessert'
  ],
  
  // Tailoring & Fashion
  tailoring: [
    'clothing', 'clothes', 'fashion', 'tailor', 'sewing', 'alteration', 'repair',
    'dress', 'suit', 'shirt', 'pants', 'skirt', 'jacket', 'hem', 'fitting',
    'custom', 'design', 'fabric', 'textile'
  ],
  
  // Construction
  construction: [
    'building', 'construction', 'contractor', 'builder', 'cement', 'concrete', 'brick',
    'masonry', 'foundation', 'roofing', 'tiling', 'flooring', 'drywall', 'insulation',
    'renovation', 'extension', 'addition', 'demolition', 'excavation'
  ]
};

// Function to find matching categories based on search query
export const findMatchingCategories = (searchQuery: string): string[] => {
  if (!searchQuery.trim()) return [];
  
  const query = searchQuery.toLowerCase().trim();
  const matchingCategories: string[] = [];
  
  // Check each category's keywords
  Object.entries(serviceKeywords).forEach(([category, keywords]) => {
    const hasMatch = keywords.some(keyword => 
      query.includes(keyword) || keyword.includes(query)
    );
    
    if (hasMatch) {
      matchingCategories.push(category);
    }
  });
  
  // If no keyword matches found, check if query directly matches category name
  if (matchingCategories.length === 0) {
    Object.keys(serviceKeywords).forEach(category => {
      if (category.toLowerCase().includes(query) || query.includes(category.toLowerCase())) {
        matchingCategories.push(category);
      }
    });
  }
  
  return matchingCategories;
};

// Function to validate search query (not empty or just whitespace)
export const isValidSearchQuery = (query: string): boolean => {
  return query.trim().length > 0;
};