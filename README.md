# Download source from Zeit deployment

### Description

A simple package made for downloading the source code from your Zeit Deployment.

If you can't find your code anywhere but you have it deployed on Zeit,
this package is for you.

You can easily download your code from any deployment that you've had on the project.

### Installation

You can find the package on [npm](https://www.npmjs.com/package/source-from-zeit-deployment)

To install it, simply run
```
    npm install -g source-from-zeit-deployment
```

### Usage

To run and download you're source code, you need to pass the following (in process.env):

* __DEPLOYMENT_ID__:
  * Description: Where you want your deployment source to be placed
  * How to set it:
    * GET /v3/now/deployments with authorization token set. [docs here](https://zeit.co/docs/api#endpoints/deployments/list-deployments)
    * Search in the resutls for the name that matches the deployment hash and get the uid.
* __TEAM_ID__:
  * Description: It's in the format: __'team\_<id-for-team>'__
  * How to set it: 
    * You can check the network tab when you're on your team's project and get the teamid from a request made.
* __AUTHORIZATION_TOKEN__:
  * Description: It's in this format: __Bearer <authorization-token>__
  * How to set it:
    * You can check the network tab when you're on your team's project and get the teamid from a request made.
* __OUTPUT_DIRECTORY__:
  * Default value: './deployment_source'
  * Description: Where you want your deployment source to be placed

### How to run the command

```
    DEPLOYMENT_ID=id-goes-here TEAM_ID=id-goes-here AUTHORIZATION_TOKEN="Bearer token-goes-here" OUTPUT_DIRECTORY='./downloaded' source-from-zeit-deployment
```

### Notes

Don't overuse this package.  
Use it only if you really need it.  
It's calling the endpoint for every file to download it might take a while and it will do many requests to the api.
