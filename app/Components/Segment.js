var React = require('react');
var $ = require('jquery');

module.exports = React.createClass({
  displayName: 'Segment',
  getDefaultProps: function () {
    return {
      // allow the initial position to be passed in as a prop
      initialPos: {x: 0, y: 0}
    }
  },
  getInitialState: function () {
    return {
      currentPos: this.props.initialPos,
      dragging: false,
      index: this.props.index,
      rel: null, // position relative to the cursor
      deleted:false,
      type:'seg',
      saved: this.props.saved || false
    }
  },

  componentDidMount: function(){
    var initPos = $(reactDOM.findDOMNode(this)).offset();
    this.setState({
      initial:{
        x: initPos.left - this.props.initialPos.x,
        y: initPos.top - this.props.initialPos.y
      },
      img:{
        x:this.props.scoreImg.offset().left,
        y:this.props.scoreImg.offset().top
      },
      relToImg:{
        x:this.props.initialPos.x,
        y:this.state.currentPos.y-this.props.scoreImg.offset().top
      }
    });

    if (!this.state.saved) {
      this.setState({saved:true},function() {
        this.props.updateServerState(this.state);
      });
    }
  },

  componentDidUpdate: function (props, state) {
    if (this.state.dragging && !state.dragging) {
      document.addEventListener('mousemove', this.onMouseMove);
      document.addEventListener('mouseup', this.onMouseUp);
    } else if (!this.state.dragging && state.dragging) {
      document.removeEventListener('mousemove', this.onMouseMove);
      document.removeEventListener('mouseup', this.onMouseUp);
    }
  },

  // calculate relative position to the mouse and set dragging=true
  onMouseDown: function (e) {
    //if (e=undefined){
    //  e = this.props.masterE;
    //}
    if (e.button == 0) { // only left mouse button
      var currentPos = $(reactDOM.findDOMNode(this)).offset();
      this.setState({
        dragging: true,
        posOfClick: {
          x: e.pageX,
          y: e.pageY
        },
        posRelToMarker: {
          x: e.pageX - currentPos.left,
          y: e.pageY - currentPos.top
        },
        posAtClick: {
          x: currentPos.left,
          y: currentPos.top
        }
      });
      e.stopPropagation();
      e.preventDefault();
    }
    if (e.button == 2){ //Delete box
      this.setState({deleted:true},function() {
        this.props.updateServerState(this.state);
        this.props.removeMarker(this.state.index);
      });
    }
  },

  onMouseUp: function (e) {
    this.setState({dragging: false});
    this.props.updateServerState(this.state);
    e.stopPropagation();
    e.preventDefault();
  },

  onMouseMove: function (e) {
    if (!this.state.dragging) return;
    var move = {
        x: e.pageX - this.state.posOfClick.x,
        y: e.pageY - this.state.posOfClick.y
      };

    var currentPos = {
        x: this.state.posAtClick.x + move.x-this.state.initial.x,
        y: this.state.posAtClick.y + move.y-this.state.initial.y
      };

    var relToImg ={
      x: e.pageX - this.state.img.x,
      y: e.pageY - this.state.img.y,
    };

    this.setState({
      move: move,
      currentPos: currentPos,
      relToImg: relToImg
    });

    e.stopPropagation();
    e.preventDefault();
  },
  render: function () {
    return <div {...this.props} onMouseDown={this.onMouseDown}
      style={{
        width:'2px',
        height:this.props.scoreImg.height(),
        position: 'absolute',
        left: this.state.currentPos.x - 3 + 'px', //-3 because we want segment at middle of click.
        border: '3px solid #0d0',
      }}></div>
  }
});