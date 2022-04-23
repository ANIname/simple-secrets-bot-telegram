const get = require('lodash/get');
const set = require('lodash/set');

/**
 * Sets the value at path of object if not exists
 *
 * @param {object} object - The object to update.
 * @param {Array|string} path - The path of the property to set.
 * @param {*} value - The value to set.
 * @returns {*} input value
 */
module.exports = function setIfNotExists(object, path, value) {
  return get(object, path) || set(object, path, value);
};
