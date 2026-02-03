#!/usr/bin/env node

import axios from 'axios';
import colors from 'colors';
import mkdirp from 'mkdirp';

import {
  promptForAuthorizationToken,
  promptForOutputDirectory,
  promptForProjectName,
  promptForProjectUrl,
  promptForTeam,
} from './prompts';
import {
  appendTeamId,
  getAuthToken,
  startDownload,
} from './utils';

const getTeamId = async(token) => {
  try {
    const { data: { teams = [] } } = await axios.get('https://vercel.com/api/v2/teams', {
      headers: {
        Authorization: token
      }
    });
    return await promptForTeam([{name: 'Personal project (NO TEAM)', id: false}, ...teams]);
  } catch (err) {
    console.log(colors.red('Cannot download teams list. Please check your authorization token !'));
    process.exit(0);
  }
};

const getDeployment = async (env) => {
  try {
    var teamIdAppended = appendTeamId(`https://vercel.com/api/v6/deployments`, env.TEAM_ID);

    const { data: { deployments = [] } } = await axios.get(`${teamIdAppended}&limit=100`, {
      headers: {
        Authorization: env.AUTHORIZATION_TOKEN
      }
    });

    if (!deployments.length > 0) {
      console.log(colors.red('No deployments found for your choices. Exiting...'));
      process.exit();
    }

    const projectName = await promptForProjectName([...new Set(deployments.map(project => project.name))]);
    console.log(`Getting list of deployments for ${projectName}`);

    return await promptForProjectUrl(deployments.filter(deployment => deployment.name === projectName));
  } catch (err) {
    console.log(colors.red('Cannot get deployment UID. Please raise an issue here: https://github.com/CalinaCristian/source-from-vercel-deployment/issues !'));
    process.exit(0);
  }
};

(async () => {
  let env = {
    DEPLOYMENT_URL: '',
    DEPLOYMENT_FILE_URL: '',
    AUTHORIZATION_TOKEN: '',
    OUTPUT_DIRECTORY: './deployment_source',
    TEAM_ID: false
  };

  
  env.AUTHORIZATION_TOKEN = getAuthToken(process.env.VERCEL_AUTH_TOKEN ?? (await promptForAuthorizationToken()));

  console.log(colors.yellow('Getting list of teams...'));
  env.TEAM_ID = await getTeamId(env.AUTHORIZATION_TOKEN);

  console.log(colors.yellow('Getting list of deployments...This might take a while...'));
   const { deploymentUid, deploymentUrl } = await getDeployment(env);
 
  env.deploymentUid = deploymentUid  
  env.DEPLOYMENT_URL_SHORT = `https://vercel.com/api/file-tree/${deploymentUrl}?base=`;
  env.DEPLOYMENT_URL = `https://vercel.com/api/file-tree/${deploymentUrl}?base=src`; 
  
  env.OUTPUT_DIRECTORY = await promptForOutputDirectory() || env.OUTPUT_DIRECTORY;
 

  console.log(colors.yellow('Starting the process of recreating the structure...'));
  const getDeploymentStructureURL = appendTeamId(env.DEPLOYMENT_URL, env.TEAM_ID, '&'); 

  try {
    const { data } = await axios.get(getDeploymentStructureURL, {
      headers: {
        Authorization: env.AUTHORIZATION_TOKEN
      }
    });
    console.log(data);
    mkdirp(env.OUTPUT_DIRECTORY);

   await startDownload("src", env, env.OUTPUT_DIRECTORY);

  } catch (err) {
    console.log(err.message);
    console.log(colors.red('Cannot recreate the file tree. Please raise an issue here: https://github.com/CalinaCristian/source-from-vercel-deployment/issues !'));
    process.exit(0);
  }
})();