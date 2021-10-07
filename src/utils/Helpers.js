
// Helper methods

export function isValidString(str) {
    return str != null && str !== '';
}

export function getShortGameId(gameId) {
    return gameId.slice(-6);
}