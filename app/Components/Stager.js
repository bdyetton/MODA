var bootstrap = require('bootstrap');
module.exports = React.createClass({
    displayName: 'Stager',

    getInitialState: function() {
        return {};
    },

    componentDidMount: function (){
      var self = this;

      $(".toggle-btn:not('.noscript') input[type=radio]").addClass("visuallyhidden");

      $(".toggle-btn:not('.noscript') input[type=radio]").change(function() {
        //self.toggleButtonState(self,this)
        self.props.changeStage(($(this).attr("data-stage")));
      });


    },

    componentWillMount:function(){
     document.addEventListener("keydown", this.handleKey, false);
    },


    toggleButtonState: function(self,toggleButton){
      if( $(toggleButton).attr("name") ) {
              $(toggleButton).parent().addClass("success").siblings().removeClass("success");
              //self.props.changeStage($(toggleButton).attr("data-stage"))
          } else {
              $(toggleButton).parent().toggleClass("success");
          }
      },

    componentWillUnmount: function() {
      document.removeEventListener("keydown", this.handleKey, false);
    },

    handleKey: function(event){
      console.log(event); // TODO The button last pushed cannot be selected again...
      if (event.keyCode===48){
        this.toggleButtonState(this,$('*[data-stage="0"]'))
      }
      else if (event.keyCode===49){
        this.toggleButtonState(this,$('*[data-stage="1"]'))
      }
      else if (event.keyCode===50){
        this.toggleButtonState(this,$('*[data-stage="2"]'))
      }
      else if (event.keyCode===51){
        this.toggleButtonState(this,$('*[data-stage="3"]'))
      }
      else if (event.keyCode===52){
        this.toggleButtonState(this,$('*[data-stage="4"]'))
      }
    },

    render: function () {
      var self = this;
      var toggleState = '*[data-stage='+self.props.stage+']';
      this.toggleButtonState(this,$(toggleState));
      return (
        <div id='StageButtons' onKeyDown={this.handleKeypress}>
        <div className="toggle-btn-grp joint-toggle horz">
            <label onclick="" className="toggle-btn toggle-btn-horz"><input type="radio" name="stage" data-stage='0'/>Wake</label>
            <label onclick="" className="toggle-btn toggle-btn-horz"><input type="radio" name="stage" data-stage='1'/>S1</label>
            <label onclick="" className="toggle-btn toggle-btn-horz"><input type="radio" name="stage" data-stage='2'/>S2</label>
            <label onclick="" className="toggle-btn toggle-btn-horz"><input type="radio" name="stage" data-stage='3'/>SWS</label>
            <label onclick="" className="toggle-btn toggle-btn-horz"><input type="radio" name="stage" data-stage='4'/>REM</label>
        </div>
        </div>
      );
    }
});