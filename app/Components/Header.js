var React = require('react');

module.exports = React.createClass({
  displayName: 'Header',

	componentWillMount:function(){

		document.body.oncontextmenu=function(){return false;};
		document.body.onselectstart=function(){return false;};
		document.body.ondragstart=function(){return false;};
		document.oncontextmenu = function(e){
				var target = (typeof e !="undefined")? e.target: event.srcElement;
				if (target.tagName == "IMG" || (target.tagName == 'A' && target.firstChild.tagName == 'IMG'))
						return false
		}
	},

  render: function (){
    return (
	  	<div className='header'>
    	MODA - Massive Online Data Annotation
    	</div>
		)
	}

});


