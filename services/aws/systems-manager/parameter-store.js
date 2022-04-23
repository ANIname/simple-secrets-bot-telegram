const childProcess = require('child_process');
const forEach      = require('lodash/forEach');
const replace      = require('lodash/replace');

const { execSync } = childProcess;

/**
 * Synchronously retrieve information about one or more parameters in a specific hierarchy.
 * More information: https://awscli.amazonaws.com/v2/documentation/api/latest/reference/ssm/get-parameters-by-path.html
 *
 * @param {string} parametersPath - The hierarchy for the parameter.
 * @param {object} options - Retrieve options options
 * @param {boolean} options.recursive - Retrieve all parameters within a hierarchy
 * @param {boolean} options.withDecryption - Retrieve all parameters in a hierarchy with their value decrypted
 * @returns {object[]} - array of parameters
 */
function getParametersByPath(parametersPath, options = {}) {
  const { recursive = false, withDecryption = false } = options;

  let command = 'aws ssm get-parameters-by-path';

  command += ` --path ${parametersPath}`;
  command += recursive ? ' --recursive' : ' --no-recursive';
  command += withDecryption ? ' --with-decryption' : ' --no-with-decryption';

  const result = execSync(command);

  return JSON.parse(result);
}

/**
 * This function is like getParametersByPath except that it returns only key&value object.
 *
 * @param {string} parametersPath - The hierarchy for the parameter.
 * @param {object} options - Retrieve options options
 * @returns {object[]} - array of parameters
 */
function getKeyValueParametersByPath(parametersPath, options = {}) {
  const preparedParameters = [];
  const receivedParameters = getParametersByPath(parametersPath, options);

  forEach(receivedParameters, (receivedParameter) => {
    const parameterKey = replace(receivedParameter.Name, parametersPath, '');

    preparedParameters[parameterKey] = receivedParameter.Value;
  });

  return preparedParameters;
}

module.exports = {
  cli: {
    getParametersByPath,
    getKeyValueParametersByPath,
  },
};
