var React = require('react');
var $ = require('jquery');

module.exports = React.createClass({
    displayName: 'Scorer',

    getInitialState: function() {
        return { serverData: null, currentRemImage: null };
    },

    componentWillMount: function() {
        this.getNextRemImage()
    },

    getPreviousRemImage: function() {
        var self = this;
        $.get('/api/previousRemImage', function(data){
            self.setState({ currentRemImage: data.imageURL });
        });
    },

    getNextRemImage: function() {
        var self = this;
        $.get('/api/nextRemImage', function(data){
            self.setState({ currentRemImage: data.imageURL });
        });
    },

    render: function () {
        return (
        <div><p>Now logged in as {this.props.username}</p>
        <div><img src={window.location.href + (this.state.currentRemImage)} alt='remImage'></img></div>
        <input ref='previous' type='button' onClick={this.getPreviousRemImage } value='Previous Epoch'></input>
        <input ref='next' type='button' onClick={this.getNextRemImage } value='Next Epoch'></input>
        </div>
        );
    }

});
