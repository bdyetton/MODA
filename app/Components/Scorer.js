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
    var d = new Date();
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
      numMarkers: 0,
      numGSMarkers:0,
      imgFirstShown:d.getTime(),
      viewedImgs:[],
      errorMsg:undefined
    };
  },

  componentDidMount: function(){
    window.addEventListener('resize', this.checkScreen);
    window.addEventListener("keydown", this.handleKey, true);
    this.checkScreenWithTimeout();
  },

  handleKey: function(event) {
    var self = this;
    if (event.keyCode === 81) { //q pressed
      if(!(parseInt(self.state.imgMeta.idx)===0 ||
        self.state.confCounter > 0 ||
        self.state.HITsComplete)) {
        this.getPreviousRemImage();
      }
    } else if (event.keyCode === 69) { //e pressed
      if (!self.isWindowNotComplete() && (self.state.imgMeta.idx!==self.state.imgMeta.idxMax)) {
        this.getNextRemImage();
      }
    } else if (event.keyCode === 83) { //s pressed
      if (self.state.numMarkers === 0) {
        this.setNoMarkers();
      }
    } else {
      return;//Do nothing, let event propagate
    }
    event.stopPropagation();
    event.preventDefault();
  },

  checkScreenWithTimeout: function(){
    var self = this;
    if (ReactDOM.findDOMNode(self.refs.sigImg).offsetWidth>0) {
      if(self.checkScreen()) {
        self.populateMarkers(self.props.image.markers);
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
    this.getRemImg(-1);
  },

  getNextRemImage: function() {
    this.getRemImg(1);
  },

  getRemImg: function(inc){
    var self = this;
    var d = new Date();
    var errorMsg = 'Error getting window';
    $.get('/api/getRemImage', {user: this.props.userData.userName, inc:inc}, function(data) {
      if (!data.success){
        self.setState({errorMsg:errorMsg});
        console.log(errorMsg);
      } else {
        var viewedImgs = self.state.viewedImgs;
        viewedImgs.push(data.image.filename);
        self.setState({
            imgMeta: data.image,
            showGSMarkers: false,
            imgFirstShown: d.getTime(),
            viewedImgs: viewedImgs
          },
          function () {
            self.redrawMarkers()
          });
      }
    }).fail(function (xhr, textStatus, errorThrown) {
          console.log(errorMsg);
    });
  },

  submitHit: function() {
    var self = this;
    var errorMsg = 'Error saving HIT data. Try again.';
    $.get('/api/submitHit', {user: this.props.userData.userName}, function(data) {
      if (!data.success){
        self.setState({errorMsg:errorMsg});
        console.log(errorMsg);
      } else {
        if (self.props.userData.userType === 'other') {
          if (self.state.imgMeta.setsCompleted === self.state.imgMeta.setsMax) {
            self.setState({HITsComplete: true, showSubmit: false, viewedImgs: []});
          } else {
            self.setState({showSubmit: false, viewedImgs: []});
          }
          self.getRemImg(0)
        } else {
          if (self.state.imgMeta.prac) {
            self.setState({showSubmit: false});
            self.getNextRemImage()
          } else {
            self.setState({HITsComplete: true, viewedImgs: []});
          }
        }
      }
    }).fail(function (xhr, textStatus, errorThrown) {
          console.log(errorMsg);
    });
  },

  compareToGS: function(markerData){
    var self = this;
    var showGS = this.state.showGSMarkers;
    var errorMsg = 'Error saving comparing markers to gold standard';
    self.setState({showGSMarkers:!showGS},function(){
      if (!showGS) {
        $.get('/api/compareToGS', {user: this.props.userData.userName}, function (data) {
          if (!data.success){
            self.setState({errorMsg:errorMsg});
            console.log(errorMsg);
          } else {
            self.populateMarkers(data.markers);
            self.populateGSMarkers(self.state.imgMeta.gsMarkers);
          }
        }).fail(function (xhr, textStatus, errorThrown) {
          console.log(errorMsg);
        });
      } else {
        self.redrawMarkers()
      }
    });
  },

  updateMarkerState: function(markerData){
    var self = this;
    var d = new Date();
    var errorMsg = 'Error saving marker information.';
    markerData.timeStamp = d.getTime();
    $.get('/api/updateMarkerState', {marker:markerData, user: this.props.userData.userName}, function(data){
      if (!data.success){
        self.setState({errorMsg:errorMsg});
        console.log(errorMsg);
      } else{
        self.setState({imgMeta:data.imgData})
      }
    }).fail(function(xhr, textStatus, errorThrown){
      console.log(errorMsg);
    });
  },

  updateNoMakers: function(){
    var self = this;
    var errorMsg = 'Error updating no marker state.';
    $.get('/api/updateNoMakers', {noMarkers: this.state.imgMeta.noMarkers, user: self.props.userData.userName}, function(data){
      if (!data.success){
        self.setState({errorMsg:errorMsg});
        console.log(errorMsg);
      }
    }).fail(function(xhr, textStatus, errorThrown){
      console.log(errorMsg);
    });
  },

  saveUser: function(){
    var self = this;
    var errorMsg = 'Error saving user data.';
    $.get('/api/saveUser', {user: self.props.userData.userName}, function(data){
      if (!data.success){
        self.setState({errorMsg:errorMsg});
        console.log(errorMsg);
      }
    }).fail(function(xhr, textStatus, errorThrown){
      console.log(errorMsg);
    });
  },

  populateMarkers: function(markers) {
    var popMarkers = {};
    var self = this;
    var scoreImg = $(self.refs.sigImg);
    var numMarkers=0;
    var markersCorrect=0;
    var confCounter = 0;
    var offsetFromPannel = ReactDOM.findDOMNode(self.refs.sigImg).offsetLeft;
    if (markers != undefined) {
      markers.forEach(function (marker) {
        if (marker.deleted === 'true') {
          return;
        }
        numMarkers = numMarkers + 1;
        if (marker.match){
          markersCorrect += 1;
        }
        if (marker.conf==='' || marker.conf===undefined){
          confCounter += 1;
        }
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
          imgFirstShown={marker.imgFirstShown}
          markerCreated={marker.markerCreated}
          confActive={marker.confActive==='true'}
          decrementConfCounter={self.decrementConfCounter}
          removeMarker={self.removeMarker}
          updateMarkerState={self.updateMarkerState}
          match={self.state.showGSMarkers ? marker.match : 'hide'}
          matchMessage={marker.matchMessage}
          />;
      })}
      this.setState({
        markers: popMarkers,
        numMarkers:numMarkers,
        markersCorrect:markersCorrect,
        confCounter: confCounter
      });
  },

  populateGSMarkers: function(markers) {
    var self = this;
    var popGSMarkers = {};
    var numGSMarkers=0;
    var scoreImg = $(self.refs.sigImg);
    var offsetFromPannel = ReactDOM.findDOMNode(self.refs.sigImg).offsetLeft;
    if (markers != undefined) {
        markers.forEach(function (marker) {
          numGSMarkers = numGSMarkers + 1;
          popGSMarkers[marker.markerIndex] = <Marker
            key={parseInt(marker.markerIndex)}
            markerIndex={parseInt(marker.markerIndex)}
            conf={marker.conf}
            inited={true}
            xP={parseFloat(marker.xP)}
            wP={parseFloat(marker.wP)}
            deleted={false}
            imageX={scoreImg.offset().left}
            imageW={scoreImg.width()}
            pannelX={offsetFromPannel}
            y={0}
            h={scoreImg.height()}
            gs={true}
            />;
        });
    }
    this.setState({
      gsMarkers: popGSMarkers,
      numGSMarkers: numGSMarkers
    });
  },

  decrementConfCounter: function(){
    this.setState({confCounter:this.state.confCounter-1});
  },

  addMarker: function(e) {
    if (JSON.parse(this.state.imgMeta.noMarkers)){return;}
    var self = this;
    var d = new Date();
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
        imgFirstShown={self.state.imgFirstShown}
        markerCreated={d.getTime()}
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

  setNoMarkers: function(){
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

  isWindowNotComplete: function(){
    var self = this;
    var nextDisNorm = !(JSON.parse(self.state.imgMeta.noMarkers) ||  //there must be a marker, or no markers set
        (self.state.numMarkers>0 && self.state.confCounter <= 0)) || //All the markers have a conf set
         self.state.HITsComplete || //must not be completed HIT
         self.props.userData.userType==='preview'; //must not be preview mode
    var nextDisPrac = !(JSON.parse(self.state.imgMeta.noMarkers) || (self.state.numMarkers>0 && self.state.confCounter <= 0)) ||
         (self.state.markersCorrect!==self.state.numGSMarkers) ||
         self.state.confCounter > 0 ||
         self.state.HITsComplete || //must not be completed HIT
         self.props.userData.userType==='preview'; //must not be preview mode

    return self.state.imgMeta.prac ? nextDisPrac : nextDisNorm;
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
      return (<div className='row channels' style={{position:'relative', margin:'20px', paddingBottom:'45px'}}>
        {self.state.showGSMarkers ? gsMarkers : []}
        {markers}
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
    var nextDis = self.isWindowNotComplete();
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
                <label>
                  <rb.Input type="checkbox" ref='noMarkers'
                          className='no-markers'
                          disabled={self.state.numMarkers!==0}
                          checked={JSON.parse(self.state.imgMeta.noMarkers)}
                          onClick={self.setNoMarkers}
                          onChange={function(){}}/>
                  <p className={JSON.parse(self.state.imgMeta.noMarkers) ? "no-markers" : "not-no-markers"}>
                    {(self.state.imgMeta.prac && self.state.numGSMarkers===0 && self.state.showGSMarkers) ? <u>No spindles in window</u> : 'No spindles in window'}
                  </p>
                </label>
              </rb.ButtonGroup>
              <rb.ButtonGroup className='pull-right'>
                {JSON.parse(self.state.imgMeta.prac) ?
                  <rb.Button bsStyle='warning' //TODO make custom style
                             onClick={self.compareToGS}>Toggle/Check correct markers</rb.Button>
                  : []}
                {self.state.imgMeta.idx!==self.state.imgMeta.idxMax ?
                    <rb.Button bsStyle="primary" ref='next'
                                 disabled={nextDis}
                                 onClick={self.getNextRemImage}>{'Next Window'}
                    </rb.Button> :
                    <rb.Button bsStyle="warning" ref='submitHit'
                                 disabled={nextDis}
                                 onClick={self.openSubmit}>{'Submit Completed HIT'}
                    </rb.Button>}
              </rb.ButtonGroup>
            </rb.ButtonToolbar>)
  },

  checkForPreview: function() {
      return (this.props.userData.userType === 'preview' ?
        <div style={{position:'relative', left:'50%', width:'800px', transform: 'translateX(-50%)'}}>
          <h4>You are <b style={{color:'red'}}>previewing</b> this HIT. Click accept above.</h4>
          <p className='std-para'>
            <br/><br/>
            In this task you will draw boxes around particular patterns (<i>sleep spindles</i>)
            in brainwaves recorded from sleeping subjects. You must first read the instructions
            and a complete short practice round before HITs will be approved. <br/><br/></p>
        </div>
        : [])
  },

  render: function () {
    var self = this;
    if (self.state.imgMeta.setsCompleted >= self.state.imgMeta.setsMax){
      return (<p className='thank-you-text'>You've completed all available HITs. Thanks for yor help!</p>)
    }
    return (
      <div onKeyDown={this.handleKey} className='container' style={{textAlign:'center', width:'95%', position:'absolute', left:'50%', top: '50%',  transform: 'translateY(-50%) translateX(-50%)'}}>
        {self.checkForPreview()}
        {self.state.errorMsg ? <p>{self.state.errorMsg + " Try refreshing your browser. If the problem persists do not accept any more HITs & contact the Requester for support."}</p> : []}
        <rb.Panel bsStyle="primary" className="grand-panel" ref='grandPanel' textAlign='center' header={
            <div>
             <h4>MODA: Massive Online Data Annotation</h4>
              <div className='pull-left' style={{position:'relative',top:'-36px'}}>
                <Instructions userData={self.props.userData} showInst={self.state.showInst && self.props.userData.userType!=='preview'} openInst={self.openInst} closeInst={self.closeInst}/>
              </div>
              <div className='pull-right' style={{color:'rgb(102, 255, 102)', position:'relative' ,top:'-30px',marginLeft:'15px'}}>{'Window '+ (self.state.imgMeta.idx+1) + ' of ' + (self.state.imgMeta.idxMax+1)}</div>
              {JSON.parse(self.state.imgMeta.prac) ?
                <div className='pull-right'
                     style={{color:'orange', position:'relative' ,top:'-30px'}}><b>Practice Mode:</b>
                </div> :
                <div className='pull-right'
                     style={{color:'orange', position:'relative' ,top:'-30px',marginLeft:'5px'}}>
                     {'HITs Complete: '+ (self.state.imgMeta.setsCompleted)}
                </div>
              }
           </div>}>
          <rb.ListGroup fill style={{margin:listMargin+'px'}}>
            <rb.ListGroupItem style={{marginBottom:'10px', marginTop:'20px'}}>
              {self.state.HITsComplete ?
                self.props.userData.userType==='other' ?
                  <p className='thank-you-text'>All HITs complete, Thank You!</p> : <p className='thank-you-text'>HIT complete, Thank You! Return to Mturk to select more</p>
                : self.drawImageAndMarkers()}
              <div className='row' style={{position:'relative',textAlign:'center'}}>
                {self.drawButtons()}
              </div>
            </rb.ListGroupItem>
          </rb.ListGroup>
          {self.state.showSubmit ? <SubmitHIT showSubmit={self.state.showSubmit}
                                    closeSubmit={self.closeSubmit}
                                    submitHit={self.submitHit}
                                    HITComplete={self.state.HITsComplete}
                                    userData={self.props.userData}
                                    prac={self.state.imgMeta.prac}
                                    viewedImgs={self.state.viewedImgs}/> : []}
          {self.state.imgMeta.prac ? <p className='std-para'>You are currently in <b style={{color:'orange'}}>practice mode. &nbsp;</b>
            This HIT will take longer than subsequent HITs because you are required to complete a practice HIT first (and read the instructions).<br/><br/>
            Please mark spindles by drawing boxes around them. Check you accuracy with the toggle/check button.<br/>
            Position and width must be correct and confidence must be set for each marker before moving to
            the next window. Note that some windows will not contain spindles.</p> : []}
          {self.state.imgMeta.msg ? <p className='std-para text-green'>{self.state.imgMeta.msg}</p> : ''}
        </rb.Panel>
        <p className='std-para text-green'><b style={{color:'red'}}>DISCLAIMER:</b> If you seems to be doing the same windows again and again (and your HIT count in orange at the top is not increasing), then some error has occurred. <br/> Please do not accept more HITs. We are working to fix this bug ASAP.</p>
      </div>
    );
  }
});