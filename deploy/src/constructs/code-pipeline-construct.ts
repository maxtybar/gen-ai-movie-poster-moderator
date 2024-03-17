import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import path = require('path');

export interface CodePipelineProps extends cdk.StackProps {
    readonly fargateService: cdk.aws_ecs.FargateService;
    readonly ecrRepository: cdk.aws_ecr.Repository;
}
const defaultProps: Partial<CodePipelineProps> = {};

export class CodePipelineConstruct extends Construct {

  constructor(scope: Construct, name: string, props: CodePipelineProps) {
    super(scope, name);

    props = { ...defaultProps, ...props };

    const awsRegion = cdk.Stack.of(this).region;

    // Create a new CodeCommit repository
    const repo = new cdk.aws_codecommit.Repository(this, 'CodeCommitRepository', {
        repositoryName: 'GenAIMoviePosterRepository',
        description: 'Gen AI Demo Repository.', 
        code: cdk.aws_codecommit.Code.fromDirectory(path.join(__dirname, '../../../gradio-app'), 'main'),
      });

    // Create a new CodeBuild project
    const project = new cdk.aws_codebuild.PipelineProject(this, 'CodeBuildProject', {
      projectName: 'GenAIMoviePosterCodeBuildProject',
      environment: {
        buildImage: cdk.aws_codebuild.LinuxBuildImage.AMAZON_LINUX_2_5,
        privileged: true,
        environmentVariables: {
          GRADIO_USERNAME: {
            value: this.node.tryGetContext("gradioUsername")
          }, 
          GRADIO_PASSWORD: {
            value: this.node.tryGetContext("gradioPassword")
          },
        }
      },
      description: 'Builds a Docker Image from the CodeCommit Repostiory.',
      buildSpec: cdk.aws_codebuild.BuildSpec.fromObject({
        version: '0.2',
        phases: {
          pre_build: {
            commands: [
              'echo Logging in to Amazon ECR...',
              'aws --version',
              'aws ecr get-login-password --region ' + awsRegion + ' | docker login --username AWS --password-stdin ' + props.ecrRepository.repositoryUri,
            ],
          },
          build: {
            commands: [
              'echo Build started on `date`',
              'echo Building the Docker image...',
              'docker build --build-arg GRADIO_USERNAME=$GRADIO_USERNAME --build-arg GRADIO_PASSWORD=$GRADIO_PASSWORD -t ' + props.ecrRepository.repositoryUri + ':latest .',
              'docker tag ' + props.ecrRepository.repositoryUri + ':latest ' + props.ecrRepository.repositoryUri + ':latest',
            ],
          },
          post_build: {
            commands: [
              'echo Build completed on `date`',
              'echo Pushing the Docker image...',
              'docker push ' + props.ecrRepository.repositoryUri + ':latest',
              'echo Writing image details to imagedefinitions.json...',
              'printf \'[{"name":"gen-ai-movie-poster-image","imageUri":"%s"}]\' ' + props.ecrRepository.repositoryUri + ':latest > imagedefinitions.json',
            ],
          },
        },
        artifacts: {
          files: ['imagedefinitions.json'],
        },
      }),
    });

    // Grant the CodeBuild project permissions to interact with the ECR repository
    props.ecrRepository.grantPullPush(project.role!);

    // Create a new CodePipeline
    const pipeline = new cdk.aws_codepipeline.Pipeline(this, 'CodePipeline', {
      pipelineName: 'GenAIMoviePosterPipeline',
      artifactBucket: new cdk.aws_s3.Bucket(this, 'ArtifactBucket', {
        removalPolicy: cdk.RemovalPolicy.DESTROY,
        autoDeleteObjects: true,
      }),
    });

    const sourceOutput = new cdk.aws_codepipeline.Artifact();
    const buildOutput = new cdk.aws_codepipeline.Artifact();

    // Add the source stage to the pipeline
    pipeline.addStage({
      stageName: 'Source',
      actions: [
        new cdk.aws_codepipeline_actions.CodeCommitSourceAction({
          actionName: 'CodeCommit',
          repository: repo,
          output: sourceOutput,
        }),
      ],
    });

    // Add the build stage to the pipeline
    pipeline.addStage({
      stageName: 'Build',
      actions: [
        new cdk.aws_codepipeline_actions.CodeBuildAction({
          actionName: 'CodeBuild',
          project,
          input: sourceOutput,
          outputs:[buildOutput],
        }),
      ],
    });

    // Add the deploy stage to the pipeline
    pipeline.addStage({
      stageName: 'Deploy',
      actions: [
        new cdk.aws_codepipeline_actions.EcsDeployAction({
          actionName: 'CodeDeploy',
          service: props.fargateService,
          input: buildOutput,
        }),
      ],
    });
  }
}