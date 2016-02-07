require("./Assets/style.scss")
var $ = require('jquery');
var jQuery = $;
global.$=$;
global.jQuery = jQuery;
global.React = require('react');
global.ReactDOM = require('react-dom');
var App = require('./App.js');

ReactDOM.render(<App/>, document.getElementById('main'));
