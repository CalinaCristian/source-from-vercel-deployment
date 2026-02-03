"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.startDownload = exports.parseStructure = exports.getAuthToken = exports.appendTeamId = void 0;

var _axios = _interopRequireDefault(require("axios"));

var _colors = _interopRequireDefault(require("colors"));

var _fsExtra = _interopRequireDefault(require("fs-extra"));

var _path = _interopRequireWildcard(require("path"));

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const getAuthToken = token => token.includes('Bearer') || token.includes('bearer') ? token[0].toUpperCase() + token.slice(1) : `bearer ${token}`;

exports.getAuthToken = getAuthToken;

const appendTeamId = (url, teamId, symbol = '?') => teamId ? `${url}${symbol}teamId=${teamId}` : url;

exports.appendTeamId = appendTeamId;

const downloadFile = async (node, currentPath, env) => {
  const fileName = node.name;
  const url = appendTeamId(node.link, env.TEAM_ID, "&");
  if (fileName.includes(".env")) return;

  const savePath = _path.default.join(env.OUTPUT_DIRECTORY, currentPath, fileName);

  try {
    console.log(_colors.default.yellow('Downloading file: '), _colors.default.cyan(fileName), _colors.default.yellow(' to path: '), _colors.default.cyan(savePath));
    const response = await _axios.default.get(url, {
      headers: {
        Authorization: env.AUTHORIZATION_TOKEN
      }
    });
    const fileContent = Buffer.from(response.data.data, 'base64').toString();
    await _fsExtra.default.writeFile(savePath, fileContent);
  } catch (err) {
    console.error(_colors.default.red(`Cannot download file ${fileName} from ${url}. Error: ${err.message}`));
  }
};

const generateDirectory = path => {
  try {
    if (!_fsExtra.default.existsSync(path)) {
      _fsExtra.default.mkdirpSync(path);

      console.log(_colors.default.yellow(`Created directory on path: ${path}`));
    }
  } catch (err) {
    console.error(_colors.default.red(`Cannot create directory on path: ${path}. Error: ${err.message}`));
    process.exit(1);
  }
};

const getFileTree = async (path, env) => {
  const url = `${env.DEPLOYMENT_URL_SHORT}${path}&teamId=${env.TEAM_ID}`;
  console.log("Fetching file tree from URL: " + url);
  const {
    data
  } = await _axios.default.get(url, {
    headers: {
      Authorization: env.AUTHORIZATION_TOKEN
    }
  });
  return data;
};

const parseCurrent = async (node, currentPath, env) => {
  const nodePath = (0, _path.join)(currentPath, node.name);

  if (node.type === 'directory') {
    generateDirectory((0, _path.join)(env.OUTPUT_DIRECTORY, nodePath));
    const childNode = await getFileTree(nodePath.replace(/\\/g, '/'), env);
    console.log("Processing directory: ", nodePath);
    childNode.forEach(element => {
      console.log(" - ", element.name);
    });
    await parseStructure(childNode, nodePath, env);
  } else if (node.type === 'file') {
    await downloadFile(node, currentPath, env);
  }
};

const parseStructure = async (folderStructure, currentPath, env) => {
  if (folderStructure) {
    for (const structure of folderStructure) {
      await parseCurrent(structure, currentPath, env);
    }
  }
};

exports.parseStructure = parseStructure;

const startDownload = async (initialPath, env) => {
  const fileTree = await getFileTree(initialPath, env);
  await parseStructure(fileTree, initialPath, env);
};

exports.startDownload = startDownload;