"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.promptForOutputDirectory = exports.promptForProjectUrl = exports.promptForProjectName = exports.promptForTeam = exports.promptForAuthorizationToken = void 0;

var _inquirer = _interopRequireDefault(require("inquirer"));

var _colors = _interopRequireDefault(require("colors"));

var _fuzzy = _interopRequireDefault(require("fuzzy"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_inquirer.default.registerPrompt('autocomplete', require('inquirer-autocomplete-prompt'));

const promptForAuthorizationToken = async () => {
  const {
    AUTHORIZATION_TOKEN
  } = await _inquirer.default.prompt([{
    type: 'input',
    name: 'AUTHORIZATION_TOKEN',
    message: _colors.default.magenta('Authorization token (can be \'Bearer token\' or \'bearer token\' or \'token\')')
  }]);
  return AUTHORIZATION_TOKEN;
};

exports.promptForAuthorizationToken = promptForAuthorizationToken;

const promptForTeam = async teams => {
  const {
    TEAM_ID
  } = await _inquirer.default.prompt([{
    type: 'autocomplete',
    name: 'TEAM_ID',
    message: 'Choose the team that your project is in (or Personal Project if it\'s not in a team)',
    source: (answersSoFar, input) => {
      return new Promise(resolve => {
        const fuzzyResult = _fuzzy.default.filter(input || '', teams.map(project => project.name));

        resolve(fuzzyResult.map(result => ({
          name: _colors.default.cyan(result.original),
          value: teams[teams.findIndex(project => project.name === result.original)].id
        })));
      });
    },
    pageSize: 10
  }]);
  return TEAM_ID;
};

exports.promptForTeam = promptForTeam;

const promptForProjectName = async projectNames => {
  const {
    DEPLOYMENT_NAME
  } = await _inquirer.default.prompt([{
    type: 'autocomplete',
    name: 'DEPLOYMENT_NAME',
    message: 'Choose the project name that you wish to download from',
    source: (answersSoFar, input) => {
      return new Promise(resolve => {
        const fuzzyResult = _fuzzy.default.filter(input || '', projectNames);

        resolve(fuzzyResult.map(result => ({
          name: _colors.default.cyan(result.original),
          value: result.original
        })));
      });
    },
    pageSize: 10
  }]);
  return DEPLOYMENT_NAME;
};

exports.promptForProjectName = promptForProjectName;

const promptForProjectUrl = async projects => {
  const {
    PROJECT_URL
  } = await _inquirer.default.prompt([{
    type: 'autocomplete',
    name: 'PROJECT_URL',
    message: 'Choose the project name that you wish to download from',
    source: (answersSoFar, input) => {
      return new Promise(resolve => {
        const fuzzyResult = _fuzzy.default.filter(input || '', projects.map(project => project.url));

        resolve(fuzzyResult.map(result => ({
          name: _colors.default.cyan(result.original),
          value: projects[projects.findIndex(project => project.url === result.original)].uid
        })));
      });
    },
    pageSize: 10
  }]);
  return PROJECT_URL;
};

exports.promptForProjectUrl = promptForProjectUrl;

const promptForOutputDirectory = async () => {
  const {
    OUTPUT_DIRECTORY
  } = await _inquirer.default.prompt([{
    type: 'input',
    name: 'OUTPUT_DIRECTORY',
    message: _colors.default.magenta('Where do you want the source to be placed? (Default: ./deployment_source)')
  }]);
  return OUTPUT_DIRECTORY;
};

exports.promptForOutputDirectory = promptForOutputDirectory;