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
      this.data = {...this.constructor.default};
      this.#dataSource = data;
    } else {
      // Store data
      this.data = {...this.constructor.default, ...data};
    }
  }

  /** @static @function create(data,caller,prefix)
    * Creates a new instance, after loading data, and remembers caller
    * @param {string|object} data
    * @param {object} caller
    * @param {string} prefix
    * @return {Promise <object>}
    **/
  static create(data = {}, caller = null, prefix = '') {
    return new Promise((resolve, reject) => {
      Namespace.Loader.load(data, 'json').then((data) => {
        let instance;
        if(prefix && this.exists(this.name, prefix)) {
          instance = new Namespace[prefix + this.name](data);
          if(caller && typeof log !== 'undefined') log.debug({ message: `${caller.name} creates ${prefix + this.name} instance`, source: this.name, payload: data });
        } else {
          instance = new this(data);
          if(caller && typeof log !== 'undefined') log.debug({ message: `${caller.name} creates ${this.name} instance`, source: this.name, payload: data });
        }
        instance.caller = caller;
        resolve(instance);
      }).catch((error) => {
        reject(error);
      });
    });
  }
  /** @static @function exists(module,prefix)
    * Returns true if the specified module exists in the namespace
    * @param {string} module
    * @param {string} prefix - optional prefix prepended
    * @return {boolean}
    **/
  static exists(module, prefix = '') {
    return Namespace.exists(prefix + module);
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

  /** @function get(property)
    * Method to retrieve the value of a property
    * @param {string} property
    * @return {any}
    **/
  get(property) {
    return this.data[property] || undefined;
  }
  /** @function has(property)
    * Method to determine if a property exists
    * @param {string} property
    * @return {boolean}
    **/
  has(property) {
    return this.data[property] !== undefined;
  }
  /** @function load(data)
    * Loads data and stores it as object data
    * @param {string|object} data - provided data to store
    * @return {Promise <object>}
    **/
  load(data = {}) {
    return new Promise((resolve, reject) => {
      Namespace.Loader.load(this.#dataSource, 'json').then((sourceData) => {
        // Merge optional source data from constructor with defaults
        this.data = {...this.data, ...sourceData};
        this.#dataSource = undefined;
        // Load provided data
        return Namespace.Loader.load(data, 'json');
      }).then((data) => {
        // Merge provided data with source data
        this.data = {...this.data, ...data};
        // Resolve only the provided data
        resolve(data);
      }).catch((error) => {
        reject(error);
      });
    });
  }
  /** @function set(property,value)
    * Method to set the value of a property
    * @param {string} property
    * @param {any} value
    * @return {any}
    **/
  set(property, value = undefined) {
    this.data[property] = value;
  }
  /** @function toJSON()
    * Make sure a JSON.stringify only returns the data map
    * @return {object}
    **/
  toJSON() {
    return this.valueOf();
  }
  /** @function toString()
    * Return the name of the instance class
    * @return {object}
    **/
  toString() {
    return this.name;
  }
  /** @function unset(property)
    * Method to delete a property
    * @param {string} property
    * @return {any}
    **/
  unset(property) {
    delete this.data[property];
  }
  /** @function valueOf()
    * Make sure the data map is retrieved and presented as an object
    * @return {object}
    **/
  valueOf() {
    return this.data;
  }
}
