# Gen AI Movie Poster Moderator
Flag poster that are not in semantic compliance with custom policies using Gen AI.

# Prerequisites

Deployment has been tested on MacOS, Windowsa and Linux machines. Installation guide assumes you have AWS account and Administrator Access to provision all the resources. Make sure you have access to `Anthropic's Claude 3 Sonnet model` on Amazon Bedrock and your credentials stored in `~/.aws/credentials` (MacOS) or `C:\Users\username\.aws\credentials` (Windows).

=============

* [Amazon Bedrock Claude V3 Sonnet](https://www.aboutamazon.com/news/aws/amazon-bedrock-anthropic-ai-claude-3) - access to the Anthropic's Claude 3 Sonnet model on Amazon Bedrock
* [node](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm) >= 16.0.0
* [Python](https://www.python.org/) >= 3.11
* [pip](https://pypi.org/project/pip/) >= 23.3.1
* [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html) >= 2.0.0
* [AWS CDK](https://docs.aws.amazon.com/cdk/v2/guide/getting_started.html) >= 2.66.1

# Before you start

Clone current repository:

```
git clone https://github.com/maxtybar/gen-ai-movie-poster-moderator.git
```

Navigate to the cloned repository in your terminal/shell. All of the commands are to be executed from the project's root folder/repo that you just cloned.

Recommended: Create a Python virtual environment. To manually create a virtualenv run the following command:

```
python3 -m venv .venv
```

After the init process completes and the virtualenv is created, you can use the following
step to activate your virtualenv.

**Note: This command is for MacOS/Linux machines only.** 
If you are using MacOS/Linux machine run the following command:

```
source .venv/bin/activate
```

**Note: This command is for Windows machines only.** 
If you are using a Windows platform, you would activate the virtualenv like this:

```
.venv\Scripts\activate.bat
```

Once the virtualenv is activated, you can install the required dependencies.

```
python3 -m pip install -r requirements.txt
```

To run the application execute the following command:

```
python3 app.py
```

Navigate to the local host URL at http://127.0.0.1:7860.


