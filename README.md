# Booster Docker Rocket

## Introduction
Docker is a very flexible and well known technology that allows any developer to encapsulate their applications into images that can be replicated anywhere inside a container. The main advantage of Docker is that it adds a layer of abstraction around applications transforming them into black boxes that can have inputs and outputs. 

On the other hand, Booster Framework provides an opinionated solution for implementing Event Sourcing applications in a very simple way, allowing the user to be focused on business logic without even thinking about the infrastructure. 

The Booster Docker Rocket opens the door to integrate the deployment of any Docker image within a Booster project.

## What’s the Booster Docker Rocket
The rocket allows the user to deploy Docker images into the cloud and it also enables the interaction between the running Docker application and your Booster application.

From your Booster application you have to provide the configuration for all the images that you want to deploy within your Booster application. In terms of the Docker images you have total freedom to use in any language or technology compatible with Docker. 

After the Booster application deployment your Docker containers will have permission to write into the Booster event store, so you will be able to generate raw events into the event store or interact with your Booster application using the graphQL api.

## How to use the Booster Docker Rocket
Firstly you need to have configure your Docker containers inside your `config.ts` adding the following:

``` typescript
const params =[
    {
      serviceName: 'yourServiceName',
      image: 'yourDockerRepo/yourImage',
      publicService: true,
      numberOfInstances: 1,
      cpu: 256,
      memory: 512,
      env: {
        'YOUR_ENV_VAR1': 'var_value',
        ...
      }
    }
  ] as ContainerDefinition[]


Booster.configure('production', (config: BoosterConfig): void => {
  config.appName = 'yourAppName'
  config.providerPackage = '@boostercloud/framework-provider-aws'
  config.rockets = [
    new BoosterDockerRocket(config, {
      rocketProviderPackage: '@boostercloud/docker-rocket-provider-aws-infrastructure',
      params: params,
  }).rocketForAws(),
  ]
})
```

You have to provide a `ContainerConfiguration` array to the rocket including:

* `serviceName`: the name of your service
* `image`: the name of your image stored in a public repo like [DockerHub](https://hub.docker.com/)
* `numberOfInstances`: number of running instances for your service
* `cpu`: cpu of your instances (default 256)
* `memory`: memory of your instances (default 256)
* `env` :  a string key/value including all your environment variables to be passed to your container

After deploying your Booster application you will obtain also all your Docker images running as containers on your cloud provider (currently only supported in AWS).

In your Docker container you will have access to an additional env variables injected during the deployment:

* `eventStoreTable`: This is the name of your event store,  and you should use it if you want to emit raw events from within your Docker containers. 



