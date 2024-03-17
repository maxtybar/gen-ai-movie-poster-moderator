import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import path = require("path");

export interface ECSFargateProps extends cdk.StackProps {}

const defaultProps: Partial<ECSFargateProps> = {};

export class ECSFargateConstruct extends Construct {

  public loadBalancedFargateService: cdk.aws_ecs_patterns.ApplicationLoadBalancedFargateService;

  constructor(scope: Construct, name: string, props: ECSFargateProps) {
    super(scope, name);

    props = { ...defaultProps, ...props };

    const cluster: cdk.aws_ecs.Cluster = new cdk.aws_ecs.Cluster(this, 'Cluster', {
        clusterName: 'fargate-cluster',
        containerInsights: true,
    });

    const image = cdk.aws_ecs.ContainerImage.fromRegistry('amazon/amazon-ecs-sample');

    const executionRole = new cdk.aws_iam.Role(this, 'ECSExecutionRole', {
        assumedBy: new cdk.aws_iam.ServicePrincipal('ecs-tasks.amazonaws.com'),
        inlinePolicies: {
            'ecs-task-execution-policy': new cdk.aws_iam.PolicyDocument({
                statements: [
                    new cdk.aws_iam.PolicyStatement({
                        actions: [
                          'ecr:GetAuthorizationToken', 
                          'ecr:BatchCheckLayerAvailability', 
                          'ecr:GetDownloadUrlForLayer', 
                          'ecr:BatchGetImage', 
                          'logs:CreateLogStream', 
                          'logs:PutLogEvents',
                        ],
                        resources: ['*'],
                    }),
                ],
            }),
        },
    });

    const taskRole = new cdk.aws_iam.Role(this, 'ECSTaskRole', {
      assumedBy: new cdk.aws_iam.ServicePrincipal('ecs-tasks.amazonaws.com'),
      inlinePolicies: {
          'ecs-task-policy': new cdk.aws_iam.PolicyDocument({
              statements: [
                  new cdk.aws_iam.PolicyStatement({
                      actions: ['bedrock:InvokeModel'],
                      resources: ['*'],
                  }),
              ],
          }),
      },
  });

    this.loadBalancedFargateService = new cdk.aws_ecs_patterns.ApplicationLoadBalancedFargateService(this, 'Service', {
        cluster: cluster,
        circuitBreaker: { rollback: true },
        memoryLimitMiB: 1024,
        desiredCount: 1,
        cpu: 512,
        taskImageOptions: {
            containerName: 'gen-ai-movie-poster-image',
            executionRole: executionRole,
            taskRole: taskRole,
            image: image,
            containerPort: 80,
            logDriver: cdk.aws_ecs.LogDrivers.awsLogs({ 
              streamPrefix: 'gen-ai-movie-poster-build',
              logRetention: cdk.aws_logs.RetentionDays.ONE_WEEK,
          }),
        },
        loadBalancerName: 'gen-ai-movie-poster-lb',
    });

  }
}