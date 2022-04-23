require('./environment');

const path      = require('path');
const importDir = require('directory-import');

const camelCase = require('lodash/camelCase');
const split     = require('lodash/split');
const join      = require('lodash/join');
const pick      = require('lodash/pick');

const consoleTableObject = require('./utils/console-table-object');
const setIfNotExists     = require('./utils/set-if-not-exists');

const {
  SERVERLESS_VERSION,
  NODE_ENGINE_VERSION,
  PROJECT_NAME,

  AWS_PROFILE,
  AWS_REGION,
  STACK_NAME,
  STAGE,

  IS_OFFLINE,
  IS_DEVELOPMENT,
} = process.env;

// Base configuration
(() => {
  const config = module.exports;

  config.service = PROJECT_NAME;

  config.frameworkVersion = SERVERLESS_VERSION;

  config.configValidationMode        = 'error';
  config.deprecationNotificationMode = 'error';

  config.plugins = [
    'serverless-offline',
    'serverless-stack-output',
    'serverless-plugin-scripts',
    'serverless-deployment-bucket',
    'serverless-plugin-include-dependencies',
  ];

  consoleTableObject('⚡ Serverless base configuration:', config);
})();

// Provider configuration
(() => {
  const config = setIfNotExists(module.exports, 'provider', {}).provider;

  config.name    = 'aws';
  config.runtime = `nodejs${NODE_ENGINE_VERSION}`;

  config.stage     = STAGE;
  config.region    = AWS_REGION;
  config.stackName = STACK_NAME;

  config.profile         = IS_OFFLINE ? AWS_PROFILE : undefined;
  config.disableRollback = !!IS_DEVELOPMENT;

  config.logRetentionInDays = 7;

  config.versionFunctions = true;

  consoleTableObject('⚡ Serverless provider configuration:', config);
})();

// Deployment bucket configuration
(() => {
  const config = setIfNotExists(module.exports, 'provider.deploymentBucket', {}).provider.deploymentBucket;

  config.name = `${STACK_NAME}-deployment-bucket`;

  config.blockPublicAccess              = true;
  config.maxPreviousDeploymentArtifacts = 1;

  consoleTableObject('⚡ Serverless deployment bucket configuration:', config);
})();

// Package configuration
(() => {
  const config = setIfNotExists(module.exports, 'package', {}).package;

  config.individually = true;

  config.patterns = '!**';

  // no need to spend time excluding dev dependencies, given that
  // serverless-plugin-include-dependencies does it already
  config.excludeDevDependencies = false;

  consoleTableObject('⚡ Serverless package Configuration:', config);
})();

// Stack output configuration
(() => {
  const config = setIfNotExists(module.exports, 'custom.output', {}).custom.output;

  config.file = '.serverless/stack-output.json';

  consoleTableObject('⚡ Serverless stack output Configuration:', config);
})();

// Lambda functions configuration
(() => {
  const config = setIfNotExists(module.exports, 'functions', {}).functions;

  const preparedLambdaFunctionsDataToLog = {};

  const importLambdaFunctionsConfigurationOptions = {
    directoryPath: './lambda-functions',
    exclude:       /^((?!lambda-config.js).)*$/, // exclude everything that is not a lambda-config.js
  };

  importDir(importLambdaFunctionsConfigurationOptions, (lambdaConfigName, lambdaConfigPath, lambdaConfigData) => {
    const lambdaConfigDirectory = path.dirname(lambdaConfigPath);

    let lambdaName = lambdaConfigDirectory.slice(1);
    lambdaName     = split(lambdaName, path.sep);
    lambdaName     = join(lambdaName, '-');

    config[lambdaName] = {
      handler: `lambda-functions${lambdaConfigDirectory}/index.handler`,

      events: [{ http: { path: lambdaConfigDirectory, method: 'ANY' } }],

      ...lambdaConfigData,
    };

    preparedLambdaFunctionsDataToLog[lambdaName] = pick(config[lambdaName], ['handler', 'description']);
  });

  console.group('⚡', 'Serverless prepared lambda functions:');
  console.table(preparedLambdaFunctionsDataToLog);
  console.groupEnd();
})();

// Resources configuration
(() => {
  const config = setIfNotExists(module.exports, 'resources', {}).resources;

  importDir({ directoryPath: './resources' }, (resourceName, resourcePath, resourceConfig) => {
    const resourceCamelCaseName = camelCase(resourceName);

    config[resourceCamelCaseName] = resourceConfig;
  });

  console.group('⚡', 'Serverless resources configuration:');
  console.table(config);
  console.groupEnd();
})();
