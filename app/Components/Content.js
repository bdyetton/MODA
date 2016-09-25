var Scorer = require('./Scorer');
var Login = require('./Login');

function get_browser(){
    var ua=navigator.userAgent,tem,M=ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
    if(/trident/i.test(M[1])){
        tem=/\brv[ :]+(\d+)/g.exec(ua) || [];
        return {name:'IE',version:(tem[1]||'')};
        }
    if(M[1]==='Chrome'){
        tem=ua.match(/\bOPR\/(\d+)/)
        if(tem!=null)   {return {name:'Opera', version:tem[1]};}
        }
    M=M[2]? [M[1], M[2]]: [navigator.appName, navigator.appVersion, '-?'];
    if((tem=ua.match(/version\/(\d+)/i))!=null) {M.splice(1,1,tem[1]);}
    return {
      name: M[0],
      version: M[1]
    };
 }

module.exports = React.createClass({
  displayName: 'Content',
  getInitialState: function() {
    return {page: 'login'};
  },

  updatePage: function(page,data){
    if (page==='score'){
      this.setState({userData:data.userData, showInstructions:data.createdUser, image:data.image});
    }
    this.setState({page:page})
  },

  render: function () {
    var self = this;
    var browser = get_browser();
    if (browser.name==='IE') {
      return (<p className='thank-you-text'>'Internet Explorer is not supported.
        Supported browsers are firefox, chrome and safari. Edge and Opera are untested, proceed at your own risk'</p>)
    }

    if(self.state.page==='login')
    {
      return (<div><Login updatePage={self.updatePage}/></div>)
    } else if (self.state.page==='score')
    {
      return (<div><Scorer userData={this.state.userData} showInstructions={this.state.showInstructions} image={this.state.image}/></div>)
    }

  }

});