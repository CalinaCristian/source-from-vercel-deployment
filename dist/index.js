#!/usr/bin/env node
"use strict";

var _axios = _interopRequireDefault(require("axios"));

var _colors = _interopRequireDefault(require("colors"));

var _mkdirp = _interopRequireDefault(require("mkdirp"));

var _prompts = require("./prompts");

var _utils = require("./utils");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const getTeamId = async token => {
  try {
    const {
      data: {
        teams = []
      }
    } = await _axios.default.get('https://vercel.com/api/v2/teams', {
      headers: {
        Authorization: token
      }
    });
    return await (0, _prompts.promptForTeam)([{
      name: 'Personal project (NO TEAM)',
      id: false
    }, ...teams]);
  } catch (err) {
    console.log(_colors.default.red('Cannot download teams list. Please check your authorization token !'));
    process.exit(0);
  }
};

const getDeployment = async env => {
  try {
    var teamIdAppended = (0, _utils.appendTeamId)(`https://vercel.com/api/v6/deployments`, env.TEAM_ID);
    const {
      data: {
        deployments = []
      }
    } = await _axios.default.get(`${teamIdAppended}&limit=100`, {
      headers: {
        Authorization: env.AUTHORIZATION_TOKEN
      }
    });

    if (!deployments.length > 0) {
      console.log(_colors.default.red('No deployments found for your choices. Exiting...'));
      process.exit();
    }

    const projectName = await (0, _prompts.promptForProjectName)([...new Set(deployments.map(project => project.name))]);
    console.log(`Getting list of deployments for ${projectName}`);
    return await (0, _prompts.promptForProjectUrl)(deployments.filter(deployment => deployment.name === projectName));
  } catch (err) {
    console.log(_colors.default.red('Cannot get deployment UID. Please raise an issue here: https://github.com/CalinaCristian/source-from-vercel-deployment/issues !'));
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
  env.AUTHORIZATION_TOKEN = (0, _utils.getAuthToken)(process.env.VERCEL_AUTH_TOKEN ?? (await (0, _prompts.promptForAuthorizationToken)()));
  console.log(_colors.default.yellow('Getting list of teams...'));
  env.TEAM_ID = await getTeamId(env.AUTHORIZATION_TOKEN);
  console.log(_colors.default.yellow('Getting list of deployments...This might take a while...'));
  const {
    deploymentUid,
    deploymentUrl
  } = await getDeployment(env);
  env.deploymentUid = deploymentUid;
  env.DEPLOYMENT_URL_SHORT = `https://vercel.com/api/file-tree/${deploymentUrl}?base=`;
  env.DEPLOYMENT_URL = `https://vercel.com/api/file-tree/${deploymentUrl}?base=src`;
  env.OUTPUT_DIRECTORY = (await (0, _prompts.promptForOutputDirectory)()) || env.OUTPUT_DIRECTORY;
  console.log(_colors.default.yellow('Starting the process of recreating the structure...'));
  const getDeploymentStructureURL = (0, _utils.appendTeamId)(env.DEPLOYMENT_URL, env.TEAM_ID, '&');

  try {
    const {
      data
    } = await _axios.default.get(getDeploymentStructureURL, {
      headers: {
        Authorization: env.AUTHORIZATION_TOKEN
      }
    });
    console.log(data);
    (0, _mkdirp.default)(env.OUTPUT_DIRECTORY);
    await (0, _utils.startDownload)("src", env, env.OUTPUT_DIRECTORY);
  } catch (err) {
    console.log(err.message);
    console.log(_colors.default.red('Cannot recreate the file tree. Please raise an issue here: https://github.com/CalinaCristian/source-from-vercel-deployment/issues !'));
    process.exit(0);
  }
})();