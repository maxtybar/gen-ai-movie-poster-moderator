import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import path = require('path');
import { ECSFargateConstruct } from './constructs/ecs-fargate-construct';
import { ECRRepositoryConstruct } from './constructs/ecr-repository-construct';
import { CodePipelineConstruct } from './constructs/code-pipeline-construct';

export interface AppProps extends cdk.StackProps {}
const defaultProps: Partial<AppProps> = {};

export class AppStack extends cdk.Stack {

  constructor(scope: Construct, name: string, props: AppProps) {
    super(scope, name);

    const ecrRepo = new ECRRepositoryConstruct(this, 'ECRRepository', {});
    const fargateConstruct = new ECSFargateConstruct(this, 'fargateConstruct', {});
    new CodePipelineConstruct(this, 'codePipelineConstruct', {
      fargateService: fargateConstruct.loadBalancedFargateService.service,
      ecrRepository: ecrRepo.ecrRepository,
    });
  }
}