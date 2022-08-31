/**
 * Helpers for various tasks
 */

// Dependencies

export default {
  // Parse a JSON string to an object in all cases, without throwing
  parseJsonToObject: (str) => {
    try {
      const obj = JSON.parse(str);
      return obj;
    } catch (err) {
      return {};
    }
  },

  colorCode(colorString) {
    if (colorString === 'magenta') return '35';
    if (colorString === 'cyan') return '36';
  },
};
