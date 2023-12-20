const path = require('path');

module.exports = {
  mode: 'development',
  entry: './scripts/bot.mjs',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bot.bundle.js',
  },
};
