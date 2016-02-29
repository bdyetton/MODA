var Stager = require('./Stager');
var Marker = require('./Marker');
var rb = require('react-bootstrap');

module.exports = React.createClass({
  displayName: 'Scorer',

  getInitialState: function() {
    return {
      markerType: "spindles",
      noMarkerChecked:false,
      currentRemImage: this.props.image.url,
      slothmode: this.props.sme,
      markers: {} ,
      stage: this.props.image.stage,
      markerIndex: parseInt(this.props.image.markerIndex) || 0,
      msg:this.props.image.msg,
      numMarkers: 0,
      screenSizeValid: true,
      confCounter:0
    };
  },

  componentDidMount: function() {
    var self = this;
    var widthOfPannel = ReactDOM.findDOMNode(self.refs.grandPanel).offsetWidth;
    var widthOfImg = 500;//ReactDOM.findDOMNode(self.refs.sigImg).offsetWidth;
    if (widthOfPannel < widthOfImg){
      self.setState({screenSizeValid: false});
    }
    self.populateMarkers(this.props.image.markers);
  },

  getPreviousRemImage: function() {
    var self = this;
    $.get('/api/previousRemImage', {user: this.props.user}, function(data){
      self.setState({ currentRemImage: data.image.url, msg:data.image.msg, stage:data.stage});
      self.populateMarkers(data.markers);
      //TODO get the batch/image number so i can unactoivate the previous epoch button
    });
  },

  getNextRemImage: function() {
    var self = this;
    $.get('/api/nextRemImage', {user: this.props.user}, function(data){
      self.setState({ currentRemImage: data.image.url, msg:data.image.msg, stage:data.stage});
      self.populateMarkers(data.markers);
    });
  },

  updateMarkerState: function(markerData){
    var self = this;
    $.get('/api/updateMarkerState', {marker:markerData, user: this.props.user}, function(data){
      if (!data.success){
        console.log('Error saving marker');
      }
    }).fail(function(xhr, textStatus, errorThrown){
      console.log('Error saving marker');
    });
  },

  populateMarkers: function(markers) {
    var popMarkers = {};
    var self = this;
    this.setState({noMarkerChecked: false}); //TODO pull from server
    var scoreImg = $(this.refs.sigImg);
    if (markers != undefined) {
      markers.forEach(function (marker) {
        if (marker.deleted === 'true') {
          return;
        }
        if (marker.type==='box') {
          var newMarker = <Marker
            key={parseInt(marker.markerIndex)}
            markerIndex={parseInt(marker.markerIndex)}
            x={parseInt(marker.x)+parseInt(marker.w)}
            w={parseInt(marker.w)}
            y={0}
            h={scoreImg.height()}
            conf={marker.conf}
            confActive={marker.confActive==='true'}
            decrementConfCounter={self.decrementConfCounter}
            removeMarker={self.removeMarker}
            updateMarkerState={self.updateMarkerState}
            />;
          popMarkers[marker.markerIndex] = newMarker;
        }
      });
      this.setState({
        markers: popMarkers,
        numMarkers: markers.length,
        confCounter: 0
      });
    }
  },

  decrementConfCounter: function(){
    this.setState({confCounter:this.state.confCounter-1});
  },

  addMarker: function(e) {
    var self = this;
    if (e.button !== 0) return;
    var scoreImg = $(this.refs.sigImg);
    var newMarker = <Marker
      key={self.state.markerIndex}
      markerIndex={self.state.markerIndex}
      x={e.pageX-scoreImg.offset().left}
      y={0}
      h={scoreImg.height()}
      removeMarker={self.removeMarker}
      decrementConfCounter={self.decrementConfCounter}
      updateMarkerState={self.updateMarkerState}
      />;
    var markers = self.state.markers;
    markers[self.state.markerIndex]=newMarker;
    this.setState({
      markers: markers,
      confCounter: self.state.confCounter+1,
      markerIndex: self.state.markerIndex+1,
      numMarkers: self.state.numMarkers+1
    });
  },

  setNoMarkers: function(e){
    if(this.state.noMarkerChecked){
      this.setState({noMarkerChecked: false});
    }
    else{
      this.setState({noMarkerChecked: true})
    }
  },

  removeMarker: function(index){
    var markers = this.state.markers;
    delete markers[index];
    this.setState({markers:markers});
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
    var markers = $.map(this.state.markers, function(marker, index) {
        return [marker]
    });
    if (self.state.screenSizeValid){
      var imgAndMarkers =  (<div className='row channels' style={{position:'relative'}}>
        {markers}
        <img ref='sigImg' src={function(){
              if(self.state.sme){
                return window.location.href + (self.state.currentRemImage)}
              else{
                return self.state.currentRemImage
              }}()} alt='remImage' onClick={this.addMarker} pointer-events='none'></img>
      </div>)
    } else {
      var imgAndMarkers = (<p style={{color:'#F00'}}>ERROR: Your screen size is too small for valid scoring, please increase your screen resolution or move to a larger device</p>)
    }
    return (
      <div className='container' style={{textAlign:'center', position:'absolute', left:'50%', top: '50%',  transform: 'translateY(-50%) translateX(-50%)'}}>
        <rb.Panel bsStyle="primary" className="grand-panel" ref='grandPanel' textAlign='center' header="MODA - Massive Online Data Annotation">
          <rb.ListGroup fill style={{margin:'10px'}}>
            <rb.ListGroupItem>Channel 1</rb.ListGroupItem>
            <rb.ListGroupItem>
              {imgAndMarkers}
            </rb.ListGroupItem>
            <rb.ListGroupItem>
              <div className='row' style={{position:'relative',textAlign:'center'}}>
                <rb.ButtonToolbar>
                  <rb.ButtonGroup className='pull-left'>
                    <rb.Button bsStyle="primary" ref='previous' onClick={self.getPreviousRemImage}>Previous Epoch</rb.Button>
                  </rb.ButtonGroup>
                  <rb.ButtonGroup style={{textAlign:'center', position:'absolute', left:'50%', top: '50%',  transform: 'translateY(-50%) translateX(-50%)'}}>
                    <Stager stage={self.state.stage} changeStage={self.changeStage}/>
                  </rb.ButtonGroup>
                  <rb.ButtonGroup className='pull-right'>
                    <rb.Button bsStyle="primary" ref='next'
                               disabled={!((self.state.noMarkerChecked || markers.length>0) && self.state.confCounter===0)}
                               onClick={self.getNextRemImage}>Next Epoch</rb.Button>
                  </rb.ButtonGroup>
                </rb.ButtonToolbar>
              </div>
            </rb.ListGroupItem>
            <rb.Input type="checkbox" ref='noMarkers'
                      checked={self.state.noMarkerChecked}
                      label={'No '+self.state.markerType+' in epoch'}
                      onClick={self.setNoMarkers}/>
          </rb.ListGroup>
        </rb.Panel>
        <p>{self.state.msg == 'ok' ? '' : self.state.msg}</p>
      </div>
    );
  }
});

//<p>Now logged in as {self.props.user}</p><p>Epoch ID: {self.state.currentRemImage}</p>
//<Stager stage={self.state.stage} changeStage={self.changeStage}/>