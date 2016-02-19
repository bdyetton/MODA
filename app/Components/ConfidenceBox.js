var ButtonGroup=require('react-bootstrap').ButtonGroup;
var Button=require('react-bootstrap').Button;

module.exports = React.createClass({
  displayName: 'ConfidenceBox',

  getInitialState: function () {
    return {}
  },

  componentDidMount: function (){
    var self = this;

    $(".toggle-btn:not('.noscript') input[type=radio]").addClass("visuallyhidden");

    $(".toggle-btn:not('.noscript') input[type=radio]").change(function() {
      //self.toggleButtonState(self,this)
      self.props.changeStage(($(this).attr("data-stage")));
    });
  },


  render: function () {
    return <div className='arrow_box_container'>
      <div className='arrow_box'>Confidence?
         <ButtonGroup bsSize='medium' vertical={true}>
           <Button className='toggle-btn-conf-high'>High</Button>
           <Button className='toggle-btn-conf-med'>Med</Button>
           <Button className='toggle-btn-conf-low'>Low</Button>
         </ButtonGroup>
      </div>
    </div>
  }
});

        //<div className="toggle-btn-grp joint-toggle">
        //  <label onclick="" className="toggle-btn toggle-btn-conf-high"><input type="radio" name="stage" data-stage='0'/>High</label>
        //  <label onclick="" className="toggle-btn toggle-btn-conf-med"><input type="radio" name="stage" data-stage='1'/>Med</label>
        //  <label onclick="" className="toggle-btn toggle-btn-conf-low"><input type="radio" name="stage" data-stage='1'/>Low</label>
        //</div>