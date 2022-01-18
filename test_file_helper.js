const fs = require('fs');
const path = require('path');

const testDataDirectory = path.join(__dirname,'test_data');
const testDataPath = (fileName) => {
  if (fileName.startsWith(testDataDirectory)){
    return fileName;
  } else {
    return path.join(testDataDirectory, fileName);
  }
};
const testFixtureDirectory = path.join(__dirname,'test_fixtures');
const testFixturePath = (fileName) => {
  if (fileName.startsWith(testFixtureDirectory)){
    return fileName;
  } else {
    return path.join(testFixtureDirectory, fileName);
  }
};

module.exports = testDataPath;

function removeDirectoryContents(directoryPath) {
  const files = fs.readdirSync(directoryPath);
  files.forEach((fileName) => {
    const filePath = path.join(directoryPath, fileName);
    if (fs.statSync(filePath).isFile()) {
      fs.unlinkSync(filePath);
    } else {
      removeDirectory(filePath);
    }
  });
}

const removeDirectory = function async (directoryPath) {
  removeDirectoryContents(directoryPath);

  fs.rmdirSync(directoryPath);
};

const removeAllTestDataFiles = async () => {


  let testDataDirectory = testDataPath('');

  removeDirectoryContents(testDataDirectory);

  await createTestDataFile('.keep', '')
};

const fileExists = function (filePath){
  return fs.existsSync(filePath);
}


const createTestDataFile = (fileName, text) => {
  fs.writeFileSync(testDataPath(fileName), text)
};


module.exports = {createTestDataFile, removeAllTestDataFiles, testDataPath, testFixturePath, fileExists};