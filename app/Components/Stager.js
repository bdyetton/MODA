var bootstrap = require('bootstrap');
module.exports = React.createClass({
    displayName: 'Stager',

    getInitialState: function() {
        return { stage: 'Not Set'};
    },

    componentDidMount: function (){
      var self=this;
      $(".toggle-btn:not('.noscript') input[type=radio]").addClass("visuallyhidden");

      $(".toggle-btn:not('.noscript') input[type=radio]").change(function() {
          if( $(this).attr("name") ) {
              $(this).parent().addClass("success").siblings().removeClass("success")
              self.changeStage(parseInt($(this).attr("name")))
          } else {
              $(this).parent().toggleClass("success");
          }
      });
    },

    componentWillMount:function(){
     document.addEventListener("keydown", this.handleKey, false);
    },


    componentWillUnmount: function() {
      document.removeEventListener("keydown", this.handleKey, false);
    },

    changeStage: function(stage){
      this.setState({stage:stage});
      console.log(stage);
      //if (stage==='W'){$("wake").mousedown()} else {$("wake").mouseup()}
    },

    handleKey:function(event){
      console.log(event);
      if (event.keyCode===48){
        this.changeStage(0);
      }
      else if (event.keyCode===49){}
      else if (event.keyCode===50){}
      else if (event.keyCode===51){}
      else if (event.keyCode===52){}
    },

    render: function () {
      var self = this;
      return (
        <div id='StageButtons' onKeyDown={this.handleKeypress}>
        <div className="toggle-btn-grp joint-toggle">
            <label onclick="" className="toggle-btn"><input type="radio" name="0"/>Wake</label>
            <label onclick="" className="toggle-btn"><input type="radio" name="1"/>S1</label>
            <label onclick="" className="toggle-btn"><input type="radio" name="2"/>S2</label>
            <label onclick="" className="toggle-btn"><input type="radio" name="3"/>SWS</label>
            <label onclick="" className="toggle-btn"><input type="radio" name="4"/>REM</label>
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