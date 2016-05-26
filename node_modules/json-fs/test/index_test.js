/*jslint es5:true, indent:2, maxlen:80, node:true*/
/*global suite, test, suiteSetup, suiteTeardown, setup, teardown*/ // Mocha
'use strict';

// Node.JS standard modules

var path;
path = require('path');

// 3rd-party modules

var chai, assert, sinon;

chai = require('chai');
chai.use(require('sinon-chai'));
assert = require('chai').assert;
sinon = require('sinon');

// custom modules

// promise-bound anti-callbacks

// this module

suite('main module', function () {

  test('requires without issue', function () {
    var jsonFs = require(path.join('..', 'lib'));
    assert.isObject(jsonFs, 'got Object');
  });

});

suite('main object', function () {
  var jsonFs = require(path.join('..', 'lib'));

  test('exposes FSBuilder constructor', function () {
    var FSBuilder = require(path.join('..', 'lib', 'fsbuilder'));
    assert.equal(jsonFs.FSBuilder, FSBuilder, 'FSBuilder available');
  });

  test('exposes JSONBuilder constructor', function () {
    var JSONBuilder = require(path.join('..', 'lib', 'jsonbuilder'));
    assert.equal(jsonFs.JSONBuilder, JSONBuilder, 'JSONBuilder available');
  });

});
