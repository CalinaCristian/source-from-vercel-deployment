import colors from 'colors';
import mkdirp from "mkdirp";
import { join } from 'path';
import axios from 'axios';
import { createWriteStream } from 'fs';

export const getAuthToken = token => token.includes('Bearer') || token.includes('bearer')
  ? token[0].toUpperCase() + token.slice(1)
  : `bearer ${token}`;

export const appendTeamId = (url, teamId) => teamId ?  `${url}?teamId=${teamId}` : url;

const fileWriteCallback = path => err => {
  if (err) {
    console.log(colors.red(`Error while writing file: ${path}`));
    process.exit();
  }
};

const generateFile = async (fileId, fileName, currentPath, env) => {
  const url = appendTeamId(`${env.DEPLOYMENT_URL}/${fileId}`, env.TEAM_ID);

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
    console.log(err);
    console.log(colors.red('Error while downloading files. Exiting...'));
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
    generateFile(node.uid, node.name, currentPath, env);
  }
};

export const parseStructure = (folderStructure, currentPath, env) => {
  folderStructure.forEach(structure => parseCurrent(structure, currentPath, env));
};