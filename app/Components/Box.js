var React = require('react');
var $ = require('jquery');
//http://stackoverflow.com/questions/20926551/recommended-way-of-making-react-component-div-draggable
module.exports = React.createClass({
  displayName: 'Box',
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
      rel: null // position relative to the cursor
    }
  },

  componentDidMount: function(){
    var initPos = $(this.getDOMNode()).offset();
    this.setState({initial:{
      x: initPos.left - this.props.initialPos.x,
      y: initPos.top - this.props.initialPos.y
    }})
    this.onMouseDown();
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
    console.log('Mouse Down');
    // only left mouse button
    if (e.button !== 0) return;
    var currentPos = $(this.getDOMNode()).offset();
    this.setState({
      dragging: true,
      posOfClick:{
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
    console.log('pos of click');
    console.log(this.state.posOfClick);
    console.log('pos at click');
    console.log(this.state.posAtClick);
    e.stopPropagation();
    e.preventDefault();
  },

  onMouseUp: function (e) {
    console.log('Mouse Up');
    console.log(this.state.currentPos);
    this.setState({dragging: false});
    e.stopPropagation();
    e.preventDefault();
  },

  onMouseMove: function (e) {
    console.log('Mouse Move');
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

    console.log(move);
    console.log(currentPos);
    console.log(this.state.initial);
    e.stopPropagation();
    e.preventDefault();
  },
  render: function () {
    return <div {...this.props} onMouseDown={this.onMouseDown}
      style={{
        width:'100px',
        height:'100px',
        position: 'absolute',
        left: this.state.currentPos.x + 'px',
        top: this.state.currentPos.y + 'px',
        border: '2px solid #0d0',
        padding: '10px'
      }}></div>
  }
});