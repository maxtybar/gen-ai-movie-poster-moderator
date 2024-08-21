> [!CAUTION]
> Due to AWS sunsetting the AWS CodeCommit service this solution will fail to be deployed. CodeCommit can be substituted by an Amazon S3 bucket. This solution is currently being reworked and will be updated soon.

# Gen AI Movie Poster Moderator
Flag poster that are not in semantic compliance with custom policies using Gen AI.

Media companies want to review movie posters for specific markets for compliance before they publish them. For example, in China movie posters should not show bones. These moderation requirements need to be customizable and should not require additional training. Gen AI Movie Poster Moderator takes a movie poster and evaluates it for customizable and nuanced conditions. It can detect nuances like sharks vs sharks eating humans.  If a condition fails it flags the poster and provides the reason why it failed.

![Gradio Workflow](https://github.com/maxtybar/gen-ai-movie-poster-moderator/assets/61300968/ac22a11a-fe07-401f-b20f-e43ea657a154)

## Services and technologies used

* [AWS CodePipeline](https://aws.amazon.com/codepipeline/) - CI/CD Pipeline
* [AWS CodeCommit](https://aws.amazon.com/codecommit/) - Code Repository
* [AWS CodeBuild](https://aws.amazon.com/codebuild/) - Continuous Integration Service
* [AWS CodeDeploy](https://aws.amazon.com/codedeploy/) - Automated Code Deployment
* [AWS ECS on AWS Fargate](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/AWS_Fargate.html) - Serverless compute with containers
* [Amazon Bedrock](https://aws.amazon.com/bedrock/) - Generative AI
* [Amazon Elastic Container Registry (Amazon ECR)](https://aws.amazon.com/ecr/) - Container Registry
* [AWS Application Load Balancer (AWS ALB)](https://aws.amazon.com/elasticloadbalancing/application-load-balancer/) - Scalable Traffic Distribution
* [Gradio](https://www.gradio.app/) - Python Library that simplifies building Machine Learning Apps

## Architecture

![gen-ai-movie-poster-moderator architecture](https://github.com/maxtybar/gen-ai-movie-poster-moderator/assets/61300968/34f50110-500d-45fb-a891-4d8e787575d2)

## Prerequisites

Deployment has been tested on MacOS, Windowsa and Linux machines. Installation guide assumes you have AWS account and Administrator Access to provision all the resources. Make sure you have access to `Anthropic's Claude 3 Sonnet model` on Amazon Bedrock and your credentials stored in `~/.aws/credentials` (MacOS) or `C:\Users\username\.aws\credentials` (Windows).

=============

* [Amazon Bedrock Claude V3 Sonnet](https://www.aboutamazon.com/news/aws/amazon-bedrock-anthropic-ai-claude-3) - access to the Anthropic's Claude 3 Sonnet model on Amazon Bedrock
* [node](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm) >= 20.0.0
* [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html) >= 2.15.0
* [AWS CDK](https://docs.aws.amazon.com/cdk/v2/guide/getting_started.html) >= 2.133.0

## Deployment

Clone current repository:

```
git clone https://github.com/maxtybar/gen-ai-movie-poster-moderator.git
```

Navigate to the cloned repository in your terminal/shell and then `cd` into [deploy](./deploy/) folder. All of the commands are to be executed from this folder.


```
npm install
```

Note - if you have `npm ERR!` erros related to overlapping dependencies, run `npm install --force`.

If this is your first time deploying infrastructure using AWS CDK for the particular account, bootstrap it first with the following command:
```
cdk bootstrap
```

> [!IMPORTANT]
> Think about a username and password and save it in local environment variables. You will use this username and password to authenticate in the Gradio app later on.

Substitute <> fields with your username and password and execute this command in the terminal/command line:

```
GRADIO_USERNAME=<your username>
GRADIO_PASSWORD=<your password>
```

Deploy the infrastructure:

```
cdk deploy --require-approval never -c gradioUsername=$GRADIO_USERNAME -c gradioPassword=$GRADIO_PASSWORD
```

It will take somewhere from 5 to 7 minutes for the infrastructure to be deployed. Note the URL for the application load balancer in the terminal output. It will be in the following form:

```
GenAIMoviePosterModeratorStack.fargateConstructServiceService{random_prefix} = http://gen-ai-movie-poster-lb-{random_prefix}{your_region}.elb.amazonaws.com
```

Please wait another 4-5 minutes for the CodePipeline to build a Docker image and then deploy it to the Fargate container. After that, navigate to the URL that you copied in the previous step and authenticate using your username and password. Here is the screen you will see:

![Login](https://iili.io/JXFsHva.png)

After you log in you will get to the main page:

![Main page](https://iili.io/JXFsJyJ.png)

Test out using preuploaded images or upload one of yours.

## Conclusion

**Feel free to modify prompt sent to the Claude 3 Sonnet model by modyfing it in the [app.py](./gradio-app/app.py) file.** Enjoy!

## How to delete

To stop incurring any charges, from within the [deploy](./deploy/) folder, run the following command:

```
cdk destroy --force -c gradioUsername=$GRADIO_USERNAME -c gradioPassword=$GRADIO_PASSWORD 
```

The deletion will take somewhere from 7 to 8 minutes.


