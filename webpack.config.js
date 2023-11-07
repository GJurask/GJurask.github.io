const path = require('path');

module.exports = {
  entry: './script.js', // Seu arquivo JavaScript principal com "require"
  output: {
    filename: 'bundle.js', // O nome do arquivo de saída
    path: path.resolve(__dirname, 'dist'), // A pasta de saída
  },
};
