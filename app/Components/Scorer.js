var Box = require('./Box');
import ResizableAndMovable from '../../node_modules/react-resizable-and-movable';
var Stager = require('./Stager');
var ConfidenceBox = require('./ConfidenceBox');
var Button = require('react-bootstrap').Button;
var Input = require('react-bootstrap').Input;
var bootstrap = require('bootstrap');

module.exports = React.createClass({
    displayName: 'Scorer',

    getInitialState: function() {
        return {
          markerType: "spindles",
          noMarkerState:false,
          currentRemImage: this.props.image.url,
          slothmode: this.props.sme,
          markers: {} ,
          stage: this.props.image.stage,
          markerIndex: parseInt(this.props.image.markerIndex) || 0, msg:this.props.image.msg,
          numMarkers: 0
        };
    },

    componentDidMount: function() {
        this.populateMarkers(this.props.image.markers);
    },

    getPreviousRemImage: function() {
        var self = this;
        $.get('/api/previousRemImage', {user: this.props.user}, function(data){
          self.setState({ currentRemImage: data.image.url, msg:data.image.msg, stage:data.stage});
          self.populateMarkers(data.markers);
        });
    },

    getNextRemImage: function() {
        var self = this;
        $.get('/api/nextRemImage', {user: this.props.user}, function(data){
          self.setState({ currentRemImage: data.image.url, msg:data.image.msg, stage:data.stage});
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
          console.log('Error saving marker');
          //alert('Oh Snap! Something went horribly wrong saving the data, please refresh the page');
        });
    },

    populateMarkers: function(markers) {
      var popMarkers = {};
      var self = this;
      var scoreImg = $(this.refs.sigImg);
      this.setState({noMarkerState: false}); //TODO set from server
      if (markers != undefined) {
        markers.seg.forEach(function (marker) {
          if (marker.deleted == 'true') {
            return;
          }
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
          markers: popMarkers,
          numMarkers: markers.seg.length
        });
      }
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
          moveAxis={'x'}
          children={<ConfidenceBox/>}
          start={{x: e.pageX-scoreImg.offset().left, y: 0, width: 200, height: scoreImg.height()}}
          customStyle={{background:"#393", opacity: 0.7, textAlign:"center", paddingTop: '20px', border:'1px solid #0d0'}}
          />;
      var markers = self.state.markers;
      markers[self.state.markerIndex]=newMarker;
      this.setState({
          markers: markers,
          markerIndex: self.state.markerIndex+1,
          numMarkers: self.state.numMarkers+1
      });
    },

    setNoMarkers: function(e){
      if(this.state.noMarkerState){
          this.setState({noMarkerState: false});
      }
      else{
          this.setState({noMarkerState: true})
      }
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

    changeStage: function(stage){
      this.setState({stage:stage});
      $.get('/api/updateStage', {stage:stage, user: this.props.user}, function(data){
          if (!data.success){
            console.log('Error saving stage');
          }
      }).fail(function(xhr, textStatus, errorThrown){
        alert('Oh Snap! Something went horribly wrong saving the stage data, please refresh the page');
      });
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
                  <img ref='sigImg' src={function(){
                    if(self.state.sme){
                      return window.location.href + (self.state.currentRemImage)}
                    else{
                      return self.state.currentRemImage
                    }}()} alt='remImage' onClick={this.addMarker} pointer-events='none'></img>
              </div>
              <div className='row'>
                <Button bsStyle="primary" ref='previous' type='button' onClick={self.getPreviousRemImage }>Previous Epoch</Button>
                <Input type="checkbox" ref='noMarkers' checked={self.state.noMarkerState} label={'No '+self.state.markerType+' in epoch'} onClick={self.setNoMarkers}/>
                <Stager stage={self.state.stage} changeStage={self.changeStage} />
                <Button bsStyle="primary" ref='next' type='button'
                        disabled={!(self.state.noMarkerState || self.state.numMarkers>0)}
                        onClick={self.getNextRemImage}>Next Epoch</Button>
              </div>
              <p>{self.state.msg == 'ok' ? '' : self.state.msg}</p>
            </div>
        );
    }
});
