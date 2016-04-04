var rb = require('react-bootstrap');

module.exports = React.createClass({
  displayName: 'MatchBox',

  render: function () {
    var self = this;
    return (<div>
      {self.props.match===undefined ? [] : <div className='arrow_box_container'>
        <div className={"arrow_box_top " + [self.props.match ? " match" : '']}>
          {this.props.matchMessage}
        </div>
    </div>}</div>)
  }
});