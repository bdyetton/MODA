import ResizableAndMovable from '../../node_modules/react-resizable-and-movable';
var ConfidenceBox = require('./ConfidenceBox');
var MatchBox = require('./MatchBox');
var rb = require('react-bootstrap');

module.exports = React.createClass({
  displayName: 'Marker',

  getInitialState: function() {
    return {
      markerIndex:this.props.markerIndex,
      conf:this.props.conf || '',
      confActive:(this.props.confActive===undefined) ? true : this.props.confActive,
      xP:this.props.xP || (this.props.clickX-this.props.imageX)/this.props.imageW,
      wP:this.props.wP || this.props.w/this.props.imageW,
      type:'box',
      deleted:false,
      gs:this.props.gs || false,
      inited: this.props.inited || false,
      keyTicker: 0
    };
  },

  componentWillMount: function(){
    console.log('Mounting: ', this.props.markerIndex, ' ', this.props.conf);
    if(!this.state.gs){this.props.updateMarkerState(this.state)};
  },

  componentDidMount: function() {
    this.timer = setTimeout(function() {
      var markerRef = this.refs['Marker'+ this.props.markerIndex];
      if (markerRef !== undefined) {
        ReactDOM.findDOMNode(markerRef).focus();
      }
    }.bind(this), 0);
  },

  componentWillUnmount () {
    clearTimeout(this.timer);
  },

  onResizeStop: function(width){

  },

  handleKey: function(event) {
    if (event.keyCode === 39) {
      this.setState({xP:(this.state.xP*this.props.imageW+1)/this.props.imageW, keyTicker:this.state.keyTicker+1});
    } else if (event.keyCode === 37) {
      this.setState({xP:(this.state.xP*this.props.imageW-1)/this.props.imageW, keyTicker:this.state.keyTicker+1});
    } else if (event.keyCode===51){
        this.updateConf('high');
      }
      else if (event.keyCode===50){
        this.updateConf('med');
      }
      else if (event.keyCode===49){
        this.updateConf('low');
      }
      else if (event.keyCode===27 || event.keyCode===46){
        this.removeMarker();
      } else {
        return;//Do nothing, let event propagate
      }
      event.stopPropagation();
      event.preventDefault();
  },


  updateConf: function(conf){
    var self = this;
    if (this.state.conf===''){
      this.props.decrementConfCounter();
    }
    this.setState({conf:conf, confActive:false},function(){
      console.log('writing client side: ', this.props.markerIndex, ' ', conf, ' and at state ',self.state.conf);
      this.props.updateMarkerState(self.state);
    });
  },

  removeMarker: function(){
    var self = this;
    self.setState({deleted:true},function(){
      self.updateConf('');
      self.props.updateMarkerState(self.state);
      self.props.removeMarker(self.props.markerIndex);
    })
  },

  updatePos: function(e, pos){
    var self=this;
    self.setState({xP:(pos.position.left-self.props.pannelX)/self.props.imageW},function(){
      self.props.updateMarkerState(self.state)
    });
  },

  updateSize: function(dir,size){
    var self=this;
    if (!self.state.inited){
      if (size.width>10){
        self.setState({inited:true});
      } else{
        self.removeMarker();
        return
      }
    }
    self.setState({wP:size.width/self.props.imageW}, function(){self.props.updateMarkerState(self.state)});
  },

  getColor: function(){
    if (!this.state.inited){ return "rgba(136, 183, 213, 0.5)"}
    else if (this.state.conf==='high'){ return "rgba(140, 217, 140, 0.7)"}
    else if (this.state.conf==='med'){ return "rgba(255, 204, 102, 0.7)"}
    else if (this.state.conf==='low'){ return "rgba(255, 153, 153, 0.7)"}
    else { return "rgba(136, 183, 213, 0.7)" }
  },

  toggleConf: function(){
    this.setState({confActive:!this.state.confActive});
  },

  render: function () {
    var self = this;

    var removeButton =
      <div key='removeBut' className='remove-gyp-holder'>
        <rb.Button className='gyp-x' bsSize='xsmall' onMouseDown={self.removeMarker}>
          <rb.Glyphicon style={{'fontSize': '18px'}} glyph="glyphicon glyphicon-remove-circle" />
        </rb.Button>
      </div>;

    var initialProps={
        start:{
          x:self.state.xP*self.props.imageW+self.props.pannelX,
          y:0,
          width:self.state.wP*self.props.imageW,
          height:self.props.h},
        minWidth:5,
        isResizable:{x: !self.state.gs, y: false, xy: false},
        initAsResizing: this.state.inited ? {enable: false} : self.props.initAsResizing,
        moveAxis: self.state.gs ? 'none' : 'x', //FIXME implement none value
        onResizeStop:self.updateSize,
        onDragStop:self.updatePos,
        customStyle:{background: self.getColor(), border: self.state.gs ? '2px solid #f0ad4e' : ''},
        children: !self.state.gs ? [ self.state.inited ?
          [<ConfidenceBox key='confBox'
                         tabIndex='0'
                         index={'confBox'+ this.props.markerIndex}
                         ref={'confBox'+ this.props.markerIndex}
                         updateConf={self.updateConf}
                         toggleConf={self.toggleConf}
                         conf={self.state.conf}
                         confActive={self.state.confActive}/>,
          removeButton] : [],
          <MatchBox
            key='MatchBox'
            match={self.props.match}
            matchMessage = {self.props.matchMessage}
          />] :
          <div style={{position:'absolute',
                       color:'#f0ad4e',
                       fontSize:'12',
                       left:'50%',
                       top:'5%',
                       transform: 'translateX(-50%)'
                       }}></div>
    };
    return (<div ref={'Marker'+ this.props.markerIndex}
                 tabIndex='0'
                 onKeyDown={this.handleKey}>
      <ResizableAndMovable
        key={'ResizableAndMovable'+ this.state.keyTicker}
        {...initialProps}
        clickEvent={this.props.clickEvent}/>
    </div>)
  }
});

//<p>Now logged in as {self.props.user}</p><p>Epoch ID: {self.state.currentRemImage}</p>
//<Stager stage={self.state.stage} changeStage={self.changeStage}/>