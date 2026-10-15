const CHARSET = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
const BASE = CHARSET.length;

function encodeBase62(num) {
  if (num === 0) return CHARSET[0];

  let encoded = '';
  while (num > 0) {
    const remainder = num % BASE;
    encoded = CHARSET[remainder] + encoded;
    num = Math.floor(num / BASE);
  }

  return encoded;
}

module.exports = {
  encodeBase62
};