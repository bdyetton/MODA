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
            return (<div><Login loggedInCallback={function(user,image){
                self.setState({user:user, image:image});
                self.setState({loggedIn:true});
            }}/></div>)
        } else
        {
            return (<div><Scorer user={this.state.user} image={this.state.image}/></div>)
        }

    }

});