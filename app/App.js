var React = require('react');

var Header = require('./Components/Header');
var Content = require('./Components/Content');
var Favicon = require('react-favicon');

//require('./bootstrap.css');

var faviconUrl = require('./Assets/favicon.ico');

module.exports = React.createClass({
  displayName: 'App',

  render: function () {
    return (<div>
              <Header/>
              <Content/>
              <Favicon url={ faviconUrl }/>
            </div>)
  }

});