import ResizableAndMovable from '../../node_modules/react-resizable-and-movable';
var ConfidenceBox = require('./ConfidenceBox');
var rb = require('react-bootstrap');

module.exports = React.createClass({
  displayName: 'Marker',

  getInitialState: function() {
    return {
      conf:this.props.conf || '',
      x:this.props.x-(this.props.w || 50) || 0,
      y:this.props.y || 0,
      w:this.props.w || 100,
      h:this.props.h || 100
    };
  },

  updateConf: function(index,conf){
      this.setState({conf:conf});
      this.props.updateMarkerState(this.state)
  },

  removeMarker: function(){
    this.props.removeMarker(this.props.markerIndex);
  },

  updatePos: function(e, pos){
    var self=this;
    self.setState({x:pos.position.left},function(){self.props.updateMarkerState(self.state)});
  },

  updateSize: function(size){
    var self=this;
    self.setState({w:size.width},function(){self.props.updateMarkerState(self.state)});
  },

  render: function () {
    var self = this;

    var removeButton =
      <div className='gyp-x-holder'>
        <rb.Button className='gyp-x' bsSize='xsmall' onClick={self.removeMarker}>
          <rb.Glyphicon style={{'fontSize': '25px'}} glyph="glyphicon glyphicon-remove-circle" />
        </rb.Button>
      </div>;

    var initialProps={
        key:self.props.markerIndex,
        index:self.props.markerIndex,
        start:{x:self.state.x, y:self.state.y, width:self.state.w, height:self.state.h},
        className:'box_marker',
        minWidth:20,
        isResizable:{x: true, y: false, xy: false},
        moveAxis:'x',
        onResizeStop:self.updateSize,
        onDragStop:self.updatePos,
        customStyle:{background: "rgba(60, 230, 70,0.5)", border: '1p solid #0d0'},
        children:[
          <ConfidenceBox updateConf={self.updateConf} conf={self.state.conf}/>,
          removeButton]
    };

    return <ResizableAndMovable {...initialProps}/>
  }
});

//<p>Now logged in as {self.props.user}</p><p>Epoch ID: {self.state.currentRemImage}</p>
//<Stager stage={self.state.stage} changeStage={self.changeStage}/>