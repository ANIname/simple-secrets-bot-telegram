const forEach  = require('lodash/forEach');
const isObject = require('lodash/isObject');

/**
 * @param {object} object - The object with own properties
 * @returns {object} - Flatten object
 * @example
 *
 * const inputObject = {
 *   user: {
 *     name: 'John',
 *     age: 36,
 *     settings: {
 *       main: { logs: true },
 *       company: { autoUpdate: true }
 *     }
 *   }
 * }
 *
 * const outputObject = toFlattenObject(inputObject)
 *
 * console.info(outputObject)
 * // {
 * //  'user.name': 'John',
 * //  'user.age': 36,
 * //  'user.settings.main.logs': true,
 * //  'user.settings.company.autoUpdate': true
 * // }
 */
module.exports = function toFlattenObject(object) {
  const result = {};

  forEach(object, (childValue, childKey) => {
    if (isObject(childValue)) {
      const flattenObject = toFlattenObject(childValue);

      forEach(flattenObject, (flattenChildValue, flattenChildKey) => {
        result[`${childKey}.${flattenChildKey}`] = flattenChildValue;
      });
    }
    else result[childKey] = childValue;
  });

  return result;
};
