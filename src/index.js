import axios from 'axios';
import { join } from 'path';
import { writeFile } from 'fs';
import mkdirp from 'mkdirp';

const {
  DEPLOYMENT_ID,
  AUTHORIZATION_TOKEN,
  OUTPUT_DIRECTORY = './deployment_source',
  TEAM_ID = false
} = process.env;

if (!DEPLOYMENT_URL || AUTHORIZATION_TOKEN) {
  throw new Error('Usage: ');
}

const deploymentUrl = `https://api.zeit.co/v5/now/deployments/${DEPLOYMENT_ID}/files`;
const appendTeamId = url => TEAM_ID ?  `${url}?teamId=${TEAM_ID}` : DEPLOYMENT_URL;

const generateDirectory = (path) => {
  try {
    mkdirp(path);
  } catch (err) {
    console.log(err);
  }
};

const fileWriteCallback = (err) => err && console.log(err);

const generateFile = async (fileId, fileName, currentPath) => {
  const url = appendTeamId(`${DEPLOYMENT_URL}/${fileId}`, TEAM_ID);

  try {
    const savePath = join(currentPath, fileName);
    console.log('Downloading file: ', fileName, ' to path: ', savePath);
    const file = await axios.get(url, {
      headers: {
        Authorization: AUTHORIZATION_TOKEN
      }
    });
    const { data, ...rest } = file;
    const saveData = typeof data === 'object' ? JSON.stringify(data, null, 2) : data;

    writeFile(savePath, saveData, 'utf-8', fileWriteCallback);
  } catch (err) {
    console.log(err);
  }
};

const parseCurrent = (node, currentPath) => {
  if (node.type === 'directory') {
    parseStructure(node.children, join(currentPath, node.name));

    generateDirectory(join(currentPath, node.name));
  } else if (node.type === 'file') {
    generateFile(node.uid, node.name, currentPath);
  }
};

const parseStructure = (folderStructure, currentPath) => {
  folderStructure.forEach(structure => parseCurrent(structure, currentPath));
};

const main = async () => {
  const getDeploymentStructureURL = appendTeamId(DEPLOYMENT_URL);

  try {
    const { data } = await axios.get(getDeploymentStructureURL, {
      headers: {
        Authorization: AUTHORIZATION_TOKEN
      }
    });

    parseStructure(data, OUTPUT_DIRECTORY);
  } catch (err) {
    console.log(err);
  }
};

main();
