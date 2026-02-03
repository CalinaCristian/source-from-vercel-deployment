import axios from 'axios';
import colors from 'colors';
import fsExtra from 'fs-extra';
import { join } from 'path';
import path from 'path';

export const getAuthToken = token => token.includes('Bearer') || token.includes('bearer')
  ? token[0].toUpperCase() + token.slice(1)
  : `bearer ${token}`;

export const appendTeamId = (url, teamId, symbol = '?') => teamId ? `${url}${symbol}teamId=${teamId}` : url;
 
 
const downloadFile = async (node, currentPath, env) => {
  const fileName = node.name;
  const url = appendTeamId(node.link, env.TEAM_ID,"&"); 

  if (fileName.includes(".env")) 
    return;  

  const savePath = path.join(env.OUTPUT_DIRECTORY, currentPath, fileName);
  try { 
    console.log(colors.yellow('Downloading file: '), colors.cyan(fileName), colors.yellow(' to path: '), colors.cyan(savePath));

    const response = await axios.get(url, {
      headers: {
        Authorization: env.AUTHORIZATION_TOKEN
      }
    }); 
    const fileContent = Buffer.from(response.data.data, 'base64').toString();
    await fsExtra.writeFile(savePath, fileContent);
  } catch (err) {
    console.error(colors.red(`Cannot download file ${fileName} from ${url}. Error: ${err.message}`));
  }
};
 
const generateDirectory = (path) => {
  try {
    if (!fsExtra.existsSync(path)) {  
      fsExtra.mkdirpSync(path); 
      console.log(colors.yellow(`Created directory on path: ${path}`));
    }
  } catch (err) {
    console.error(colors.red(`Cannot create directory on path: ${path}. Error: ${err.message}`));
    process.exit(1); 
  }
};
 
const getFileTree = async (path, env) => {
  const url = `${env.DEPLOYMENT_URL_SHORT}${path}&teamId=${env.TEAM_ID}`;

  console.log("Fetching file tree from URL: " + url);
  const { data } = await axios.get(url, {
    headers: {
      Authorization: env.AUTHORIZATION_TOKEN
    }
  });
 
  return data;
};
 
const parseCurrent = async (node, currentPath, env) => {
  const nodePath = join(currentPath, node.name);  
  if (node.type === 'directory') {
      generateDirectory(join(env.OUTPUT_DIRECTORY, nodePath));  
  
      const childNode = await getFileTree(nodePath.replace(/\\/g, '/'), env);
      console.log("Processing directory: ", nodePath);
      childNode.forEach(element => {
        console.log(" - ",element.name);
      });
  
      await parseStructure(childNode, nodePath, env);

  } else if (node.type === 'file') {  
      await downloadFile(node,   currentPath, env); 
  }
};

export const parseStructure = async (folderStructure, currentPath, env) => {
  if (folderStructure) {
    for (const structure of folderStructure) {
      await parseCurrent(structure, currentPath, env); 
    }
  }
};
 
export const startDownload = async (initialPath, env) => {
  const fileTree = await getFileTree(initialPath, env);  
  await parseStructure(fileTree, initialPath, env);   
};