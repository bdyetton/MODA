/*jslint es5:true, indent:2, maxlen:80, node:true*/
'use strict';

// Node.JS standard modules

var fs, path;
fs = require('graceful-fs');
path = require('path');

// 3rd-party modules

var Q;
Q = require('q');

// custom modules

// promise-bound anti-callbacks

// this module

/**
 * @constructor
 * @classdesc an FSBuilder reads JavaScript values and outputs to the
 *   file-system
 */
function FSBuilder() {
  /**
   * the Array or Object to read from
   * @readonly
   */
  this.source = null;

  /**
   * the String path to the directory to write to
   * @readonly
   */
  this.output = null;
}

/** convention: convenient access to constructor */
FSBuilder.prototype.constructor = FSBuilder;

/**
 * recommended method to set {@link FSBuilder#source}
 * @param {(Array|Object)} source JavaScript value to read from
 * @throws {TypeError} source should only be an Array or Object
 */
FSBuilder.prototype.setSource = function (source) {
  var badTypes;
  badTypes = ['undefined', 'boolean', 'number', 'string', 'function'];
  if (badTypes.indexOf(typeof source) !== -1 || source === null) {
    throw new TypeError('not Array or Object');
  }
  this.source = source;
};

/**
 * @param {String} output the directory to write to
 * @throws {TypeError} output should only be a string
 */
FSBuilder.prototype.setOutput = function (output) {
  if (typeof output !== 'string' || !output.length) {
    throw new TypeError('not String path');
  }
  this.output = output;
};

/**
 * @param {FSBuilder~buildCallback} callback for the build process.
 * @throws {Error} need to use {@link FSBuilder#setSource} and
 * {@link FSBuilder#setOutput} before calling
 */
FSBuilder.prototype.build = function (callback) {
  var dfrd, me;
  me = this;
  if (!this.source) {
    throw new Error('no source');
  }
  if (!this.output) {
    throw new Error('no output');
  }
  dfrd = Q.defer();
  fs.exists(this.output, function (isThere) {
    var err;
    if (!isThere) {
      err = new Error('bad output path');
      callback(err);
      dfrd.reject(err);
      return;
    }
    me.writeValue(me.output, null, me.source).done(
      function () {
        // onSuccess
        callback(null);
        dfrd.resolve();
      },
      function (err) {
        // onError
        callback(err);
        dfrd.reject(err);
      }
    );
  });
  return dfrd.promise;
};

/**
 * @callback FSBuilder~buildCallback
 * @param {Error} err
 */

/**
 * @param {String} dir target Directory to write into.
 * @param {(String|Null)} key label of the File or Directory to write.
 * @param value contents of the File or Directory to write.
 * @returns {Promise}
 */
FSBuilder.prototype.writeValue = function (dir, key, value) {
  var dfrd, type, ext, fileTypes, outPath, me;
  me = this;
  dfrd = Q.defer();

  type = typeof value;
  if (value === null) {
    type = 'null';
  } else if (Array.isArray(value)) {
    type = 'array';
  }

  if (key) {
    outPath = path.join(dir, key + '.' + type);
  } else {
    outPath = dir;
  }

  fileTypes = ['null', 'boolean', 'number', 'string'];
  if (key && fileTypes.indexOf(type) !== -1) {
    ext = 'txt';
    outPath += '.' + ext;
    fs.writeFile(outPath, String(value), function (err) {
      if (err) {
        dfrd.reject(err);
        return;
      }
      dfrd.resolve();
    });
    return dfrd.promise;
  }

  if (Array.isArray(value) || type === 'object') {
    fs.mkdir(outPath, function (err) {
      var promises;
      if (err && err.code !== 'EEXIST') {
        dfrd.reject(err);
        return;
      }
      promises = [];
      if (Array.isArray(value)) {
        value.forEach(function (item, index) {
          promises.push(me.writeValue(outPath, String(index), item));
        });

      } else if (type === 'object') {
        Object.keys(value).forEach(function (label) {
          promises.push(me.writeValue(outPath, label, value[label]));
        });
      }
      Q.when(promises).then(dfrd.resolve, dfrd.reject);
    });
    return dfrd.promise;
  }

  throw new TypeError('unexpected type of value');
};

// exports

module.exports = FSBuilder;
