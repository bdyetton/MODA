var Header = require('./Components/Header');
var Content = require('./Components/Content');

module.exports = React.createClass({
  displayName: 'App',

  render: function () {
    return (<div>
              <Header/>
              <Content/>
            </div>)
  }

});