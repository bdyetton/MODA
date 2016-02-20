var rb = require('react-bootstrap');

module.exports = React.createClass({
  displayName: 'ConfidenceBox',

  getInitialState: function () {

    return {}
  },

  updateConf: function(e){
    console.log('Hi');
  },

  render: function () {
    return (<div className='arrow_box_container'>
      <div className='arrow_box'>Confidence?
       <rb.ButtonGroup onClick={this.updateConf} bsSize='medium' block vertical position='relative' width='100%' data-toggle="buttons">
        <rb.Label className="btn btn-primary" style={{background:'#8cd98c'}}><rb.Input type="radio" name="options" id="option1" autocomplete="off"> Radio 1</rb.Input></rb.Label>
        <rb.Label className="btn btn-primary" style={{background:'#ffcc66'}}><rb.Input type="radio" name="options" id="option2" autocomplete="off"> Radio 2</rb.Input></rb.Label>
        <rb.Label className="btn btn-primary" style={{background:'#ff9999'}}><rb.Input type="radio" name="options" id="option3" autocomplete="off"> Radio 3</rb.Input></rb.Label>
       </rb.ButtonGroup>
      </div>
    </div>)
  }
});

           //<rb.Button style={{background:'#8cd98c'}}>High</rb.Button>
           //<rb.Button style={{background:'#ffcc66'}}>Med</rb.Button>
           //<rb.Button style={{background:'#ff9999'}}>Low</rb.Button>