#!/usr/bin/env node
"use strict";

var _axios = _interopRequireDefault(require("axios"));

var _path = require("path");

var _fs = require("fs");

var _mkdirp = _interopRequireDefault(require("mkdirp"));

var _prompt = _interopRequireDefault(require("prompt"));

var _colors = _interopRequireDefault(require("colors"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

let env = {
  DEPLOYMENT_ID: '',
  DEPLOYMENT_URL: '',
  AUTHORIZATION_TOKEN: '',
  OUTPUT_DIRECTORY: './deployment_source',
  TEAM_ID: false
};

const askForData = async () => {
  const promptSchema = [{
    name: 'DEPLOYMENT_ID',
    description: _colors.default.magenta('Desired deployment id from where to download: '),
    required: true
  }, {
    name: 'AUTHORIZATION_TOKEN',
    description: _colors.default.magenta('Authorization token (Example: Bearer <Token>)'),
    required: true
  }, {
    name: 'TEAM_ID',
    description: _colors.default.magenta('What is your team id? (Default: false - personal deployment)')
  }, {
    name: 'OUTPUT_DIRECTORY',
    description: _colors.default.magenta('Where do you want the source to be downloaded ? (Default: ./deployment_source)')
  }];

  _prompt.default.start();

  return new Promise((res, rej) => {
    _prompt.default.get(promptSchema, (err, results) => {
      if (err) {
        rej(err);
      }

      results.OUTPUT_DIRECTORY = results.OUTPUT_DIRECTORY || env.OUTPUT_DIRECTORY;
      results.TEAM_ID = results.TEAM_ID || env.TEAM_ID;
      res(results);
    });
  });
};

const appendTeamId = url => env.TEAM_ID ? `${url}?teamId=${env.TEAM_ID}` : env.DEPLOYMENT_URL;

const generateDirectory = path => {
  try {
    (0, _mkdirp.default)(path);
  } catch (err) {
    console.log(err);
  }
};

const fileWriteCallback = err => err && console.log(err);

const generateFile = async (fileId, fileName, currentPath) => {
  const url = appendTeamId(`${env.DEPLOYMENT_URL}/${fileId}`);

  try {
    const savePath = (0, _path.join)(currentPath, fileName);
    console.log('Downloading file: ', fileName, ' to path: ', savePath);
    const file = await _axios.default.get(url, {
      headers: {
        Authorization: env.AUTHORIZATION_TOKEN
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
  env = await askForData();
  env.DEPLOYMENT_URL = `https://api.zeit.co/v5/now/deployments/${env.DEPLOYMENT_ID}/files`;
  const getDeploymentStructureURL = appendTeamId(env.DEPLOYMENT_URL);

  try {
    const {
      data
    } = await _axios.default.get(getDeploymentStructureURL, {
      headers: {
        Authorization: env.AUTHORIZATION_TOKEN
      }
    });
    parseStructure(data, env.OUTPUT_DIRECTORY);
  } catch (err) {
    console.log(err);
  }
};

main();