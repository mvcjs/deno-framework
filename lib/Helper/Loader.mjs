/** Helper module 'Loader' providing methods to load data from a file path or a stream
  * into an object.
  *
  * @package        @mvcjs/deno-framework
  * @module         /lib/Helper/Loader.mjs
  * @version        0.5.40
  * @copyright      2021 Cubo CMS <https://cubo-cms.com/COPYRIGHT.md>
  * @license        ISC license <https://cubo-cms.com/LICENSE.md>
  * @author         Papiando <info@papiando.com>
  **/

import Namespace from '../../Namespace.mjs';

export default class Loader {
  /** @static @function isPath(data)
    * Returns true if data is recognized as a file path
    * @param {string} data
    * @return {boolean}
    **/
  static isPath(data) {
    if(typeof data !== 'string') return false;
    const PathTester = /^(~\/|\.\/)/g;
    return PathTester.test(data);
  }
  /** @static @function isURI(data)
    * Returns true if data is a URI
    * @param {string} data
    * @return {boolean}
    **/
  static isURI(data) {
    if(typeof data !== 'string') return false;
    const URITester = /^([\w\-\+_]+:\/\/.+\/|\/.*)/g;
    return URITester.test(data);
  }
  /** @static @function load(data)
    * Loads data and and returns it as an object
    * @param {string|object} data
    * @param {string} format - either text (default) or json
    * @return {Promise <object>}
    **/
  static load(data = {}, format = 'text') {
    return new Promise((resolve, reject) => {
      if(typeof data === 'string') {
        if(this.isPath(data)) {
          fetch(Namespace.resolvePath(data)).then((response) => {
            resolve(response[format]());
          }).catch((error) => {
            console.log(error);
            reject(Namespace.JResponse.error({ message: `Failed to load "${data}"`, payload: error }, this.name));
          });
        } else if (this.isURI(data)) {
          fetch(data).then((response) => {
            resolve(response[format]());
          }).catch((error) => {
            reject(Namespace.JResponse.error({ message: `Failed to load "${data}"`, payload: error }, this.name));
          });
        } else {
          // Probably already a valid string; return as is
          resolve(data);
        }
      } else {
        // Probably already a valid object; return as is
        resolve(data);
      }
    });
  }
  /** @static @function loadAll(data)
    * Loads data from multiple sources and returns it as an object; this will load multiple files synchronously
    * @param {object} data
    * @return {Promise <object>}
    **/
  static loadAll(data = {}) {
    let promise = [];
    return new Promise((resolve, reject) => {
      Object.keys(data).forEach((file) => {
        promise.push(this.load(data[file]).then((result) => {
          data[file] = result;
        }).catch((error) => {
          reject(error);
        }));
      });
      Promise.allSettled(promise).then(() => {
        resolve(data);
      });
    });
  }
}
