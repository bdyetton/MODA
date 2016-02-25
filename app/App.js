var Header = require('./Components/Header');
var Content = require('./Components/Content');

module.exports = React.createClass({
  displayName: 'App',

  render: function () {
    return (<div style={{'margin': '0 auto',
                        'textAlign': 'left',
                        'width': '100%'}}>
              <Content/>
            </div>)
  }

});