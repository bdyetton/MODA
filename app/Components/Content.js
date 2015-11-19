var React = require('react');

var Scorer = require('./Scorer');
var Login = require('./Login');

//require('./bootstrap.css');

module.exports = React.createClass({
    displayName: 'Content',
    getInitialState: function() {
        return {loggedIn: false};
    },

    render: function () {
        var self = this;
        if(!self.state.loggedIn)
        {
            return (<div><Login loggedInCallback={function(userName){
                self.setState({loggedIn:true});
                self.setState({userName:userName});
            }}/></div>)
        } else
        {
            return (<div><Scorer username={this.state.userName}/></div>)
        }

    }

});