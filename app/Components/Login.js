var rb = require('react-bootstrap');
import { ButtonInput } from 'react-bootstrap';
import { Form, ValidatedInput } from 'react-bootstrap-validation';
var URI = require('urijs');

var Register = require('./Register');


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
    return {loginType:'login', missingData:false};
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
    $.get('/api/loginMturker',{userData:mTurkLoginData},function(data){
      self.props.updatePage('score',data);
    });
  },

  loginOtherUser: function() {
    var self = this;
    var browserInfo = get_browser();
    var userData = {
      userName:self.refs.loginUsername.getValue(),
      password:self.refs.loginPassword.getValue(),
      userType:'other',
      browser: browserInfo.name,
      version:browserInfo.version,
    };
    var uriData = self.getURIData();
    $.extend(userData, uriData);

    $.get('/api/loginOther',{userData:userData},function(data){
      if (data.success) {
        self.props.updatePage('score', data);
      } else {
        self.setState({errorMsg: data.err})
      }
    });
  },
  
  registerOtherUser: function(userData) {
    var self = this;
    $.get('/api/registerOther',{userData:userData},function(data){
      if (data.success) {
        self.props.updatePage('score', data);
      } else {
        self.setState({errorMsg: data.err})
      }
    });
  },

  parsePreviewLogin: function() {
  var self = this;
  var userName = 'preview';
  var password = '*'; //self.refs.password.getValue(); //TODO
    $.get('/api/loginMturker',{userData:{userName:userName,password:password,userType:'preview'}},function(data){
      self.props.updatePage('score',data);
    });
  },


  handleKeypress: function(event){
    if (event.keyCode === 13){
      this.loginOtherUser();
    }
  },

  otherUserLogin: function(){
    return (<div ref='login' className='form-inline' style={{margin:'5px'}}>
      <rb.Row style={{margin:'0 5px 0px 5px', 'padding':'0px'}}>
        <label>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Email:</label>
        <rb.Input ref='loginUsername' type='text' autoFocus onKeyDown={this.handleKeypress}></rb.Input>
      </rb.Row>
      <rb.Row style={{margin:'5px 5px 5px 5px'}}>
        <label>Password:</label>
        <rb.Input ref='loginPassword' type='password' onKeyDown={this.handleKeypress}></rb.Input>
      </rb.Row>
      <rb.Row style={{margin:'25px 5px 20px 5px'}}><rb.Button ref='otherLogin'
                           onClick={this.loginOtherUser}
                           value='Login'
          style={{width:'200px'}}>
          Login
        </rb.Button></rb.Row>
      </div>)
  },

  render: function () {
    var self=this;
    console.log(window.location.href);
    return (<div className='bs-callout bs-callout-primary'
                 style={{padding:'20px', 'textAlign':'center', position:'relative', width:'50%', left:'50%',  transform: 'translateX(-50%)'}}>
        <h4>Welcome to MODA, please Login or Register</h4>
      <rb.ButtonGroup  style={{margin:'5px 10px 20px 10px'}} bsSize='medium' position='relative' width='100%'>
        <rb.Button bsClass='btn active-green'
                   data-id='login'
                   style={{width:'100px'}}
                   onClick={function(){self.setState({loginType:'login', errorMsg:undefined})}}
                   ref='login'
                   active={this.state.loginType==='login'}>
          Login
        </rb.Button>
        <rb.Button bsClass='btn active-green'
                   data-id='register'
                   style={{width:'100px'}}
                   onClick={function(){self.setState({loginType:'register', errorMsg:undefined})}}
                   ref='register'
                   active={this.state.loginType==='register'}>
          Register
        </rb.Button>
      </rb.ButtonGroup>
      {this.state.loginType==='login' ? this.otherUserLogin() : <Register registerOtherUser={self.registerOtherUser}/>}
      {this.state.errorMsg ? <p style={{color:'red'}}><br/>{this.state.errorMsg}</p> : []}
      </div>)
  },

});
