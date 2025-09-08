// Pre-bundled portal data to eliminate network requests
// This file will be generated from the JSON files to improve loading performance

'use strict';

const PORTALS_DATA = {
  admin: null,
  user: null,
  thirdparty: null
};

// Function to load bundled data instead of making network requests
function loadBundledPortalData() {
  // This will be populated by build process or manually for now
  return Promise.resolve([]);
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { PORTALS_DATA, loadBundledPortalData };
}