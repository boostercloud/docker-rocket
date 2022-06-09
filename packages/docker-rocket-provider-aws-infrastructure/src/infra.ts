import { BoosterConfig} from '@boostercloud/framework-types'
import { Stack } from '@aws-cdk/core'
import * as ec2 from "@aws-cdk/aws-ec2";
import * as ecs from "@aws-cdk/aws-ecs";
import * as ecs_patterns from "@aws-cdk/aws-ecs-patterns";
import { ContainerDefinition, DockerRocketParams } from 'docker-rocket-types/dist';
import { Table } from '@aws-cdk/aws-dynamodb'
import { AnyPrincipal, Effect, PolicyStatement } from '@aws-cdk/aws-iam';
import { GatewayVpcEndpointAwsService } from '@aws-cdk/aws-ec2';

export class Infra {
  public static mountStack(params: DockerRocketParams, stack: Stack, config: BoosterConfig): void {

    const { cluster, dynamoGatewayEndpoint } = Infra.initECSCluster(stack, config);

    const eventsStore = stack.node.tryFindChild('events-store') as Table
    
    params.params.map(containerDefinition => {
      const fargate = Infra.createFargateService(containerDefinition, eventsStore, stack, cluster);
      Infra.grantDynamoPermissions(dynamoGatewayEndpoint, eventsStore, fargate);
    })
  }

  private static initECSCluster(stack: Stack, config: BoosterConfig) {
    const vpc = new ec2.Vpc(stack, `${config.appName}-vpc`, {
      maxAzs: 3
    });

    const dynamoGatewayEndpoint = vpc.addGatewayEndpoint('dynamoGatewayEndpoint', {
      service: GatewayVpcEndpointAwsService.DYNAMODB
    });

    const cluster = new ecs.Cluster(stack, `${config.appName}-cluster`, {
      vpc: vpc
    });
    return { cluster, dynamoGatewayEndpoint };
  }

  private static createFargateService(containerDefinition: ContainerDefinition, eventsStore: Table, stack: Stack, cluster: ecs.Cluster) {
    const logging = new ecs.AwsLogDriver({
      streamPrefix: containerDefinition.serviceName,
    });

    var environmentVars: { [key: string]: string; } = {};
    if (containerDefinition.env) {
      environmentVars = containerDefinition.env;
    }
    environmentVars['eventStoreTable'] = eventsStore.tableName;

    const fargate = new ecs_patterns.ApplicationLoadBalancedFargateService(stack, containerDefinition.serviceName, {
      cluster: cluster,
      cpu: containerDefinition.cpu || 256,
      memoryLimitMiB: containerDefinition.memory || 512,
      desiredCount: containerDefinition.numberOfInstances,
      publicLoadBalancer: containerDefinition.publicService,
      taskImageOptions: {
        image: ecs.ContainerImage.fromRegistry(containerDefinition.image),
        environment: environmentVars,
        enableLogging: true,
        logDriver: logging,
      },
    });
    return fargate;
  }

  private static grantDynamoPermissions(dynamoGatewayEndpoint: ec2.GatewayVpcEndpoint, eventsStore: Table, fargate: ecs_patterns.ApplicationLoadBalancedFargateService) {
    dynamoGatewayEndpoint.addToPolicy(
      new PolicyStatement({
        effect: Effect.ALLOW,
        principals: [new AnyPrincipal()],
        actions: [
          'dynamodb:PutItem',
        ],
        resources: [
          `${eventsStore.tableArn}`
        ],
        conditions: {
          'ArnEquals': {
            'aws:PrincipalArn': `${fargate.taskDefinition.taskRole.roleArn}`
          }
        }
      })
    );

    eventsStore.grantWriteData(fargate.taskDefinition.taskRole);
  }
}
