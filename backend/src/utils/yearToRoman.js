'use strict';

/**
 * Converts numeric or string academic year (1, 2, 3, 4) to Roman numeral (I, II, III, IV).
 * Defaults to "I" or string representation if outside 1-4.
 */
function yearToRoman(year) {
  const num = parseInt(year, 10);
  switch (num) {
    case 1:
      return 'I';
    case 2:
      return 'II';
    case 3:
      return 'III';
    case 4:
      return 'IV';
    default:
      return String(year || 'I').toUpperCase();
  }
}

module.exports = yearToRoman;
