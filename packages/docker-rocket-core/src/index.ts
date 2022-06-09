import { BoosterConfig, RocketDescriptor } from '@boostercloud/framework-types'
import { DockerRocketParams} from '@boostercloud/docker-rocket-types'

export class BoosterDockerRocket {
  public constructor(readonly config: BoosterConfig, readonly params: DockerRocketParams) {
    config.registerRocketFunction("test", async (config: BoosterConfig, request: unknown) => {
      console.log('this is working!!!')
      return null
    })
  }

  public rocketForAws(): RocketDescriptor {
    console.log('calling the descriptor')
    return {
      packageName: '@boostercloud/docker-rocket-provider-aws-infrastructure',
      parameters: this.params,
    }
  }
}
