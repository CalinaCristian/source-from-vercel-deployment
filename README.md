# Download source from Vercel deployment
You can find the package on [npm](https://www.npmjs.com/package/source-from-vercel-deployment)

### Description

A simple package made for downloading the source code from your Vercel Deployment.

If you can't find your code anywhere but you have it deployed on Vercel,
this package is for you.

You can easily download your code from any deployment that you've had on the project.

### Installation


To install it (not required if you use npx), simply run
```
    npm install -g source-from-vercel-deployment
```

### How to run the command

After installing it globally, you can just type in CLI:
```
    source-from-vercel-deployment
```

Or you can run it without installing using npx
```
    npx source-from-vercel-deployment
```

You will then be prompted for the bellow mentioned values.

### Usage

To run and download you're source code, you will be prompted for the following:

* __AUTHORIZATION_TOKEN__:
  * Description: It's in this format - '__Bearer _authorization-token___'
  * How to find it:
    * You can check the network tab when you're logged in on vercel and get the authorization token from there
    * You can paste it in any format ("Bearer token" or "bearer token" or "token").
* __Choose Team__:
  * The team that you're project is on (or your personal account)
  * You can choose Personal project or select from the list of all teams that you are a part of.
* __Choose Project Name__:
  * The project that contains the deployment that you whish to download the source for.
  * You can choose from all the projects from the selected team (or personal account)
* __Choose Deployment__:
  * The deployment inside of the project that you whish to download the source for.
  * You can choose from all the deployments for the chosen project
* __Choose OUTPUT_DIRECTORY__:
  * Where you want your deployment source to be placed
  * __Default value__: './deployment_source'


### Notes

Don't overuse this package. Use it only if you really need it. It's calling the endpoint for every file to download it might take a while and it will do many requests to the api.

If you get the error ```429``` with message ```TOO MANY REQUESTS```, it might mean that you've overused the package and made too many request. You have to wait a while until they reset.
( [more info here](https://vercel.com/docs/platform/limits#deployments-per-day-(free)) )