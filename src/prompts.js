import colors from 'colors';
import fuzzy from 'fuzzy';
import inquirer from 'inquirer';

inquirer.registerPrompt('autocomplete', require('inquirer-autocomplete-prompt'));

export const promptForAuthorizationToken = async() => {
  const { AUTHORIZATION_TOKEN } = await inquirer.prompt([
    {
      type: 'input',
      name: 'AUTHORIZATION_TOKEN',
      message: colors.magenta('Authorization token (Generate one here https://vercel.com/account/tokens and save it to env variable VERCEL_AUTH_TOKEN to not be asked anymore or paste it here)'),
    }
  ]);

  return AUTHORIZATION_TOKEN;
};

export const promptForTeam = async(teams) => {
  const { TEAM_ID } = await inquirer.prompt([{
    type: 'autocomplete',
    name: 'TEAM_ID',
    message: 'Choose the team that your project is in (or Personal Project if it\'s not in a team)',
    source: (_, input) => {
      return new Promise((resolve) => {
        const fuzzyResult = fuzzy.filter(input || '', teams.map(project => project.name));
        resolve(
          fuzzyResult.map(result => ({
            name: colors.cyan(result.original),
            value: teams[teams.findIndex(project => project.name === result.original)].id
          }))
        );
      });
    },
    pageSize: 10
  }]);

  return TEAM_ID;
};

export const promptForProjectName = async(projectNames) => {
  const { DEPLOYMENT_NAME } = await inquirer.prompt([{
    type: 'autocomplete',
    name: 'DEPLOYMENT_NAME',
    message: 'Choose the project name that you wish to download from',
    source: (_, input) => {
      return new Promise((resolve) => {
        const fuzzyResult = fuzzy.filter(input || '', projectNames);
        resolve(
          fuzzyResult.map(result => ({
            name: colors.cyan(result.original),
            value: result.original
          }))
        );
      });
    },
    pageSize: 10
  }]);

  return DEPLOYMENT_NAME;
};
export const promptForProjectUrl = async (projects) => {
  const { PROJECT_URL } = await inquirer.prompt([{
    type: 'autocomplete',
    name: 'PROJECT_URL',
    message: 'Choose the deployment that you wish to download from (first is the latest)',
    source: (_, input) => {
      return new Promise((resolve) => {
        const fuzzyResult = fuzzy.filter(input || '', projects.map(project => project.url));
        resolve(
          fuzzyResult.map(result => {
            const projectIndex = projects.findIndex(project => project.url === result.original);
            const project = projects[projectIndex];
            const date = project.created || project.createdAt;  // use `created` or `createdAt`
            
            const formattedDate = new Date(date).toLocaleDateString() + ' ' + new Date(date).toLocaleTimeString();
            

            return {
              name: colors.cyan(`${formattedDate} - ${result.original} uid: ${project.uid}`),  // display "date - url"
              value: {
                deploymentUid: project.uid,
                deploymentUrl: project.url,
              }
            };
          })
        );
      });
    },
    pageSize: 10
  }]);

  return PROJECT_URL;
};

export const promptForOutputDirectory = async() => {
  const { OUTPUT_DIRECTORY } = await inquirer.prompt([
    {
      type: 'input',
      name: 'OUTPUT_DIRECTORY',
      message: colors.magenta('Where do you want the source to be placed? (Default: ./deployment_source)')
    }
  ]);

  return OUTPUT_DIRECTORY;
}