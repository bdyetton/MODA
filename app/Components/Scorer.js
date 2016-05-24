var Stager = require('./Stager');
var Marker = require('./Marker');
var SubmitHIT = require('./submitHIT');
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
      screenRes: '900',
      confCounter:0,
      showInst: this.props.showInstructions,
      widthOfImg: 900,
      showSubmit: false,
      HITsComplete: false,
      numMarkers: 0
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

  redrawMarkers: function(){
    var self = this;
    self.populateMarkers(self.state.imgMeta.markers);
    self.populateGSMarkers(self.state.imgMeta.gsMarkers);
  },

  checkScreen: function(){
    var self=this;
    var widthOfPanel = ReactDOM.findDOMNode(self.refs.grandPanel).offsetWidth;
    var availableSpace = widthOfPanel - 2*(pannelMargin+listMargin) - 20; //20 for padding
    if (availableSpace < 900) {
      self.setState({screenSizeValid: false});
      return false;
    } else if(availableSpace < 1013)  {
      self.setState({screenSizeValid: true, screenRes:'900'},function(){
        self.populateMarkers([]);
        setTimeout(self.redrawMarkers, 0);
      });
      return true;
    } else if(availableSpace < 1125)  {
      self.setState({screenSizeValid: true, screenRes:'1013'},function(){
        self.populateMarkers([]);
        setTimeout(self.redrawMarkers, 0);
      });
      return true;
    } else if(availableSpace < 1238)  {
      self.setState({screenSizeValid: true, screenRes:'1125'},function(){
        self.populateMarkers([]);
        setTimeout(self.redrawMarkers, 0);
      });
      return true;
    } else if(availableSpace < 1406)  {
      self.setState({screenSizeValid: true, screenRes:'1238'},function(){
        self.populateMarkers([]);
        setTimeout(self.redrawMarkers, 0);
      });
      return true;
    } else {
      self.setState({screenSizeValid: true, screenRes:'1406'},function(){
        self.populateMarkers([]);
        setTimeout(self.redrawMarkers, 100);
      });
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
    var self = this;
    $.get('/api/submitHit', {user: this.props.userData.userName}, function(data) {
      if (self.props.userData.userType==='other') {
        self.getNextRemImage();
        if (self.state.imgMeta.setsCompleted === self.state.imgMeta.setsMax){
          self.setState({HITsComplete:true, showSubmit:false});
        } else {
          self.setState({showSubmit:false});
        }
      } else {
        self.setState({HITsComplete:true, showSubmit:false});
      }
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
      } else{
        self.setState({imgMeta:data.imgData})
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
    var scoreImg = $(self.refs.sigImg);
    var numMarkers=0;
    var offsetFromPannel = ReactDOM.findDOMNode(self.refs.sigImg).offsetLeft;
    if (markers != undefined) {
      markers.forEach(function (marker) {
        if (marker.deleted === 'true') {
          return;
        }
        if (marker.type==='box') {
          numMarkers = numMarkers + 1;
          popMarkers[marker.markerIndex] = <Marker
            key={parseInt(marker.markerIndex)}
            markerIndex={parseInt(marker.markerIndex)}
            inited={marker.inited==='true'}
            xP={parseFloat(marker.xP)}
            wP={parseFloat(marker.wP)}
            imageX={scoreImg.offset().left}
            imageW={scoreImg.width()}
            pannelX={offsetFromPannel}
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
        numMarkers:numMarkers,
        confCounter: 0
      });
  },

  populateGSMarkers: function(markers) {
    var self = this;
    var popGSMarkers = {};
    var scoreImg = $(self.refs.sigImg);
    var offsetFromPannel = ReactDOM.findDOMNode(self.refs.sigImg).offsetLeft;
    if (markers != undefined) {
      markers.forEach(function (marker) {
        if (marker.type === 'box') {
          markers.forEach(function (marker) {
            popGSMarkers[marker.markerIndex] = <Marker
              key={parseInt(marker.markerIndex)}
              conf={marker.conf}
              inited={true}
              xP={parseFloat(marker.xP)}
              wP={parseFloat(marker.wP)}
              imageX={scoreImg.offset().left}
              imageW={scoreImg.width()}
              pannelX={offsetFromPannel}
              y={0}
              h={scoreImg.height()}
              gs={true}
              />;
          });
        }
      })}
      this.setState({
        gsMarkers: popGSMarkers
      });
  },

  decrementConfCounter: function(){
    this.setState({confCounter:this.state.confCounter-1});
  },

  addMarker: function(e) {
    if (JSON.parse(this.state.imgMeta.noMarkers)){return;}
    var self = this;
    if (e.button !== 0) return;
    var scoreImg = $(this.refs.sigImg);
    var offsetFromPannel = ReactDOM.findDOMNode(self.refs.sigImg).offsetLeft;
    e.persist();
    if (self.state.markerType==='box') {
      var newMarker = <Marker
        initAsResizing={{enable:true, direction:'x', event:e}}
        key={self.state.markerIndex}
        markerIndex={self.state.markerIndex}
        imageX={scoreImg.offset().left}
        imageW={scoreImg.width()}
        clickX={e.pageX}
        pannelX={offsetFromPannel}
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
      numMarkers:self.state.numMarkers+1,
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
    this.setState({markers:markers, numMarkers:this.state.numMarkers-1});
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

  openSubmit: function(){
    this.setState({showSubmit:true});
  },

  closeSubmit: function(){
    this.setState({showSubmit:false});
  },

  drawImageAndMarkers: function(){
      var self = this;
    var markers = $.map(this.state.markers, function(marker, index) {
      return [marker]
    });
    var gsMarkers = $.map(this.state.gsMarkers, function(marker, index) {
      return [marker]
    });
    if (self.state.screenSizeValid){
      return (<div className='row channels' style={{position:'relative', margin:'20px', paddingBottom:'25px'}}>
        {markers}
        {self.state.showGSMarkers ? gsMarkers : []}
        <img ref='sigImg' style={{border:'1px solid #DCDCDC'}} src={function(){
              if(self.state.sme){
                return window.location.href + (self.state.currentRemImage)}
              else{
                return 'img/' + self.state.imgMeta.phase + '/' + self.state.screenRes + '/' + self.state.imgMeta.filename
              }}()} alt='remImage' onMouseDown={this.addMarker} pointer-events='none'></img>
      </div>)
    } else {
      return (<p style={{color:'#F00'}}>ERROR: Your screen size is too small for valid scoring, please increase your browser window size, screen resolution, or move to a larger device</p>)
    }
  },

  drawButtons: function(){
    var self = this;
    return (<rb.ButtonToolbar>
              <rb.ButtonGroup className='pull-left'>
                <rb.Button bsStyle="primary"
                           ref='previous'
                           disabled={parseInt(self.state.imgMeta.idx)===0 || self.state.confCounter > 0 || self.state.HITsComplete}
                           onClick={self.getPreviousRemImage}>
                  {self.state.imgMeta.idx == 0 ? 'This is the first window' : 'Previous Epoch'}
                </rb.Button>
              </rb.ButtonGroup>
              <rb.ButtonGroup style={{textAlign:'center', position:'absolute', left:'50%', top: '50%',  transform: 'translateY(-50%) translateX(-50%)'}}>
                <rb.Input type="checkbox" ref='noMarkers'
                          disabled={self.state.numMarkers!==0}
                          checked={JSON.parse(self.state.imgMeta.noMarkers)}
                          label={'No spindles in window'}
                          onClick={self.setNoMarkers}/>
              </rb.ButtonGroup>
              <rb.ButtonGroup className='pull-right'>
                {self.state.imgMeta.prac==='true' ?
                  <rb.Button bsStyle='warning' //TODO make custom style
                             onClick={self.compareToGS}>Toggle correct markers</rb.Button>
                  : []}
                {self.state.imgMeta.idx!==self.state.imgMeta.idxMax ?
                    <rb.Button bsStyle="primary" ref='next'
                                 disabled={!(JSON.parse(self.state.imgMeta.noMarkers) || (self.state.numMarkers>0 && self.state.confCounter <= 0) || self.state.showGSMarkers) || self.state.HITsComplete || self.props.userData.userType==='preview'}
                                 onClick={self.getNextRemImage}>{'Next Window'}
                    </rb.Button> :
                    <rb.Button bsStyle="warning" ref='next'
                                 disabled={!(JSON.parse(self.state.imgMeta.noMarkers) || (self.state.numMarkers>0 && self.state.confCounter <= 0) || self.state.showGSMarkers) || self.state.HITsComplete}
                                 onClick={self.openSubmit}>{'Submit Completed HIT'}
                    </rb.Button>}
              </rb.ButtonGroup>
            </rb.ButtonToolbar>)
  },

  checkForPreview: function() {
      return (self.props.userData.userType === 'preview' ?
        <div style={{position:'relative', left:'50%', width:'800px', transform: 'translateX(-50%)'}}>
          <p className='std-para'><h4>You are <b style={{color:'red'}}>preveiwing</b> this HIT. Click accept above.</h4>
            <br/><br/>
            In this task you will draw boxes around particular patterns (<i>sleep spindles</i>)
            in brainwaves recorded from sleeping subjects. You must first read the instructions
            and a complete short practice round before HITs will be approved. <br/><br/></p>
        </div>
        : [])
  },

  render: function () {
    var self = this;

    return (
      <div className='container' style={{textAlign:'center', width:'95%', position:'absolute', left:'50%', top: '50%',  transform: 'translateY(-50%) translateX(-50%)'}}>
        {self.checkForPreview()}
        <rb.Panel bsStyle="primary" className="grand-panel" ref='grandPanel' textAlign='center' header={
            <div>
             <h4>MODA: Massive Online Data Annotation</h4>
              <div className='pull-left' style={{position:'relative',top:'-36px'}}>
                <Instructions userData={self.props.userData} showInst={self.state.showInst && self.props.userData.userType!=='preview'} openInst={self.openInst} closeInst={self.closeInst}/>
              </div>
              <div className='pull-right' style={{color:'rgb(102, 255, 102)', position:'relative' ,top:'-30px',marginLeft:'15px'}}>{'Window '+ (self.state.imgMeta.idx+1) + ' of ' + (self.state.imgMeta.idxMax+1)}</div>
              <div className='pull-right' style={{color:'orange', position:'relative' ,top:'-30px',marginLeft:'5px'}}>{'HITs Complete: '+ (self.state.imgMeta.setsCompleted)}</div>
              {JSON.parse(self.state.imgMeta.prac) ?
                <div className='pull-right' style={{color:'rgb(102, 255, 102)', position:'relative' ,top:'-30px'}}>Practice Mode:</div>
                : [] }
           </div>}>
          <rb.ListGroup fill style={{margin:listMargin+'px'}}>
            <rb.ListGroupItem style={{marginBottom:'20px', marginTop:'20px'}}>
              {self.state.HITsComplete ?
                self.props.userData.userType==='other' ?
                  <p className='thank-you-text'>All HITs complete, Thank You!</p> : <p className='thank-you-text'>HIT complete, Thank You! Return to Mturk to select more</p>
                : self.drawImageAndMarkers()}
              {self.state.showSubmit ? <SubmitHIT showSubmit={self.state.showSubmit} closeSubmit={self.closeSubmit} submitHit={self.submitHit} userData={self.props.userData}/> : []}
              <div className='row' style={{position:'relative',textAlign:'center'}}>
                {self.drawButtons()}
              </div>
            </rb.ListGroupItem>
          </rb.ListGroup>
        </rb.Panel>
      </div>
    );
  }
});