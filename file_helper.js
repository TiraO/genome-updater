const readline = require("readline");
const fs = require('fs');
const path = require('path');

/**
 * this helps with keeping track of what file came from where
 * by ensuring that file names are related and files end up together
 * (where the person is working)
 *
 * @param filePath
 * @param transformName
 * @param extension
 * @returns {string}
 */
const derivativePath = function (filePath, transformName = "", extension) {
  let extensionStart = filePath.lastIndexOf('.');
  let extensionToUse;
  if (extension) {
    if (extension[0] == '.') {
      extensionToUse = extension;
    } else {
      extensionToUse = '.' + extension;
    }
  } else {
    extensionToUse = filePath.substr(extensionStart);
  }
  let transformPart = "";
  if (transformName) {
    transformPart = "_" + transformName;
  }
  return filePath.substr(0, extensionStart) + transformPart + extensionToUse;
};


function loadFile(filePath) {
 return fs.readFileSync(filePath, "UTF-8");
};
module.exports = {derivativePath, loadFile}