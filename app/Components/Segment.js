var React = require('react');
var $ = require('jquery');
//http://stackoverflow.com/questions/20926551/recommended-way-of-making-react-component-div-draggable
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
      rel: null // position relative to the cursor
    }
  },

  componentDidMount: function(){
    var initPos = $(this.getDOMNode()).offset();
    this.setState({initial:{
      x: initPos.left - this.props.initialPos.x,
      y: initPos.top - this.props.initialPos.y
    }});
  },
  // we could get away with not having this (and just having the listeners on
  // our div), but then the experience would be possibly be janky. If there's
  // anything w/ a higher z-index that gets in the way, then you're toast,
  // etc.
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
      var currentPos = $(this.getDOMNode()).offset();
      this.setState({
        dragging: true,
        posOfClick: {
          x: e.pageX,
          y: e.pageY
        },
        posRel: {
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
        this.props.removeMarker(this.state.index);
      return
    }
  },

  onMouseUp: function (e) {
    this.setState({dragging: false});
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

    this.setState({
      move: move,
      currentPos: currentPos
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
        left: this.state.currentPos.x + 'px',
        border: '3px solid #0d0',
      }}></div>
  }
});