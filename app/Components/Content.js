var Scorer = require('./Scorer');
var Login = require('./Login');

module.exports = React.createClass({
  displayName: 'Content',
  getInitialState: function() {
    return {page: 'login'};
  },

  updatePage: function(page,data){
    if (page==='score'){
      this.setState({userData:data.userData, showInstructions:data.createdUser, image:data.image});
    }
    this.setState({page:page})
  },

  render: function () {
    var self = this;
    if(self.state.page==='login')
    {
      return (<div><Login updatePage={self.updatePage}/></div>)
    } else if (self.state.page==='score')
    {
      return (<div><Scorer userData={this.state.userData} showInstructions={this.state.showInstructions} image={this.state.image}/></div>)
    }

  }

});