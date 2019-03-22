"use strict";

var _axios = _interopRequireDefault(require("axios"));

var _config = require("../config");

var _path = require("path");

var _fs = require("fs");

var _mkdirp = _interopRequireDefault(require("mkdirp"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const appendTeamId = url => _config.TeamID ? `${url}?teamId=${_config.TeamID}` : _config.DeploymentURL;

const generateDirectory = path => {
  try {
    (0, _mkdirp.default)(path);
  } catch (err) {
    console.log(err);
  }
};

const fileWriteCallback = err => err && console.log(err);

const generateFile = async (fileId, fileName, currentPath) => {
  const url = appendTeamId(`${_config.DeploymentURL}/${fileId}`, _config.TeamID);

  try {
    const savePath = (0, _path.join)(currentPath, fileName);
    console.log('Downloading file: ', fileName, ' to path: ', savePath);
    const file = await _axios.default.get(url, {
      headers: {
        Authorization: _config.AuthorizationToken
      }
    });
    const {
      data,
      ...rest
    } = file;
    const saveData = typeof data === 'object' ? JSON.stringify(data, null, 2) : data;
    (0, _fs.writeFile)(savePath, saveData, 'utf-8', fileWriteCallback);
  } catch (err) {
    console.log(err);
  }
};

const parseCurrent = (node, currentPath) => {
  if (node.type === 'directory') {
    parseStructure(node.children, (0, _path.join)(currentPath, node.name));
    generateDirectory((0, _path.join)(currentPath, node.name));
  } else if (node.type === 'file') {
    generateFile(node.uid, node.name, currentPath);
  }
};

const parseStructure = (folderStructure, currentPath) => {
  folderStructure.forEach(structure => parseCurrent(structure, currentPath));
};

const main = async () => {
  const getDeploymentStructureURL = appendTeamId(_config.DeploymentURL);

  try {
    const {
      data
    } = await _axios.default.get(getDeploymentStructureURL, {
      headers: {
        Authorization: _config.AuthorizationToken
      }
    });
    parseStructure(data, _config.OutputDirectory);
  } catch (err) {
    console.log(err);
  }
};

main();