import { InfrastructureRocket } from '@boostercloud/framework-provider-aws-infrastructure'
import { DockerRocketParams } from '@boostercloud/docker-rocket-types'
import { Infra } from './infra'

const AwsDockerRocket = (params: DockerRocketParams): InfrastructureRocket => ({
  mountStack: Infra.mountStack.bind(Infra, params),
})

export default AwsDockerRocket
