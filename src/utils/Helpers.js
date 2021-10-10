
// Helper methods

export function isValidString(str) {
    return str != null && str !== '';
}

export function getShortGameId(gameId) {
    return gameId.slice(-6);
}

// Function to generate and return light square color
export function getLightSquareColor() {
    const min = 160;
    const max = 255;
    const r = getRandomNumber(min, max);
    const g = getRandomNumber(min, max);
    const b = getRandomNumber(min, max);
    return `${r},${g},${b}`;
}
  
  // Function to generate and return dark square color
export function getDarkSquareColor() {
    const min = 50;
    const max = 140;
    const r = getRandomNumber(min, max);
    const g = getRandomNumber(min, max);
    const b = getRandomNumber(min, max);
    return `${r},${g},${b}`;
}
  
  // Function to generate random number 
export function getRandomNumber(min, max) { 
    return Math.floor(Math.random() * (max - min) + min);
}
  
export function stringValueEqual(str1, str2) {
    if (!isValidString(str1) || !isValidString(str2)) {
      return false;
    } else {
      const result = str1.localeCompare(str2, undefined, { sensitivity: 'base' }) === 0;
      return result;
    }
}

export function getDateDifferenceInSeconds(fromDate, toDate) {
  return (fromDate - toDate) / 1000;
}