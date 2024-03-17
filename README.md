# Gen AI Movie Poster Moderator
Flag poster that are not in semantic compliance with custom policies using Gen AI.

Media companies want to review movie posters for specific markets for compliance before they publish them. For example, in China movie posters should not show bones. These moderation requirements need to be customizable and should not require additional training. Gen AI Movie Poster Moderator takes a movie poster and evaluates it for customizable and nuanced conditions. It can detect nuances like sharks vs sharks eating humans.  If a condition fails it flags the poster and provides the reason why it failed.

# Prerequisites

Deployment has been tested on MacOS, Windowsa and Linux machines. Installation guide assumes you have AWS account and Administrator Access to provision all the resources. Make sure you have access to `Anthropic's Claude 3 Sonnet model` on Amazon Bedrock and your credentials stored in `~/.aws/credentials` (MacOS) or `C:\Users\username\.aws\credentials` (Windows).

=============

* [Amazon Bedrock Claude V3 Sonnet](https://www.aboutamazon.com/news/aws/amazon-bedrock-anthropic-ai-claude-3) - access to the Anthropic's Claude 3 Sonnet model on Amazon Bedrock
* [node](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm) >= 16.0.0
* [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html) >= 2.0.0
* [AWS CDK](https://docs.aws.amazon.com/cdk/v2/guide/getting_started.html) >= 2.66.1

# Before you start

Clone current repository:

```
git clone https://github.com/maxtybar/gen-ai-movie-poster-moderator.git
```

Navigate to the cloned repository in your terminal/shell. All of the commands are to be executed from the project's root folder/repo that you just cloned.


```
npm install
```

Note - if you have `npm ERR!` erros related to overlapping dependencies, run `npm install --force`.

If this is your first time deploying infrastructure using AWS CDK for the particular account, bootstrap it first with the following command:
```
cdk bootstrap
```


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
GenAIMoviePosterModeratorStack.fargateConstructServiceServiceURLD060E7CD = http://gen-ai-movie-poster-lb-{random_number}{your_region}.elb.amazonaws.com
```

Please wait another 4-5 minutes for the CodePipeline to build a Docker image and then deploy it to the Fargate container. After that, navigate to the URL that you copied in the previous step and authenticate using your username and password. Feel free to test out using preuploaded images or upload one of yours. Enjoy!

# How to delete

From within the root project folder (``gen-ai-movie-poster-moderator``), run the following command:

```
cdk destroy --force -c gradioUsername=$GRADIO_USERNAME -c gradioPassword=$GRADIO_PASSWORD 
```


