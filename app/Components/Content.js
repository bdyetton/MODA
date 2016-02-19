var Scorer = require('./Scorer');
var Login = require('./Login');

module.exports = React.createClass({
  displayName: 'Content',
  getInitialState: function() {
    return {page: 'login'};
  },

  render: function () {
    var self = this;
    if(self.state.page==='login')
    {
      return (<div><Login loggedInCallback={function(user,image){
                self.setState({user:user, image:image});
                self.setState({loggedIn:'login'});
            }}/></div>)
    } else
    {
      return (<div><Scorer user={this.state.user} image={this.state.image}/></div>)
    }

  }

});