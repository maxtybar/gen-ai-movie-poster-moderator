#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { AppStack } from '../src/app-stack';

const app = new cdk.App();
new AppStack(app, 'GenAIMoviePosterModeratorStack', {});