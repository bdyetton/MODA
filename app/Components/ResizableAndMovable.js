'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactDraggable = require('./@bokuweb/react-draggable');

var _reactDraggable2 = _interopRequireDefault(_reactDraggable);

var _reactResizableBox = require('./@bokuweb/react-resizable-box');

var _reactResizableBox2 = _interopRequireDefault(_reactResizableBox);

var _Object = require('react/lib/Object.assign');

var _Object2 = _interopRequireDefault(_Object);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var ResizableAndMovable = function (_Component) {
  _inherits(ResizableAndMovable, _Component);

  function ResizableAndMovable(props) {
    _classCallCheck(this, ResizableAndMovable);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(ResizableAndMovable).call(this, props));

    _this.state = { isDraggable: true };
    _this.isResizing = false;
    return _this;
  }

  _createClass(ResizableAndMovable, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      var _props$initAsResizing = this.props.initAsResizing;
      var enable = _props$initAsResizing.enable;
      var direction = _props$initAsResizing.direction;
      var event = _props$initAsResizing.event;

      if (enable) {
        this.refs.resizable.onResizeStart(direction, event);
      }
    }
  }, {
    key: 'onResizeStart',
    value: function onResizeStart(dir, e) {
      this.setState({ isDraggable: false });
      this.isResizing = true;
      this.props.onResizeStart(dir, e);
      e.stopPropagation();
    }
  }, {
    key: 'onResizeStop',
    value: function onResizeStop(dir, styleSize, clientSize) {
      this.setState({ isDraggable: true });
      this.isResizing = false;
      this.props.onResizeStop(dir, styleSize, clientSize);
    }
  }, {
    key: 'onDragStart',
    value: function onDragStart(e, ui) {
      if (this.isResizing) return;
      this.props.onDragStart(e, ui);
    }
  }, {
    key: 'onDrag',
    value: function onDrag(e, ui) {
      if (this.isResizing) return;
      this.props.onDrag(e, ui);
    }
  }, {
    key: 'onDragStop',
    value: function onDragStop(e, ui) {
      if (this.isResizing) return;
      this.props.onDragStop(e, ui);
    }
  }, {
    key: 'render',
    value: function render() {
      var _props = this.props;
      var customClass = _props.customClass;
      var customStyle = _props.customStyle;
      var onClick = _props.onClick;
      var onTouchStart = _props.onTouchStart;
      var minWidth = _props.minWidth;
      var minHeight = _props.minHeight;
      var maxWidth = _props.maxWidth;
      var maxHeight = _props.maxHeight;
      var start = _props.start;
      var zIndex = _props.zIndex;
      var bounds = _props.bounds;

      return _react2.default.createElement(
        _reactDraggable2.default,
        {
          axis: this.props.moveAxis,
          zIndex: zIndex,
          start: { x: start.x, y: start.y },
          disabled: !this.state.isDraggable || this.props.moveAxis === 'none',
          onStart: this.onDragStart.bind(this),
          handle: this.props.handle,
          onDrag: this.onDrag.bind(this),
          onStop: this.onDragStop.bind(this),
          bounds: bounds,
          grid: this.props.grid },
        _react2.default.createElement(
          'div',
          { style: {
              width: start.width + 'px',
              height: start.height + 'px',
              cursor: "move",
              position: 'absolute',
              zIndex: '' + zIndex
            } },
          _react2.default.createElement(
            _reactResizableBox2.default,
            {
              ref: 'resizable',
              onClick: onClick,
              onTouchStart: onTouchStart,
              onResizeStart: this.onResizeStart.bind(this),
              onResize: this.props.onResize,
              onResizeStop: this.onResizeStop.bind(this),
              width: start.width,
              height: start.height,
              minWidth: minWidth,
              minHeight: minHeight,
              maxWidth: maxWidth,
              maxHeight: maxHeight,
              customStyle: customStyle,
              customClass: customClass,
              isResizable: this.props.isResizable },
            this.props.children
          )
        )
      );
    }
  }]);

  return ResizableAndMovable;
}(_react.Component);

exports.default = ResizableAndMovable;


ResizableAndMovable.propTypes = {
  onClick: _react.PropTypes.func,
  onTouchStart: _react.PropTypes.func,
  zIndex: _react.PropTypes.number,
  width: _react.PropTypes.number.isRequired,
  height: _react.PropTypes.number.isRequired,
  isResizable: _react.PropTypes.object,
  bounds: _react.PropTypes.oneOfType([_react2.default.PropTypes.string, _react2.default.PropTypes.object]),
  grid: _react.PropTypes.arrayOf(_react.PropTypes.number)
};

ResizableAndMovable.defaultProps = {
  width: 100,
  height: 100,
  start: { x: 0, y: 0 },
  zIndex: 100,
  customClass: '',
  initAsResizing: { enable: false, direction: 'xy' },
  isResizable: { x: true, y: true, xy: true },
  moveAxis: 'both',
  grid: null,
  onClick: function onClick() {},
  onTouchStartP: function onTouchStartP() {},
  onDragStart: function onDragStart() {},
  onDrag: function onDrag() {},
  onDragStop: function onDragStop() {},
  onResizeStart: function onResizeStart() {},
  onResize: function onResize() {},
  onResizeStop: function onResizeStop() {}
};