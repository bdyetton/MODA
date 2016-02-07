var Box = require('./Box');
var DragBox = require('react-resizable-and-movable');
//import ResizableAndMovable from 'react-resizable-and-movable'
import ResizableAndMovable from '/home/ben/simple-webpack-react-starter/node_modules/react-resizable-and-movable'
var Stager = require('./Stager');
var Button = require('react-bootstrap').Button;
var bootstrap = require('bootstrap');

module.exports = React.createClass({
    displayName: 'Scorer',

    getInitialState: function() {
        return { currentRemImage: this.props.img.url, markers: {} , markerIndex: parseInt(this.props.img.markerIndex) || 0, msg:this.props.img.msg};
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
      var scoreImg = $(this.refs.sigImg);
      markers.seg.forEach(function(marker){
        if (marker.deleted=='true') {return; }
        var newMarker = <Box
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
      var scoreImg = $(this.refs.sigImg);
      var newMarker = <ResizableAndMovable
          key={self.state.markerIndex}
          index={self.state.markerIndex}
          minWidth={20}
          isResizable={{x:true, y:false, xy: false}}
          start={{x: e.pageX-scoreImg.offset().left, y: 0, width: 200, height: scoreImg.height()}}
          customStyle={{background:"#393", opacity: 0.7, textAlign:"center", paddingTop: '20px', border:'1px solid #0d0'}}
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

    dragStart: function(e){
      this.addMarker(e,true);
    },

    dragStop: function(e){
      console.log('Stopping');
      this.addMarker(e,true);
    },

    render: function () {
        var self = this;
        var markers = $.map(this.state.markers, function(value, index) {
            return [value];
        });
        return (
            <div className='container'><p>Now logged in as {self.props.user}</p><p>Epoch ID: {self.state.currentRemImage}</p>
              <div className='row channels' style={{position:'relative'}}>
                  {markers}
                  <img ref='sigImg' src={window.location.href + (self.state.currentRemImage)} alt='remImage' onClick={this.addMarker} pointer-events='none'></img>
              </div>
              <div className='row'>
                <Button bsStyle="primary" ref='previous' type='button' onClick={self.getPreviousRemImage }>Previous Epoch</Button>
                <Stager/>
                <Button bsStyle="primary" ref='next' type='button' onClick={self.getNextRemImage}>Next Epoch</Button>
              </div>
              <p>{self.state.msg == 'ok' ? '' : self.state.msg}</p>
            </div>
        );
    }
});
