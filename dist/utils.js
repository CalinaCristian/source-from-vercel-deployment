"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.parseStructure = exports.appendTeamId = exports.getAuthToken = void 0;

var _colors = _interopRequireDefault(require("colors"));

var _mkdirp = _interopRequireDefault(require("mkdirp"));

var _path = require("path");

var _axios = _interopRequireDefault(require("axios"));

var _fs = require("fs");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const getAuthToken = token => token.includes('Bearer') || token.includes('bearer') ? token[0].toUpperCase() + token.slice(1) : `bearer ${token}`;

exports.getAuthToken = getAuthToken;

const appendTeamId = (url, teamId) => teamId ? `${url}?teamId=${teamId}` : url;

exports.appendTeamId = appendTeamId;

const fileWriteCallback = path => err => {
  if (err) {
    console.log(_colors.default.red(`Error while writing file: ${path}`));
    process.exit();
  }
};

const generateFile = async (fileId, fileName, currentPath, env) => {
  const url = appendTeamId(`${env.DEPLOYMENT_URL}/${fileId}`, env.TEAM_ID);

  try {
    const savePath = (0, _path.join)(currentPath, fileName);
    console.log(_colors.default.yellow('Downloading file: '), _colors.default.cyan(fileName), _colors.default.yellow(' to path: '), _colors.default.cyan(savePath));
    const {
      data
    } = await _axios.default.get(url, {
      responseType: 'stream',
      headers: {
        Authorization: env.AUTHORIZATION_TOKEN
      }
    });
    data.pipe((0, _fs.createWriteStream)(savePath));
  } catch (err) {
    console.log(console.log(err));
    console.log(console.log(_colors.default.red('Error while downloading files. Exiting...')));
    process.exit();
  }
};

const generateDirectory = path => {
  try {
    (0, _mkdirp.default)(path);
  } catch (err) {
    console.log(console.log(_colors.default.red(`Cannot write directory on path: ${path} !`)));
    process.exit();
  }
};

const parseCurrent = (node, currentPath, env) => {
  if (node.type === 'directory') {
    parseStructure(node.children, (0, _path.join)(currentPath, node.name), env);
    generateDirectory((0, _path.join)(currentPath, node.name));
  } else if (node.type === 'file') {
    generateFile(node.uid, node.name, currentPath, env);
  }
};

const parseStructure = (folderStructure, currentPath, env) => {
  folderStructure.forEach(structure => parseCurrent(structure, currentPath, env));
};

exports.parseStructure = parseStructure;