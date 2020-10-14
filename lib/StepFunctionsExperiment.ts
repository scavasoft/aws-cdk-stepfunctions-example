import {NodejsFunction} from '@aws-cdk/aws-lambda-nodejs';
import {Duration} from '@aws-cdk/core';
import * as cdk from '@aws-cdk/core';
import * as sfn from '@aws-cdk/aws-stepfunctions';
import * as tasks from '@aws-cdk/aws-stepfunctions-tasks';
import * as path from 'path';


export class StepFunctionsExperiment extends cdk.Stack {
    constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);


        const submitLambda = new NodejsFunction(this, 'SubmitLambda', {
            entry: path.resolve(__dirname, '../lambda/submit.ts'),
        });
        const getStatusLambda = new NodejsFunction(this, 'CheckLambda', {
            entry: path.resolve(__dirname, '../lambda/check-status.ts'),
        });

        const submitJob = new tasks.LambdaInvoke(this, 'Submit Job', {
            lambdaFunction: submitLambda,
            // Pass the whole input state to the Lambda
            inputPath: '$',
            // Lambda's result is always in the attribute `Payload`
            // Take it and overwrite the State input
            outputPath: '$.Payload'
        });

        const waitX = new sfn.Wait(this, 'Wait X Seconds', {
            time: sfn.WaitTime.secondsPath('$.waitSeconds'),
        });

        const getStatus = new tasks.LambdaInvoke(this, 'Get Job Status', {
            lambdaFunction: getStatusLambda,
            // Pass just the field named "guid" into the Lambda, put the
            // Lambda's result in a field called "status" in the response
            inputPath: '$.guid',
            outputPath: '$.Payload',
        });

        const jobFailed = new sfn.Fail(this, 'Job Failed', {
            cause: 'AWS Batch Job Failed',
            error: 'DescribeJob returned FAILED',
        });

        const finalStatus = new tasks.LambdaInvoke(this, 'Get Final Job Status', {
            lambdaFunction: getStatusLambda,
            // Use "guid" field as input
            inputPath: '$.guid',
            outputPath: '$.Payload',
        });

        const definition = submitJob
            .next(waitX)
            .next(getStatus)
            .next(new sfn.Choice(this, 'Job Complete?')
                // Look at the "status" field
                .when(sfn.Condition.stringEquals('$.status', 'FAILED'), jobFailed)
                .when(sfn.Condition.stringEquals('$.status', 'SUCCEEDED'), finalStatus)
                .otherwise(waitX));

        new sfn.StateMachine(this, 'StateMachine', {
            definition,
            timeout: Duration.minutes(5)
        });
    }
}
