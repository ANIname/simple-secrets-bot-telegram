const toFlattenObject = require('./to-flatten-object');

/**
 * Simple function to log objects
 *
 * @param {string} message - Parent message
 * @param {object} object - The object to log
 * @example
 *
 * consoleTableObject('Serverless configuration', { ... })
 */
module.exports = function consoleTableObject(message, object) {
  const preparedObjectToLog = toFlattenObject(object);

  console.group(message);
  console.table(preparedObjectToLog);
  console.groupEnd();
};
