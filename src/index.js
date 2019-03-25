#!/usr/bin/env node

import axios from 'axios';
import colors from 'colors';
import {
  promptForAuthorizationToken,
  promptForProjectUrl,
  promptForProjectName,
  promptForTeam,
  promptForOutputDirectory
} from './prompts';
import {
  appendTeamId,
  getAuthToken,
  parseStructure
} from './utils';

const getTeamId = async(token) => {
  try {
    const { data: { teams = [] } } = await axios.get('https://api.zeit.co/v1/teams', {
      headers: {
        Authorization: token
      }
    });
    return await promptForTeam([{name: 'Personal project (NO TEAM)', id: false}, ...teams]);
  } catch (err) {
    console.log(console.log(colors.red('Cannot download teams list. Please check your authorization token !')));
    process.exit(0);
  }
};

const getUidFromName = async (env) => {
  try {
    const { data: { deployments = [] } } = await axios.get(appendTeamId(`https://api.zeit.co/v3/now/deployments`, env.TEAM_ID), {
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
    console.log(err);
  }
};

(async () => {
  let env = {
    DEPLOYMENT_URL: '',
    AUTHORIZATION_TOKEN: '',
    OUTPUT_DIRECTORY: './deployment_source',
    TEAM_ID: false
  };
  env.AUTHORIZATION_TOKEN = getAuthToken(await promptForAuthorizationToken());

  console.log(colors.yellow('Getting list of teams...'));
  env.TEAM_ID = await getTeamId(env.AUTHORIZATION_TOKEN);

  console.log(colors.yellow('Getting list of deployments...This might take a while...'));
  env.DEPLOYMENT_URL = `https://api.zeit.co/v5/now/deployments/${await getUidFromName(env)}/files`;

  env.OUTPUT_DIRECTORY = await promptForOutputDirectory() || env.OUTPUT_DIRECTORY;

  console.log(colors.yellow('Starting the process of recreating the structure...'));
  const getDeploymentStructureURL = appendTeamId(env.DEPLOYMENT_URL, env.TEAM_ID);

  try {
    const { data } = await axios.get(getDeploymentStructureURL, {
      headers: {
        Authorization: env.AUTHORIZATION_TOKEN
      }
    });

    parseStructure(data, env.OUTPUT_DIRECTORY, env);
  } catch (err) {
    console.log(err);
  }
})();