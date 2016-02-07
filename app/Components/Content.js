var Scorer = require('./Scorer');
var Login = require('./Login');

module.exports = React.createClass({
    displayName: 'Content',
    getInitialState: function() {
        return {loggedIn: false};
    },

    render: function () {
        var self = this;
        if(!self.state.loggedIn)
        {
            return (<div><Login loggedInCallback={function(user,img){
                self.setState({user:user, img:img});
                self.setState({loggedIn:true});
            }}/></div>)
        } else
        {
            return (<div><Scorer user={this.state.user} img={this.state.img}/></div>)
        }

    }

});