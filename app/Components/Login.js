var rb = require('react-bootstrap');
var URI = require('urijs');


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
  displayName: 'Login',
  getInitialState: function() {
    return {loggedIn: false, userType:'other'};
  },

  componentWillMount: function(){
    var mTurkLoginData = this.getURIData();
    if ('assignmentId' in mTurkLoginData){
      mTurkLoginData.userName=mTurkLoginData.workerId;
      mTurkLoginData.userType='mturker';
      if (mTurkLoginData.assignmentId == 'ASSIGNMENT_ID_NOT_AVAILABLE')
      {
        this.parsePreviewLogin();
      } else {
        this.setState({mTurkLoginData: mTurkLoginData}, this.parseMturkLogin)
      }
    }
  },

  getURIData: function(){
    var query = URI.parse(window.location.href);
    return URI.parseQuery(query.query);
  },

  parseMturkLogin: function(){
    var self = this;
    var mTurkLoginData = self.state.mTurkLoginData;
    var browserInfo = get_browser();
    mTurkLoginData.browser = browserInfo.name;
    mTurkLoginData.version = browserInfo.version;
    $.get('/api/getUser',{userData:mTurkLoginData},function(data){
      self.props.updatePage('score',data);
    });
  },

  getOtherUser: function() {
    var self = this;
    var userName = self.refs.username.getValue();
    var password = '*'; //self.refs.password.getValue(); //TODO
    var browserInfo = get_browser();
    var userData = {
      userName:userName,
      password:password,
      userType:'other',
      browser: browserInfo.name,
      version:browserInfo.version,
    };
    var uriData = self.getURIData();
    $.extend(userData, uriData);
    $.get('/api/getUser',{userData:userData},function(data){
      self.props.updatePage('score',data);
    });
  },

  parsePreviewLogin: function() {
  var self = this;
  var userName = 'preview';
  var password = '*'; //self.refs.password.getValue(); //TODO
    $.get('/api/getUser',{userData:{userName:userName,password:password,userType:'preview'}},function(data){
      self.props.updatePage('score',data);
    });
  },


  handleKeypress: function(event){
    if (event.keyCode === 13){
      if (this.state.userType==='other') {this.getOtherUser();}
    }
  },

  loggedIn: function(){
    return self.state.loggedIn
  },

  otherUserLogin: function(){
    return (<div style={{margin:'5px'}}>
      <rb.Row style={{margin:'0 5px 0px 5px','padding':'0px'}}>Username: <rb.Input ref='username' type='text' autoFocus onKeyDown={this.handleKeypress}></rb.Input></rb.Row>
         <rb.Row style={{margin:'0 5px 20px 5px'}}><rb.Button ref='mTurkLogin'
                           onClick={this.getOtherUser}
                           value='Login'
          style={{width:'100%'}}>
          Login
        </rb.Button></rb.Row>
      </div>)
  },

         /*<rb.Row style={{margin:'0 5px 0px 5px'}}>Password: <rb.Input ref='password' type='text' defaultValue='Not Checked Currently' onKeyDown={this.handleKeypress}></rb.Input></rb.Row>*/

  mTurkerLogin: function(){
      //window.location.href = "http://localhost:8080/?gameid=01523&assignmentId=123RVWYBAZW00EXAMPLE456RVWYBAZW00EXAMPLE&hitId=123RVWYBAZW00EXAMPLE&turkSubmitTo=https://www.mturk.com/&workerId=AZ3256EXAMPLE";
      //https://shrouded-plains-8041.herokuapp.com/?assignmentId=3DYGAII7PL83TDTSIP…workerId=A2SI2XQA7HPR8V&turkSubmitTo=https%3A%2F%2Fworkersandbox.mturk.com
      return (<div style={{margin:'5px'}}>
        <rb.Row style={{margin:'0 5px 0px 5px'}}> Please log into you <a href='http://www.mturk.com/mturk/beginsignin'>amazon mturk account</a> and search for MODA HIT's</rb.Row>
      </div>)
  },

  render: function () {
    var self=this;
    console.log(window.location.href);
    return (<div className='bs-callout bs-callout-primary'
                 style={{'textAlign':'center', position:'absolute', left:'50%', top: '50%',  transform: 'translateY(-50%) translateX(-50%)'}}>
        <h4>Please Login to MODA</h4>
      <rb.ButtonGroup  style={{margin:'0 10px 5px 10px'}} bsSize='medium' position='relative' width='100%'>
        <rb.Button bsClass='btn active-green'
                   data-id='other'
                   onClick={function(){self.setState({userType:'other'})}}
                   ref='other'
                   active={this.state.userType==='other'}>
          Regular User Login
        </rb.Button>
        <rb.Button bsClass='btn active-green'
                   data-id='mTurker'
                   onClick={function(){self.setState({userType:'mTurker'})}}
                   ref='mTurker'
                   active={this.state.userType==='mTurker'}>
          mTurk Login
        </rb.Button>
      </rb.ButtonGroup>
      {this.state.userType==='other' ? this.otherUserLogin() : this.mTurkerLogin()}
      </div>)
  },

});
