var React = require('react');
var $ = require('jquery');
var Segment = require('./Segment');

module.exports = React.createClass({
    displayName: 'Scorer',

    getInitialState: function() {
        return { currentRemImage: this.props.img.url, markers: {} , markerIndex: this.props.img.markerIndex || 0, msg:this.props.img.msg};
    },

    componentDidMount: function() {
        this.populateMarkers(this.props.img.markers);
    },

    getPreviousRemImage: function() {
        var self = this;
        $.get('/api/previousRemImage', {user: this.props.user}, function(data){
          self.setState({ currentRemImage: data.image.url, msg:data.image.msg});
          self.populateMarkers(data.markers);
        });
    },

    getNextRemImage: function() {
        var self = this;
        $.get('/api/nextRemImage', {user: this.props.user}, function(data){
          self.setState({ currentRemImage: data.image.url, msg:data.image.msg});
          self.populateMarkers(data.markers);
        });
    },

    updateServerState: function(markerData){
        var self = this;
        $.get('/api/updateMarkerState', {marker:markerData, user: this.props.user}, function(data){
            if (!data.success){
              console.log('Error saving marker');
            }
        }).fail(function(xhr, textStatus, errorThrown){
          alert('Oh Snap! Something went horribly wrong saving the data, please refresh the page');
        });
    },

    populateMarkers: function(markers) {
      var popMarkers = {};
      var self = this;
      var scoreImg = $(this.refs.sigImg.getDOMNode());
      markers.seg.forEach(function(marker){
        if (marker.deleted=='true') {return; }
        var newMarker = <Segment
          initialPos={marker.currentPos}
          className='box'
          scoreImg={scoreImg}
          key={marker.index}
          index={marker.index}
          saved={true}
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
      var newMarker = <Segment initialPos={{x: e.pageX-scoreImg.offset().left, y: scoreImg.offset().top}}
                        className='box'
                        scoreImg={scoreImg}
                        key={self.state.markerIndex}
                        index={self.state.markerIndex}
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
            <div><p>Now logged in as {self.props.user}</p><p>Epoch ID: {self.state.currentRemImage}</p>
            <div style={{position:'relative'}}>
                {this.state.markers}
                <img ref='sigImg' src={window.location.href + (self.state.currentRemImage)} alt='remImage' onClick={this.addMarker} pointer-events='none'></img>
            </div>
            <input ref='previous' type='button' onClick={self.getPreviousRemImage } value='Previous Epoch'></input>
            <input ref='next' type='button' onClick={self.getNextRemImage} value='Next Epoch'></input>
            <p>{self.state.msg == 'ok' ? '' : self.state.msg}</p>
            </div>
        );
    }

});
