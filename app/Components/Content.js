var Scorer = require('./Scorer');
var Login = require('./Login');

module.exports = React.createClass({
  displayName: 'Content',
  getInitialState: function() {
    return {page: 'login'};
  },

  updatePage: function(page,data){
    if (page==='score'){
      this.setState({user:data.userName, image:data.image});}
    else if(page==='instructions'){

    }
    else{

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
      return (<div><Scorer user={this.state.user} image={this.state.image}/></div>)
    }

  }

});