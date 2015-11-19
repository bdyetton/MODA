var React = require('react');
var $ = require('jquery');

module.exports = React.createClass({
    displayName: 'Login',
    getInitialState: function() {
        return {loggedIn: false};
    },

    getUser: function() {
        var self = this;
        $.get('/api/getUser',{user:'Ben'},function(data){
            self.setState({ currentRemImage: data.imageURL });
        });
        self.props.loggedInCallback('Ben');
    },

    loggedIn: function(){
        return self.state.loggedIn
    },

    render: function () {
        return (
        <div>
        <div><p>Please Login or Create username</p></div>
        <input ref='previous' type='button' onClick={this.getUser} value='Login/Create username'></input>
        </div>
        );
    }

});
