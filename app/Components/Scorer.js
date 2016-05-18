var Stager = require('./Stager');
var Marker = require('./Marker');
var Instructions = require('./Instructions');
var rb = require('react-bootstrap');
var pannelMargin = 10;
var listMargin = 15;
module.exports = React.createClass({
  displayName: 'Scorer',

  //TODO Sets and batches randomization
  //Mturk response
  //test if complete

  getInitialState: function() {
    return {
      markerType: "box",
      noMarkerChecked:false,
      slothmode: this.props.sme,
      markers: {},
      gsMarkers: {},
      imgMeta: this.props.image,
      markerIndex: parseInt(this.props.image.markerIndex) || 0,
      msg:this.props.image.msg,
      showGSMarkers: false,
      screenSizeValid: true,
      approxDpi: 'low_dpi',
      confCounter:0,
      showInst: this.props.showInstructions,
      widthOfImg: 900
    };
  },

  componentDidMount: function(){
    window.addEventListener('resize', this.checkScreen);
    this.checkScreenWithTimeout();
  },

  checkScreenWithTimeout: function(){
    var self = this;
    if (ReactDOM.findDOMNode(self.refs.sigImg).offsetWidth>0) {
      if(self.checkScreen()) {
        self.populateMarkers(self.props.image.markers);
        self.populateGSMarkers(self.props.image.gsMarkers);
      }
    } else {
      setTimeout(this.checkScreenWithTimeout, 0);
      return false;
    }
  },

  checkScreen: function(){
    var self=this;
    var widthOfPanel = ReactDOM.findDOMNode(self.refs.grandPanel).offsetWidth;
    var widthOfImgLowDpi = 900;
    var widthOfImgHighDpi = 1463;
    if (widthOfPanel - 2*(pannelMargin+listMargin) < widthOfImgLowDpi) {
      self.setState({screenSizeValid: false});
      return false;
    } else if(widthOfPanel - 2*(pannelMargin+listMargin) < widthOfImgHighDpi)  {
      self.setState({screenSizeValid: true, approxDpi:'low_dpi'});
      return true;
    } else {
      self.setState({screenSizeValid: true, approxDpi:'high_dpi'});
      return true;
    }
  },

  getPreviousRemImage: function() {
    var self = this;
    $.get('/api/previousRemImage', {user: this.props.userData.userName}, function(data){
      self.setState({ imgMeta: data.image, showGSMarkers: false},
        function(){
          self.populateMarkers(data.image.markers);
          self.populateGSMarkers(data.image.gsMarkers);
        });
    });
  },

  getNextRemImage: function() {
    var self = this;
    $.get('/api/nextRemImage', {user: this.props.userData.userName}, function(data) {
      self.setState({ imgMeta: data.image, showGSMarkers: false},
        function(){
          self.populateMarkers(data.image.markers);
          self.populateGSMarkers(data.image.gsMarkers);
        });
    });
  },

  submitHit: function() {
    $.get('/api/submitHit', {user: this.props.userData.userName}, function(data) {
      self.getNextRemImage();
    });
  },

  compareToGS: function(markerData){
    var self = this;
    var showGS = this.state.showGSMarkers;
    self.setState({showGSMarkers:!showGS});
    if (!showGS) {
      $.get('/api/compareToGS', {user: this.props.userData.userName}, function (data) {
        self.populateMarkers(data.image.markers);
      }).fail(function (xhr, textStatus, errorThrown) {
        console.log('Error comparing markers to gs');
      });
    }
  },

  updateMarkerState: function(markerData){
    var self = this;
    $.get('/api/updateMarkerState', {marker:markerData, user: this.props.userData.userName}, function(data){
      if (!data.success){
        console.log('Error saving marker');
      }
    }).fail(function(xhr, textStatus, errorThrown){
      console.log('Error saving marker');
    });
  },

  updateNoMakers: function(){
    var self = this;
    $.get('/api/updateNoMakers', {noMarkers: this.state.imgMeta.noMarkers, user: self.props.userData.userName}, function(data){
      if (!data.success){
        console.log('Error saving meta');
      }
    }).fail(function(xhr, textStatus, errorThrown){
      console.log('Error saving meta');
    });
  },

  populateMarkers: function(markers) {
    var popMarkers = {};
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
            inited={marker.inited==='true'}
            x={parseInt(marker.x)}
            w={parseInt(marker.w)}
            y={0}
            h={scoreImg.height()}
            conf={marker.conf}
            confActive={marker.confActive==='true'}
            decrementConfCounter={self.decrementConfCounter}
            removeMarker={self.removeMarker}
            updateMarkerState={self.updateMarkerState}
            match={marker.match}
            matchMessage={marker.matchMessage}
            />;
        }
      })}
      this.setState({
        markers: popMarkers,
        confCounter: 0
      });
  },

  populateGSMarkers: function(markers) {
    var popGSMarkers = {};
    var scoreImg = $(this.refs.sigImg);
    if (markers != undefined) {
      markers.forEach(function (marker) {
        if (marker.type === 'box') {
          markers.forEach(function (marker) {
            popGSMarkers[marker.markerIndex] = <Marker
              key={parseInt(marker.markerIndex)}
              conf={marker.conf}
              inited={true}
              x={parseInt(marker.x)}
              w={parseInt(marker.w)}
              y={0}
              h={scoreImg.height()}
              gs={true}
              />;
          });
        }
      })};
      this.setState({
        gsMarkers: popGSMarkers,
      });
  },

  decrementConfCounter: function(){
    this.setState({confCounter:this.state.confCounter-1});
  },

  addMarker: function(e) {
    var self = this;
    if (e.button !== 0) return;
    var scoreImg = $(this.refs.sigImg);
    var offsetFromPannel = ReactDOM.findDOMNode(self.refs.sigImg).offsetLeft;
    e.persist();
    if (self.state.markerType==='box') {
      var newMarker = <Marker
        initAsResizing={{enable:true,direction:'x',event:e}}
        key={self.state.markerIndex}
        markerIndex={self.state.markerIndex}
        x={e.pageX-scoreImg.offset().left+offsetFromPannel}
        y={0}
        h={scoreImg.height()}
        removeMarker={self.removeMarker}
        decrementConfCounter={self.decrementConfCounter}
        updateMarkerState={self.updateMarkerState}
        clickEvent={e}
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
      self.setState({imgMeta:$.extend(self.state.imgMeta,{noMarkers: false})}, self.updateNoMakers);
    }
    else{
      self.setState({imgMeta:$.extend(self.state.imgMeta,{noMarkers: true})}, self.updateNoMakers);
    }
  },

  removeMarker: function(index){
    var markers = this.state.markers;
    delete markers[index];
    this.setState({markers:markers});
  },

  //changeStage: function(stage){
  //  this.setState({imgMeta:$.extend(this.state.imgMeta,{stage: stage})},this.updateImgMeta);
  //},

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
      var imgAndMarkers =  (<div className='row channels' style={{position:'relative', margin:'20px'}}>
        {markers}
        {self.state.showGSMarkers ? gsMarkers : []}
        <img ref='sigImg' src={function(){
              if(self.state.sme){
                return window.location.href + (self.state.currentRemImage)}
              else{
                return 'img/' + self.state.approxDpi + '/' + self.state.imgMeta.filename
              }}()} alt='remImage' onMouseDown={this.addMarker} pointer-events='none'></img>
      </div>)
    } else {
      var imgAndMarkers = (<p style={{color:'#F00'}}>ERROR: Your screen size is too small for valid scoring, please increase your screen resolution or move to a larger device</p>)
    }

    return (
      <div className='container' style={{textAlign:'center', width:'95%', position:'absolute', left:'50%', top: '50%',  transform: 'translateY(-50%) translateX(-50%)'}}>
        <rb.Panel bsStyle="primary" className="grand-panel" ref='grandPanel' textAlign='center' header={
            <div>
              <h4>MODA: Massive Online Data Annotation</h4>
              <div className='pull-left' style={{position:'relative',top:'-36px'}}>
                <Instructions showInst={self.state.showInst} openInst={self.openInst} closeInst={self.closeInst}/>
              </div>
              <div className='pull-right' style={{color:'rgb(102, 255, 102)', position:'relative' ,top:'-30px',marginLeft:'5px'}}>{'Epoch '+ (self.state.imgMeta.idx+1) + ' of ' + (self.state.imgMeta.idxMax+1)}</div>
              {JSON.parse(self.state.imgMeta.prac) ?
                <div className='pull-right' style={{color:'rgb(102, 255, 102)', position:'relative' ,top:'-30px'}}>Practice Mode:</div>
                : [] }
           </div>}>
          <rb.ListGroup fill style={{margin:listMargin+'px'}}>
            <rb.ListGroupItem style={{marginBottom:'80px', marginTop:'80px'}}>
              {imgAndMarkers}
            </rb.ListGroupItem>
            <rb.ListGroupItem>
              <div className='row' style={{position:'relative',textAlign:'center'}}>
                <rb.ButtonToolbar>
                  <rb.ButtonGroup className='pull-left'>
                    <rb.Button bsStyle="primary"
                               ref='previous'
                               onClick={self.getPreviousRemImage}
                               disabled={self.state.msg == 'firstEpoch'}> {self.state.imgMeta.idx == 0 ? 'This is the first epoch' : 'Previous Epoch'}
                    </rb.Button>
                  </rb.ButtonGroup>
                  <rb.ButtonGroup style={{textAlign:'center', position:'absolute', left:'50%', top: '50%',  transform: 'translateY(-50%) translateX(-50%)'}}>
                    <rb.Input type="checkbox" ref='noMarkers'
                              disabled={markers.length!==0}
                              checked={JSON.parse(self.state.imgMeta.noMarkers)}
                              label={'No spindles in epoch'}
                              onChange={self.setNoMarkers}/>
                  </rb.ButtonGroup>
                  <rb.ButtonGroup className='pull-right'>
                    {self.state.imgMeta.prac==='true' ?
                      <rb.Button bsStyle='warning' //TODO make custom style
                                 onClick={self.compareToGS}>Toggle correct markers</rb.Button>
                      : []}
                    {self.state.imgMeta.idx!==self.state.imgMeta.idxMax ?
                      <rb.Button bsStyle="primary" ref='next'
                                   /*disabled={!(JSON.parse(self.state.imgMeta.noMarkers) || (markers.length>0 && self.state.confCounter===0) || self.state.showGSMarkers)}*/
                                   onClick={self.getNextRemImage}>{'Next Epoch'}
                      </rb.Button> :
                      <rb.Button bsStyle="warning" ref='next'
                                   disabled={!(JSON.parse(self.state.imgMeta.noMarkers) || (markers.length>0 && self.state.confCounter===0) || self.state.showGSMarkers)}
                                   onClick={self.submitHit}>{'Submit Completed HIT'}
                      </rb.Button>}
                  </rb.ButtonGroup>
                </rb.ButtonToolbar>
              </div>
            </rb.ListGroupItem>
          </rb.ListGroup>
        </rb.Panel>
      </div>
    );
  }
});

//<p>Now logged in as {self.props.user}</p><p>Epoch ID: {self.state.currentRemImage}</p>
//<Stager stage={self.state.stage} changeStage={self.changeStage}/>