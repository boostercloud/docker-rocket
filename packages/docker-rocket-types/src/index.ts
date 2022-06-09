export interface DockerRocketParams {
  rocketProviderPackage: string
  params: ContainerDefinition[]
}

export interface ContainerDefinition {
  serviceName: string,
  image: string,
  publicService: boolean,
  numberOfInstances: number,
  cpu?: number
  memory?: number,
  env?: {[key: string]: string},
}
