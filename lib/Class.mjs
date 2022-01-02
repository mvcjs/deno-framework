/** Base class module 'Class' providing basic methods for the framework
  * classes.
  *
  * @package        @mvcjs/deno-framework
  * @module         /lib/Class.mjs
  * @version        0.5.40
  * @copyright      2021 Cubo CMS <https://cubo-cms.com/COPYRIGHT.md>
  * @license        ISC license <https://cubo-cms.com/LICENSE.md>
  * @author         Papiando <info@papiando.com>
  **/

import Namespace from '../Namespace.mjs';

export default class Class {
  /** @constructor (data)
    * Instance constructor
    * @param {string|object} data - instance data to store
    **/
  constructor(data = {}) {
    if(typeof data === 'string') {
      // Store source to load later
      this.data = new Map();
      this.#dataSource = data;
    } else if(Array.isArray(data)) {
      // Store data
      this.data = new Map([...data]);
    } else {
      this.data = new Map(Object.entries(data));
    }
  }

  /** @static @function create(data,caller,prefix)
    * Creates a new instance, after loading data, and remembers caller
    * @param {string|object} data
    * @param {object} caller
    * @param {string} prefix
    * @return {Promise <object>}
    **/
  static create(data = {}, caller = undefined, prefix = '') {
    return new Promise((resolve, reject) => {
      this.load(data).then((data) => {
        let instance;
//        prefix = prefix ?? data.dataType ?? '';
//        if(this.exists(this.name, prefix)) {
//          instance = new Namespace[prefix + this.name](data);
//          if(caller && global.log) log.debug({ message: `${caller.name} creates ${prefix + this.name} instance`, source: this.name, payload: data });
//        } else {
          instance = new this(data);
//          if(caller && global.log) log.debug({ message: `${caller.name} creates ${this.name} instance`, source: this.name, payload: data });
//        }
        instance.caller = caller;
        resolve(instance);
      }).catch((error) => {
        reject(error);
      });
    });
  }
  /** @static @function load(data)
    * Loads data and and returns it as an object
    * @param {string|object} data
    * @return {Promise <object>}
    **/
  static load(data = {}) {
    return new Promise((resolve, reject) => {
      if(typeof data === 'string') {
        fetch(data).then((response) => {
          return response.json();
        }).then((jsonResponse) => {
          resolve(jsonResponse);
        }).catch((error) => {
          reject(error);
        });
      } else {
        resolve(data);
      }
    });
  }

  /** @private @property {string} caller - the instance that created this instance
    **/
  #caller = undefined
  /** @private @property {string} dataSource - data to be loaded for this instance
    **/
  #dataSource = undefined

  /** @function caller()
    * Getter to retrieve the caller of this instance
    * @return {object}
    **/
  get caller() {
    return this.#caller;
  }
  /** @function caller(caller)
    * Setter to store the caller of this instance
    * @param {object} caller - the instance that created this instance
    **/
  set caller(caller = undefined) {
    return this.#caller = caller;
  }
  /** @function name()
    * Getter to retrieve the class name of this instance
    * @return {string}
    **/
  get name() {
    return this.constructor.name;
  }

  /** @static @function get(property)
    * Short-hand method to retrieve the value of a property from the data map
    * @param {string} property
    * @return {any}
    **/
  get(property) {
    return this.data.get(property);
  }
  /** @static @function has(property)
    * Short-hand method to determine if a property exists in the data map
    * @param {string} property
    * @return {boolean}
    **/
  has(property) {
    return this.data.has(property);
  }
  /** @static @function set(property,value)
    * Short-hand method to set the value of a property in the data map
    * @param {string} property
    * @param {any} value
    * @return {any}
    **/
  set(property, value) {
    this.data.set(property, value);
  }
  /** @static @function unset(property)
    * Short-hand method to delete a property from the data map
    * @param {string} property
    * @return {any}
    **/
  unset(property) {
    this.data.delete(property);
  }

  /** @static @function toJSON()
    * Make sure a JSON.stringify only returns the data map
    * @return {object}
    **/
  toJSON() {
    return this.valueOf();
  }
  /** @static @function toString()
    * Return the name of the instance class
    * @return {object}
    **/
  toString() {
    return this.name;
  }
  /** @static @function valueOf()
    * Make sure the data map is retrieved and presented as an object
    * @return {object}
    **/
  valueOf() {
    return Object.fromEntries(this.data);
  }
}