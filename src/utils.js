import axios from 'axios';
import colors from 'colors';
import { createWriteStream } from 'fs';
import mkdirp from 'mkdirp';
import { join } from 'path';

export const getAuthToken = token => token.includes('Bearer') || token.includes('bearer')
  ? token[0].toUpperCase() + token.slice(1)
  : `bearer ${token}`;

export const appendTeamId = (url, teamId, symbol = '?') => teamId ?  `${url}${symbol}teamId=${teamId}` : url;

const generateFile = async (fileName, currentPath, env) => {
  const url = appendTeamId(`${env.DEPLOYMENT_FILE_URL}${fileName}`, env.TEAM_ID, '&');

  try {
    const savePath = join(currentPath, fileName);
    console.log(colors.yellow('Downloading file: '), colors.cyan(fileName), colors.yellow(' to path: '), colors.cyan(savePath));
    const { data } = await axios.get(url, {
      responseType:'stream',
      headers: {
        Authorization: env.AUTHORIZATION_TOKEN
      }
    });
    data.pipe(createWriteStream(savePath));
  } catch (err) {
    console.log(colors.red(`Cannot download from ${url}. Please raise an issue here: https://github.com/CalinaCristian/source-from-vercel-deployment/issues !`));
    process.exit();
  }
};

const generateDirectory = (path) => {
  try {
    mkdirp(path);
  } catch (err) {
    console.log(colors.red(`Cannot write directory on path: ${path} !`));
    process.exit();
  }
};

const parseCurrent = (node, currentPath, env) => {
  if (node.type === 'directory') {
    generateDirectory(join(currentPath, node.name));
    parseStructure(node.children, join(currentPath, node.name), env);
  } else if (node.type === 'file') {
    generateFile(node.name, currentPath, env);
  }
};

export const parseStructure = (folderStructure, currentPath, env) => {
  folderStructure.forEach(structure => parseCurrent(structure, currentPath, env));
};