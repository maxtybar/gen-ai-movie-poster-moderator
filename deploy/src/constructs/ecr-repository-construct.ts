import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import path = require('path');

export interface ECRRepositoryProps extends cdk.StackProps {}
const defaultProps: Partial<ECRRepositoryProps> = {};

export class ECRRepositoryConstruct extends Construct {
  public ecrRepository: cdk.aws_ecr.Repository;

  constructor(scope: Construct, name: string, props: ECRRepositoryProps) {
    super(scope, name);

    props = { ...defaultProps, ...props };

    this.ecrRepository = new cdk.aws_ecr.Repository(this, 'ECRRepository', {
      repositoryName: 'gen-ai-movie-poster-repository',
      imageScanOnPush: true,
      emptyOnDelete: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });
  }
}