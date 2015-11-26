var React = require('react');

var Header = require('./Components/Header');
var Content = require('./Components/Content');

//require('./bootstrap.css');

module.exports = React.createClass({
  displayName: 'App',

  render: function () {
    return (<div>
              <Header/>
              <Content/>
            </div>)
  }

});