var bootstrap = require('bootstrap');
module.exports = React.createClass({
    displayName: 'Stager',

    getInitialState: function() {
        return { stage: 'Not Set'};
    },

    componentDidMount: function (){
      $(".toggle-btn:not('.noscript') input[type=radio]").addClass("visuallyhidden");

      $(".toggle-btn:not('.noscript') input[type=radio]").change(function() {
          if( $(this).attr("name") ) {
              $(this).parent().addClass("success").siblings().removeClass("success")
          } else {
              $(this).parent().toggleClass("success");
          }
      });
    },

    changeStage: function(stage){
      this.setState({stage:stage});
      //if (stage==='W'){$("wake").mousedown()} else {$("wake").mouseup()}
    },

    render: function () {
      var self = this;
      return (
        <div id='StageButtons'>
        <div className="toggle-btn-grp joint-toggle">
            <label onclick="" className="toggle-btn"><input type="radio" name="group3"/>Wake</label>
            <label onclick="" className="toggle-btn"><input type="radio" name="group3"/>S1</label>
            <label onclick="" className="toggle-btn"><input type="radio" name="group3"/>S2</label>
            <label onclick="" className="toggle-btn"><input type="radio" name="group3"/>SWS</label>
            <label onclick="" className="toggle-btn"><input type="radio" name="group3"/>REM</label>
        </div>
        </div>
      );
    }
});



        //onClick={self.changeStage('W')}
        //<input ref='stage1' type='button' onClick={self.changeStage('S1')} value='Stage 1 (1)'></input>
        //<input ref='stage2' type='button' onClick={self.changeStage('S2')} value='Stage 2 (2)'></input>
        //<input ref='SWS' type='button' onClick={self.changeStage('SWS')} value='SWS (3)'></input>
        //<input ref='REM' type='button' onClick={self.changeStage('REM')} value='REM (4)'></input>