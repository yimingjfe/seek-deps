const path = require('path');
const { get } = require('lodash');

const fs = jest.genMockFromModule('fs');

let mockFiles = Object.create(null);
function __setMockFiles(newMockFiles) {
  mockFiles = newMockFiles;
}

function existsSync(filename) {
  filename = filename.replace(process.cwd() + '/', '');
  const content = get(mockFiles, filename.split('/'));
  return typeof content === 'string';
}

function readFileSync(filename) {
  const content = get(mockFiles, filename.split('/'));
  return content;
}

fs.__setMockFiles = __setMockFiles;
fs.existsSync = existsSync;
fs.readFileSync = readFileSync;

module.exports = fs;
