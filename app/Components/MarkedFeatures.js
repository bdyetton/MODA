var React = require('react');
var $ = require('jquery');

module.exports = React.createClass({
    displayName: 'MarkedFeatures',

    getInitialState: function() {
        return {locs: [], saveComplete:false}
    },

    componentWillMount: function() {
        var self = this;
        //self.props.imageHandle.getDOMNode().onmousedown = self.moveBox;
        //self.props.imageHandle.getDOMNode().onmouseup = self.moveComplete; //change state or something....
    },

    saveLocations: function() {
        var self = this;
        $.get('/api/saveLocations', self.state.locs,function(data){
            self.setState({ saveComplete: data.saved });
        });
    },

    moveBox: function() {
        var self = this;
    },

    removeBox: function() {
        var self = this;
    },

    render: function () {
        var self = this;
        return (
        <div>{self.state.locs.forEach(function(loc){
            return loc;
        })}
        </div>
        );
    }

});
