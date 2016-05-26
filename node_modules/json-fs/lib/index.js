/** @module json-fs */
/*jslint es5:true, indent:2, maxlen:80, node:true*/
/*jslint nomen:true*/ // Node.JS global __dirname
'use strict';

// Node.JS standard modules

var path;
path = require('path');

// 3rd-party modules

// custom modules

var FSBuilder, JSONBuilder;
FSBuilder = require(path.join(__dirname, 'fsbuilder'));
JSONBuilder = require(path.join(__dirname, 'jsonbuilder'));

// promise-bound anti-callbacks

// this module

// exports

module.exports = {
  /**
   * the {@link FSBuilder} constructor
   * @example <caption>constructing a new FSBuilder</caption>
   *   var fsBuilder = new require('json-fs').FSBuilder();
   */
  FSBuilder: FSBuilder,
  /**
   * the {@link JSONBuilder} constructor
   * @example <caption>constructing a new JSONBuilder</caption>
   *   var jsonBuilder = new require('json-fs').JSONBuilder();
   */
  JSONBuilder: JSONBuilder
};
