#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import {StepFunctionsExperiment} from '../lib/StepFunctionsExperiment';

const app = new cdk.App();
new StepFunctionsExperiment(app, 'StepFunctions-Experiment');
