/**
 * This util will log data if process.env.IS_DEBUG_ENABLED equal true
 */

const forEach = require('lodash/forEach');
const noop    = require('lodash/noop');

const consoleTableObject = require('./console-table-object');

const { IS_DEBUG_ENABLED } = process.env;

/* eslint-disable no-console */

forEach(console, (methodFunction, methodName) => {
  module.exports[methodName] = IS_DEBUG_ENABLED
    ? (...consoleMethodArguments) => console[methodName](...consoleMethodArguments)
    : noop;
});

exports.tableObject = IS_DEBUG_ENABLED ? consoleTableObject : noop;

/* eslint-enable */
