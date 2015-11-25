var React = require('react');
var $ = require('jquery');
var Segment = require('./Segment');

module.exports = React.createClass({
    displayName: 'Scorer',

    getInitialState: function() {
        return { serverData: null, currentRemImage: null, markers: {} , markerIndex: 0};
    },

    componentDidMount: function() {
      console.log(this.props.user)
        this.getNextRemImage()
    },

    getPreviousRemImage: function() {
        var self = this;
        $.get('/api/previousRemImage', {user: this.props.user}, function(data){
          self.setState({ currentRemImage: data.imageURL});
          self.populateMarkers(data.markers);
        });
    },

    getNextRemImage: function() {
        var self = this;
        console.log(this.props.user)
        $.get('/api/nextRemImage', {user: this.props.user}, function(data){
          self.setState({ currentRemImage: data.imageURL});
          self.populateMarkers(data.markers);
        });
    },

    updateServerState: function(markerData){
        var self = this;
        $.get('/api/updateMarkerState', {marker:markerData, user: this.props.user}, function(data){
            if (!data.success){
              console.log('Error saving marker');
            }
        });
    },

    populateMarkers: function(markers) {
      console.log(markers);
      var popMarkers = {};
      var self = this;
      var scoreImg = $(this.refs.sigImg.getDOMNode());
      markers.seg.forEach(function(marker){
        var newMarker = <Segment
          initialPos={marker.currentPos}
          className='box'
          scoreImg={scoreImg}
          key={marker.index}
          index={marker.index}
          saved={true}
          style={{ border: '2px solid #0d0', padding: '10px'}}
          removeMarker={self.removeMarker}
          updateServerState={self.updateServerState}
          />;
        popMarkers[marker.index] = newMarker;
      });
      this.setState({
          markers: popMarkers
      });
    },

    addMarker: function(e) {
      var self = this;
      if (e.button !== 0) return;
      var scoreImg = $(this.refs.sigImg.getDOMNode());
      var newMarker = <Segment initialPos={{x: e.pageX-12, y: scoreImg.offset().top}} //TODO why 12?
                        className='box'
                        scoreImg={scoreImg}
                        key={self.state.markerIndex}
                        index={self.state.markerIndex}
                        style={{ border: '2px solid #0d0', padding: '10px'}}
                        removeMarker={self.removeMarker}
                        updateServerState={self.updateServerState}
                    />;
      var markers = self.state.markers;
      markers[self.state.markerIndex]=newMarker;
      this.setState({
          markers: markers,
          markerIndex: self.state.markerIndex+1
      });
    },

    removeMarker: function(index){
        var markers = this.state.markers;
        delete markers[index];
        this.setState({markers:markers});
    },

    render: function () { //FIXME Print each key of object, NOT the whole object (will get rid of react warning)
        var self = this;
        return (
            <div><p>Now logged in as {self.props.user}</p>
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
