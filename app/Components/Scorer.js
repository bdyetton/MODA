var React = require('react');
var $ = require('jquery');
var Segment = require('./Segment');

module.exports = React.createClass({
    displayName: 'Scorer',

    getInitialState: function() {
        return { serverData: null, currentRemImage: null, markers: {} , markerIndex: 0};
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

    addMarker: function(e) {
        if (e.button !== 0) return;
        var scoreImg = $(this.refs.sigImg.getDOMNode());
        var newMarker = <Segment initialPos={{x: e.pageX, y: 4}}
                          className='box'
                          scoreImg={scoreImg}
                          key={this.state.markerIndex}
                          index={this.state.markerIndex}
                          style={{ border: '2px solid #0d0', padding: '10px'}}
                          removeMarker={this.removeMarker}
                      />;
        var markers = this.state.markers;
        markers[this.state.markerIndex]=newMarker;
        this.setState({
            markers: markers,
            markerIndex: this.state.markerIndex+1
        });
    },

    removeMarker: function(index){
        var markers = this.state.markers;
        delete markers[index];
        this.setState({markers:markers});
    },

    render: function () { //FIXME Print each key of object, NOT the whole object (will get ride of react warning)
        var self = this;
        return (
            <div><p>Now logged in as {self.props.username}</p>
            <div style={{position:'relative'}}>
                {this.state.markers}
                <img ref='sigImg' src={window.location.href + (self.state.currentRemImage)} alt='remImage' onClick={this.addMarker} pointer-events='none'></img>
            </div>
            <input ref='previous' type='button' onClick={self.getPreviousRemImage } value='Previous Epoch'></input>
            <input ref='next' type='button' onClick={self.getNextRemImage} value='Next Epoch'></input>
            </div>
        );
    }

});
