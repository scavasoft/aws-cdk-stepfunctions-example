#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { AwsCdkStepfunctionsExperimentStack } from '../lib/aws-cdk-stepfunctions-experiment-stack';

const app = new cdk.App();
new AwsCdkStepfunctionsExperimentStack(app, 'AwsCdkStepfunctionsExperimentStack');
