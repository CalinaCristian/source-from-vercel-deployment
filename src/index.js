#!/usr/bin/env node

import axios from 'axios';
import { join } from 'path';
import { writeFile } from 'fs';
import mkdirp from 'mkdirp';
import prompt from 'prompt';
import colors from 'colors';

let env = {
  DEPLOYMENT_ID: '',
  DEPLOYMENT_URL: '',
  AUTHORIZATION_TOKEN: '',
  OUTPUT_DIRECTORY: './deployment_source',
  TEAM_ID: false
};

const askForData = async() => {
  const promptSchema = [{
      name: 'DEPLOYMENT_ID',
      description: colors.magenta('Desired deployment id from where to download: '),
      required: true
    }, {
      name: 'AUTHORIZATION_TOKEN',
      description: colors.magenta('Authorization token (Example: Bearer <Token>)'),
      required: true
    }, {
      name: 'TEAM_ID',
      description: colors.magenta('What is your team id? (Default: false - personal deployment)'),
    }, {
      name: 'OUTPUT_DIRECTORY',
      description: colors.magenta('Where do you want the source to be downloaded ? (Default: ./deployment_source)'),
    }
  ];
  prompt.start();
  return new Promise((res, rej) => {
    prompt.get(promptSchema, (err, results) => {
      if (err) {
        rej(err);
      }
      results.OUTPUT_DIRECTORY = results.OUTPUT_DIRECTORY || env.OUTPUT_DIRECTORY;
      results.TEAM_ID = results.TEAM_ID || env.TEAM_ID;
      res(results);
    });
  })
};

const appendTeamId = url => env.TEAM_ID ?  `${url}?teamId=${env.TEAM_ID}` : env.DEPLOYMENT_URL;

const generateDirectory = (path) => {
  try {
    mkdirp(path);
  } catch (err) {
    console.log(err);
  }
};

const fileWriteCallback = (err) => err && console.log(err);

const generateFile = async (fileId, fileName, currentPath) => {
  const url = appendTeamId(`${env.DEPLOYMENT_URL}/${fileId}`);

  try {
    const savePath = join(currentPath, fileName);
    console.log('Downloading file: ', fileName, ' to path: ', savePath);
    const file = await axios.get(url, {
      headers: {
        Authorization: env.AUTHORIZATION_TOKEN
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
  env = await askForData();
  env.DEPLOYMENT_URL = `https://api.zeit.co/v5/now/deployments/${env.DEPLOYMENT_ID}/files`;
  const getDeploymentStructureURL = appendTeamId(env.DEPLOYMENT_URL);

  try {
    const { data } = await axios.get(getDeploymentStructureURL, {
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
