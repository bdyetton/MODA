var Header = require('./Components/Header');
var Content = require('./Components/Content');

module.exports = React.createClass({
  displayName: 'App',

  componentDidMount: function(){
    $(document).on("dragstart", function(e) {
         if (e.target.nodeName.toUpperCase() == "IMG") {
             return false;
         }
    });

    $(document).on("onpageshow",function(event) {
      if (event.persisted) {
          window.location.reload()
      }
    });

    $(document).on("onpopstate",function(event) {
      if (event.persisted) {
          window.location.reload()
      }
    });
  },

  render: function () {
    return (<div style={{'margin': '0 auto',
                        'textAlign': 'left',
                        'width': '100%'}}>
              <Content/>
            </div>)
  }

});