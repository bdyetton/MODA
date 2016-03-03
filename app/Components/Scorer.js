var Stager = require('./Stager');
var Marker = require('./Marker');
var Instructions = require('./Instructions');
var rb = require('react-bootstrap');

module.exports = React.createClass({
  displayName: 'Scorer',

  getInitialState: function() {
    return {
      markerType: "box",
      noMarkerChecked:false,
      currentRemImage: this.props.image.url,
      slothmode: this.props.sme,
      markers: {},
      gsMarkers: {},
      imgMeta: this.props.image.meta || {noMarkers: false, stage: '', prac: false},
      stage: this.props.image.stage,
      markerIndex: parseInt(this.props.image.markerIndex) || 0,
      msg:this.props.image.msg,
      showGSMarkers: false,
      screenSizeValid: true,
      confCounter:0,
      showInst: false
    };
  },

  componentDidMount: function() {
    var self = this;
    var widthOfPanel = ReactDOM.findDOMNode(self.refs.grandPanel).offsetWidth;
    var widthOfImg = 500;//ReactDOM.findDOMNode(self.refs.sigImg).offsetWidth;
    if (widthOfPanel < widthOfImg){
      self.setState({screenSizeValid: false});
    }
    self.populateMarkers(this.props.image.markers);
  },

  getPreviousRemImage: function() {
    var self = this;
    $.get('/api/previousRemImage', {user: this.props.user}, function(data){
      self.setState({ currentRemImage: data.image.url, msg:data.image.msg, imgMeta: data.image.meta, showGSMarkers: false});
      self.populateMarkers(data.markers);
      //TODO get the batch/image number so i can unactivated the previous epoch button
    });
  },

  getNextRemImage: function() {
    var self = this;
    $.get('/api/nextRemImage', {user: this.props.user}, function(data){
      self.setState({ currentRemImage: data.image.url, msg:data.image.msg, imgMeta: data.image.meta, showGSMarkers: false});
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

  updateImgMeta: function(){
    var self = this;
    $.get('/api/updateImgMeta', {imgMeta:self.state.imgMeta, user: self.props.user}, function(data){
      if (!data.success){
        console.log('Error saving meta');
      }
    }).fail(function(xhr, textStatus, errorThrown){
      console.log('Error saving meta');
    });
  },

  populateMarkers: function(markers) {
    var popMarkers = {};
    var popGSMarkers = {};
    var self = this;
    var scoreImg = $(this.refs.sigImg);
    if (markers != undefined) {
      markers.forEach(function (marker) {
        if (marker.deleted === 'true') {
          return;
        }
        if (marker.type==='box') {
          popMarkers[marker.markerIndex] = <Marker
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
        }
        if (marker.type==='gsbox') {
          popGSMarkers[marker.markerIndex] = <Marker
            key={parseInt(marker.markerIndex)}
            x={parseInt(marker.x)+parseInt(marker.w)}
            w={parseInt(marker.w)}
            y={0}
            h={scoreImg.height()}
            gs={true}
            />;
        }
      });
      this.setState({
        markers: popMarkers,
        gsMarkers: popGSMarkers,
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
    if (self.state.markerType==='box') {
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
    } else {return;} //TODO add line marker
    var markers = self.state.markers;
    markers[self.state.markerIndex]=newMarker;
    this.setState({
      markers: markers,
      confCounter: self.state.confCounter+1,
      markerIndex: self.state.markerIndex+1,
      imgMeta:$.extend(this.state.imgMeta,{noMarkers: false})
    });
  },

  setNoMarkers: function(e){
    var self = this;
    if(self.state.imgMeta.noMarkers){
      self.setState({imgMeta:$.extend(self.state.imgMeta,{noMarkers: false})}, self.updateImgMeta);
    }
    else{
      self.setState({imgMeta:$.extend(self.state.imgMeta,{noMarkers: true})}, self.updateImgMeta);
    }
  },

  removeMarker: function(index){
    var markers = this.state.markers;
    delete markers[index];
    this.setState({markers:markers});
  },

  changeStage: function(stage){
    this.setState({imgMeta:$.extend(this.state.imgMeta,{stage: stage})},this.updateImgMeta);
  },

  openInst: function(){
    this.setState({showInst:true});
  },

  closeInst: function(){
    this.setState({showInst:false});
  },

  render: function () {
    var self = this;
    var markers = $.map(this.state.markers, function(marker, index) {
      return [marker]
    });
    var gsMarkers = $.map(this.state.gsMarkers, function(marker, index) {
      return [marker]
    });
    if (self.state.screenSizeValid){
      var imgAndMarkers =  (<div className='row channels' style={{position:'relative'}}>
        {markers}
        {self.state.showGSMarkers ? gsMarkers : []}
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

    console.log(self.state.imgMeta);

    return (
      <div className='container' style={{textAlign:'center', position:'absolute', left:'50%', top: '50%',  transform: 'translateY(-50%) translateX(-50%)'}}>
        <rb.Panel bsStyle="primary" className="grand-panel" ref='grandPanel' textAlign='center' header={
            <div>
              <h4>MODA: Massive Online Data Annotation</h4>
              <div className='pull-left' style={{position:'relative',top:'-36px'}}>
                <Instructions showInst={self.state.showInst} openInst={self.openInst} closeInst={self.closeInst}/>
              </div>
              {JSON.parse(self.state.imgMeta.prac) ?
                <div className='pull-right' style={{color:'rgb(102, 255, 102)', position:'relative' ,top:'-30px'}}>Practice Mode</div>
                : [] }
            </div>}>
          <rb.ListGroup fill style={{margin:'10px'}}>
            <rb.ListGroupItem>Channel 1</rb.ListGroupItem>
            <rb.ListGroupItem>
              {imgAndMarkers}
            </rb.ListGroupItem>
            <rb.ListGroupItem>
              <div className='row' style={{position:'relative',textAlign:'center'}}>
                <rb.ButtonToolbar>
                  <rb.ButtonGroup className='pull-left'>
                    <rb.Button bsStyle="primary"
                               ref='previous'
                               onClick={self.getPreviousRemImage}
                               disabled={self.state.msg == 'firstEpoch'}> {self.state.msg == 'firstEpoch' ? 'This is the first epoch' : 'Previous Epoch'}
                    </rb.Button>
                  </rb.ButtonGroup>
                  <rb.ButtonGroup style={{textAlign:'center', position:'absolute', left:'50%', top: '50%',  transform: 'translateY(-50%) translateX(-50%)'}}>
                    <Stager stage={self.state.imgMeta.stage} changeStage={self.changeStage}/>
                  </rb.ButtonGroup>
                  <rb.ButtonGroup className='pull-right'>
                    {JSON.parse(self.state.imgMeta.prac) && !self.state.showGSMarkers ?
                      <rb.Button bsStyle='warning' //TODO make custom style
                                 onClick={function(){self.setState({showGSMarkers:true})}}>Show correct markers</rb.Button>
                      : <rb.Button bsStyle="primary" ref='next'
                                   disabled={!(JSON.parse(self.state.imgMeta.noMarkers) || (markers.length>0 && self.state.confCounter===0) || self.state.showGSMarkers)}
                                   onClick={self.getNextRemImage}>{self.state.msg == 'lastEpoch' ? 'This is the last epoch' : 'Next Epoch'}</rb.Button>}
                  </rb.ButtonGroup>
                </rb.ButtonToolbar>
              </div>
            </rb.ListGroupItem>
            <rb.Input type="checkbox" ref='noMarkers'
                      disabled={markers.length!==0}
                      checked={JSON.parse(self.state.imgMeta.noMarkers)}
                      label={'No spindles in epoch'}
                      onChange={self.setNoMarkers}/>
          </rb.ListGroup>
        </rb.Panel>
      </div>
    );
  }
});

//<p>Now logged in as {self.props.user}</p><p>Epoch ID: {self.state.currentRemImage}</p>
//<Stager stage={self.state.stage} changeStage={self.changeStage}/>