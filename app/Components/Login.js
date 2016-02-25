

module.exports = React.createClass({
    displayName: 'Login',
    getInitialState: function() {
        return {loggedIn: false};
    },

    getUser: function() {
        var self = this;
        var userName = self.refs.User.value;
        $.get('/api/getUser',{user:userName},function(data){
            self.props.updatePage('score',data);
        });
    },

    loggedIn: function(){
        return self.state.loggedIn
    },

    render: function () {
        return (
        <div style={{'text-align':'center', position:'absolute', left:'50%', top: '50%',  transform: 'translateY(-50%) translateX(-50%)'}}>
        <div style={{'font-size':'20'}}><p>Please Login or Create username</p></div>
        <input ref='User' type='text'></input>
        <input ref='Login' type='button' onClick={this.getUser} value='Login/Create username'></input>
        </div>
        );
    }

});
