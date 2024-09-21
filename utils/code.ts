const crypto = require('crypto');
export const generateCode = (length = 6) => {
    return crypto.randomInt(0, Math.pow(10, length)).toString().padStart(length, '0');
}