import React, {Component, PropTypes} from 'react';
import Draggable from 'react-draggable';
import Resizable from 'react-resizable-box';
import assign from 'react/lib/Object.assign';

export default class DragBox extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isDraggable: true,
      isResizing: false,
    };

  }

  componentDidMount(){
    this.onResizeStart()
  }

  onResizeStart(dir) {
    this.isResizing = true;
    this.setState({isDraggable: false, isResizing:true});

    this.props.onResizeStart();
    //e.stopPropagation();
  }

  onResizeStop(size) {
    this.isResizing = false;
    this.setState({isDraggable: true, isResizing:true});
    this.props.onResizeStop(size);
    //e.stopPropagation();
  }

  onDragStart(e, ui) {
    if (this.isResizing) return;
    this.props.onDragStart(e, ui);
  }

  onDrag(e, ui) {
    if (this.isResizing) return;
    this.props.onDrag(e, ui);
  }

  onDragStop(e, ui) {
    if (this.isResizing) return;
    this.props.onDragStop(e, ui);
  }

  render() {
    const {customClass,
           customStyle,
           onClick,
           onTouchStart,
           minWidth,
           minHeight,
           maxWidth,
           maxHeight,
           start,
           zIndex} = this.props;
    return (
      <Draggable
         axis="x"
         zIndex={zIndex}
         start={{x:start.x, y:start.y}}
         disabled={!this.state.isDraggable}
         onStart={this.onDragStart.bind(this)}
         onDrag={this.onDrag.bind(this)}
         onStop={this.onDragStop.bind(this)} >
        <div style={{
               width:`${start.width}px`,
               height:`${start.height}px`,
               cursor: "move",
               position:'absolute'
             }}>
          <Resizable
             onClick={onClick}
             draggableOpts={{axis:"y"}}
             onTouchStart={onTouchStart}
             isResizable={{x:true,y:false,xy:false}}
             onResizeStart={this.onResizeStart.bind(this)}
             onResizeStop={this.onResizeStop.bind(this)}
             width={start.width}
             height={start.height}
             minWidth={minWidth || 20}
             minHeight={minHeight}
             maxWidth={maxWidth}
             maxHeight={maxHeight}
             customStyle={customStyle}
             customClass={customClass} >
            {this.props.children}
          </Resizable>
        </div>
      </Draggable>
    );
  }
}

DragBox.propTypes = {
  onClick: PropTypes.func,
  onTouchStart: PropTypes.func,
  x: PropTypes.number,
  y: PropTypes.number,
  zIndex: PropTypes.number,
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired
};

DragBox.defaultProps = {
  width: 50,
  height: 50,
  x: 0,
  y: 0,
  start: {x:0, y:0},
  zIndex: 100,
  customClass: '',
  isDragDisabled: false,
  onClick: () => {},
  onTouchStartP: () => {},
  onDragStart: () => {},
  onDrag: () => {},
  onDragStop: () => {},
  onResizeStart: () => {},
  onResize: () => {},
  onResizeStop: () => {}
};
