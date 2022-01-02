/** @package        @cubo-cms/node-framework
  * @module         @mvcjs/deno-framework
  * @version        0.5.40
  * @copyright      2021 Cubo CMS <https://cubo-cms.com/COPYRIGHT.md>
  * @license        ISC license <https://cubo-cms.com/LICENSE.md>
  * @author         Papiando <info@papiando.com>
  **/

import Namespace from '../../Namespace.mjs';

export default class Logger extends Namespace.Class {
  /** @private @property {object} default - holds default values for this class
    **/
  static default = {
    console: true,
    file: false,
    locale: new Intl.Locale('nl-NL', { timezone: 'America/Curacao' }),
    showColors: false,
    showDate: true,
    showPayload: false,
    showSource: false,
    suppressStatus: ['debug','info'],
    suppressSource: ['Namespace'],
    useLocale: false
  }
  static logColors = {
    bright: { color: "\x1b[1m" },   // Bright
    debug: { color: "\x1b[35m" },   // Magenta
    dim: { color: "\x1b[2m" },      // Dim
    error: { color: "\x1b[31m" },   // Red
    fail: { color: "\x1b[33m" },    // Yellow
    info: { color: "\x1b[36m" },    // Cyan
    reset: { color: "\x1b[0m" },    // Reset to normal
    success: { color: "\x1b[32m" }, // Green
    warning: { color: "\x1b[33m" }  // Yellow
  }

  /** @static @function defaultFormat(data,type)
    * Outputs the data formatted with fancy colors
    * @param {string||object} data
    * @param {string} status
    * @return {string}
    **/
  static defaultFormat(data, status = 'debug') {
    data = Logger.normalize(data, status);
    let output =
      (this.get('showColors') ? Logger.logColors['dim'].color : '') +
      (this.get('useLocale') ? new Date(data.time).toLocaleString(this.get('locale')) : new Date(data.time).toISOString()) +
      (this.get('showColors') ? Logger.logColors['reset'].color : '') + ' ' +
      (this.get('showColors') ? Logger.logColors[data.status].color + data.status + Logger.logColors['reset'].color : data.status) + ': ' +
      data.message +
      (this.get('showSource') ?
        (this.get('showColors') ? Logger.logColors['dim'].color : '') +
        ` in ${data.source}` +
        (this.get('showColors') ? Logger.logColors['reset'].color : '')
      : '');
    return output;
  }
  /** @static @function normalize(data)
    * Makes sure there is an object with required fields
    * @param {string||object} data
    * @param {string} type - error type
    * @return {object}
    **/
  static normalize(data, status = 'debug') {
    let response = {};
    if(typeof data === 'string') {
      response.message = data;
      response.status = status;
    } else if(typeof data === 'object') {
      response = data;
      response.message = data.message || 'Unknown error';
      response.status = data.status || status;
    } else {
      response.message = 'Unknown error';
      response.status = status;
    }
    response.time = new Date().getTime();
    return response;
  }

  /** @alias format
    * Allows for declaring different formats for each Logger
    **/
  format = this.constructor.defaultFormat

  /** @function debug(data)
    * Writes debug message to the log
    * @param {object} data
    **/
  debug(data) { this.log(data, 'debug'); }
  /** @function error(data)
    * Writes error message to the log
    * @param {object} data
    **/
  error(data) { this.log(data, 'error'); }
  /** @function fail(data)
    * Writes fail message to the log
    * @param {object} data
    **/
  fail(data) { this.log(data, 'fail'); }
  /** @function info(data)
    * Writes info message to the log
    * @param {object} data
    **/
  info(data) { this.log(data, 'info'); }
  /** @function log(data,status)
    * Writes message to the log
    * @param {object} data
    * @param {string} status
    **/
  log(data, status = 'debug') {
    if(!this.get('suppressStatus').includes(data.status || status) && !this.get('suppressSource').includes(data.source)) {
      let message = this.format(data, data.status || status);
      if(this.get('file')) {
        let file = Namespace.resolvePath(this.get('file')).replace('file://', '');
        Deno.writeTextFile(file, message + '\n', { append: true }).then(() => {
          if(this.get('showPayload') && data.payload) {
            Deno.writeTextFile(file, '\t' + data.payload + '\n', { append: true });
          }
        });
      }
      if(this.get('console')) {
        console.log(message);
        if(this.get('showPayload') && data.payload) {
          console.group();
          console.log(data.payload);
          console.groupEnd();
        }
      }
    }
  }
  /** @function success(data)
    * Writes success message to the log
    * @param {object} data
    **/
  success(data) { this.log(data, 'success'); }
  /** @function warning(data)
    * Writes warning message to the log
    * @param {object} data
    **/
  warning(data) { this.log(data, 'warning'); }
}
