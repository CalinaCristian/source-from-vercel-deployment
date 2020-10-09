# Download source from Zeit deployment
You can find the package on [npm](https://www.npmjs.com/package/source-from-zeit-deployment)

### Description

A simple package made for downloading the source code from your Zeit Deployment.

If you can't find your code anywhere but you have it deployed on Zeit,
this package is for you.

You can easily download your code from any deployment that you've had on the project.

### Installation


To install it (not required if you use npx), simply run
```
    npm install -g source-from-zeit-deployment
```

### How to run the command

After installing it globally, you can just type in CLI:
```
    source-from-zeit-deployment
```

Or you can run it without installing using npx
```
    npx source-from-zeit-deployment
```

You will then be prompted for the above mentioned values.

### Usage

To run and download you're source code, you will be prompted for the following:

* __AUTHORIZATION_TOKEN__:
  * Description: It's in this format - '__Bearer _authorization-token___'
  * How to find it:
    * You can check the network tab when you're logged in on zeit and get the authorization token from there
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
