require("./Assets/style.scss")
var $ = require('jquery');
var jQuery = $;
global.$=$;
$.ajaxSetup({timeout:2000});
global.jQuery = jQuery;
global.React = require('react');
global.ReactDOM = require('react-dom');
global.rb = require('bootstrap-webpack');
var App = require('./App.js');

ReactDOM.render(<App/>, document.getElementById('main'));
