const split   = require('lodash/split');
const toUpper = require('lodash/toUpper');
const omit    = require('lodash/omit');
const keys    = require('lodash/keys');

const packageFile = require('./package.json');

const consoleTableObject = require('./utils/console-table-object');
const awsParameterStore  = require('./services/aws/systems-manager/parameter-store');

// Merge with default parameters
(() => {
  const defaultParameters = {
    STAGE:      'development',
    IS_OFFLINE: 'false',

    SERVERLESS_VERSION:  split(packageFile.devDependencies.serverless, '.')[0],
    NODE_ENGINE_VERSION: packageFile.engines.node,
    PROJECT_NAME:        packageFile.name,

    AWS_DEVELOPMENT_REGION: 'us-east-1',
    AWS_STAGING_REGION:     'us-east-2',
    AWS_PRODUCTION_REGION:  'eu-central-1',
  };

  consoleTableObject('⚙️ Default environment variables:', defaultParameters);

  process.env = { ...defaultParameters, ...process.env };
})();

// Merge with generated default parameters
(() => {
  const generatedParameters = {
    ...process.env,

    get AWS_REGION() {
      return this[`AWS_${toUpper(this.STAGE)}_REGION`];
    },

    get AWS_PROFILE() {
      return this.IS_OFFLINE ? this.PROJECT_NAME : undefined;
    },

    get STACK_NAME() {
      return `${this.PROJECT_NAME}-${this.STAGE}`;
    },

    get IS_DEVELOPMENT() {
      return this.STAGE === 'development'
        ? 'true'
        : 'false';
    },

    get IS_DEBUG_ENABLED() {
      return (this.IS_OFFLINE === 'true' || this.IS_DEVELOPMENT === 'true')
        ? 'true'
        : 'false';
    },

    get SLS_DEBUG() {
      return this.IS_DEBUG_ENABLED ? '*' : undefined;
    },
  };

  consoleTableObject('⚙️ Generated default environment variables:', omit(generatedParameters, keys(process.env)));

  process.env = { ...generatedParameters, ...process.env };
})();

// Merge with parameters from parameterStore
(() => {
  const { STAGE, PROJECT_NAME } = process.env;

  const parametersPath               = `/${PROJECT_NAME}/${STAGE}/`;
  const parametersFromParameterStore = awsParameterStore.cli.getKeyValueParametersByPath(parametersPath);

  consoleTableObject('⚙️ Parameters from parameter store:', parametersFromParameterStore);

  process.env = { ...parametersFromParameterStore, ...process.env };
})();
