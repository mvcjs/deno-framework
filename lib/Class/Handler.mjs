/** Base class module 'Handler' providing basic methods for the framework
  * handlers.
  *
  * @package        @mvcjs/deno-framework
  * @module         /lib/Class/Handler.mjs
  * @version        0.5.40
  * @copyright      2021 Cubo CMS <https://cubo-cms.com/COPYRIGHT.md>
  * @license        ISC license <https://cubo-cms.com/LICENSE.md>
  * @author         Papiando <info@papiando.com>
  **/

import Namespace from '../../Namespace.mjs';

export default class Handler extends Namespace.Class {
  /** @constructor (data)
    * Instance constructor
    * @param {string|object} data - data to store for this instance
    **/
  constructor(data = {}) {
    super(data);
    // Store class stack
    this.#stack = this.constructor.stack || new Set();
  }

  /** @static @function clear()
    * Removes all handlers from the default stack for this class. This allows
    * replacing the entire handler stack before the instance is created.
    **/
  static clear() {
    if(global.log) log.debug(`${this.name} clears all handlers`);
    this.stack = new Set();
  }
  /** @static @function use(handler)
    * Adds a handler to the default stack for this class. The handler object
    * points to a class, not an instance. The handler method instantiates the
    * instance sequentially. This means upon adding a handler it is placed at
    * the end of the stack.
    * @param {object|string} handler
    **/
  static use(handler) {
    if(typeof handler === 'function' || typeof handler === 'object') {
      handler = handler.name;
    };
    if(global.log) log.debug(`${this.name} uses ${handler}`);
    if(!this.stack) this.stack = new Set();
    this.stack.add(handler);
  }

  /** @private @property {object} stack - holds handlers specific for this instance
    **/
  #stack = new Set()

  /** @function clear(handler)
    * Removes one or all handlers from the stack
    * @param {string|object} handler - class or class name to be removed
    **/
  clear(handler = undefined) {
    if(handler === undefined) {
      if(global.log) log.debug(`${this.name} clears all handlers`);
      this.#stack = new Set();
    } else {
      if(typeof handler == 'function' || typeof handler == 'object') {
        handler = handler.name;
      };
      if(global.log) log.debug(`${this.name} removes handler ${handler}`);
      this.#stack.delete(handler);
    }
  }
  /** @function handler(request,data)
    * Invokes handler for this instance and returns processed data
    * @param {object} request - original server request
    * @param {object} data - data passed on from previous handler
    * @return {Promise<object>} - data returned in JResponse format
    **/
  handler(request, data) {
    return new Promise((resolve, reject) => {
      resolve(Namespace.JResponse.success({ data: data }, this.name));
    });
  }
  /** @function invoke(request,response,data)
    * Invokes execution of the handlers for this instance
    * @param {object} request - original request data
    * @param {object} response - data that will be returned
    * @param {object} data - data to be passed to handler
    * @return {Promise <object>}
    **/
  invoke(request, response, data = {}) {
    if(global.log) log.debug({ message: `${this.name} invokes handler`, source: this.name });
    return new Promise((resolve, reject) => {
      // Load data
      Namespace.JLoader.load(data).then((data) => {
        // Execute handler
        return this.handler(request, response, {...this.data, ...data});
      }).then((result) => {
        log.debug({ message: `${this.name} returns results from handler`, source: this.name, payload: result });
        // Merge with existing data
        if(result.status == 'success') Object.assign(data, result.data);
        // Sequentially resolve promises
        resolve(this.#stack.reduce((result, handler) => {
          handler = typeof handler === 'string' ? Namespace[handler] : handler;
          return result.then((data) => {
            if(data.status) {
              if(data.status == 'success') {
                // Retrieve results
                data = data.data;
              } else {
                // An error or failure was encountered; throw as error
                throw data;
              }
            } else {
              // No changes
              data = data;
            }
            // Create new handler and preload data
            return handler.create(data[handler.name.toLowerCase()], this);
          }).then((instance) => {
            delete this.data[handler.name.toLowerCase()];
            return instance.invoke(request, response, data);
          }).catch((error) => {
            return error;
          });
        }, Promise.resolve(data)));
      }).catch((error) => {
        log.error({ message: `${this.name} returns error`, source: this.name, payload: error });
        reject(error);
      });
    });
  }
}
