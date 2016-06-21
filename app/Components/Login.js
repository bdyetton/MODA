var rb = require('react-bootstrap');
import { ButtonInput } from 'react-bootstrap';
import { Form, ValidatedInput } from 'react-bootstrap-validation';
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
  
  registerOtherUser: function(formData) {
    var self = this;
    self.setState({missingData:false});
    var browserInfo = get_browser();
    var userData = {
      userName: formData.email,
      password: formData.password,
      userType: 'other',
      browser: browserInfo.name,
      version: browserInfo.version,
      registerData: formData
    };
    var uriData = self.getURIData();
    $.extend(userData, uriData);
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
        <label>Email:</label>
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

  otherUserRegister: function(){
    var self = this;
    return (
      <Form
        // Supply callbacks to both valid and invalid
        // submit attempts
        onValidSubmit={this.registerOtherUser}
        onInvalidSubmit={this.handleInvalidSubmit}>
        <div style={{position:'relative', left:'50%', width: '250px', transform: 'translateX(-50%)'}}>
        <ValidatedInput
          type='text'
          label='Email'
          name='email'
          validate='required,isEmail'
          errorHelp={{
              required: 'Please enter your email',
              isEmail: 'Email is invalid'
          }}
        />

        <ValidatedInput
          type='password'
          name='password'
          label='Password'
          validate='required,isLength:6:60'
          errorHelp={{
              required: 'Please specify a password',
              isLength: 'Password must be at least 6 characters'
          }}
        />

        <ValidatedInput
            type='password'
            name='password-confirm'
            label='Confirm Password'
            validate={(val, context) => val === context.password}
            errorHelp='Passwords do not match'
        />
        </div>
        <div>
        <p style={{fontSize:'14pt', clear:'both'}}><br/>Please provide some information about you experience sleep scoring:<br/></p>

        <ValidatedInput
            type='field'
            name='yearsExp'
            label='How many years have you been scoring sleep (etc etc):'
            validate='required'
            errorHelp={{
                required: 'Please enter this information'
            }}
        />

        <ValidatedInput
            type='field'
            name='hoursPerWeek'
            label='How many hours do you spend scoring per week?'
            validate='required'
            errorHelp={{
                required: 'Please enter this information'
            }}
        />
        </div>
        <rb.Button
          type='submit'
          ref='otherLogin'
          value='Register'
          style={{width:'200px'}}>
          Register
        </rb.Button>
        {self.state.missingData ? <p style={{color:'red'}}>Missing data, see above</p> : []}
      </Form>)
  },

  handleInvalidSubmit: function(errors, values) {
    this.setState({missingData: true});
  },

  render: function () {
    var self=this;
    console.log(window.location.href);
    return (<div className='bs-callout bs-callout-primary'
                 style={{padding:'20px', 'textAlign':'center', position:'absolute', left:'50%', top: '50%',  transform: 'translateY(-50%) translateX(-50%)'}}>
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
      {this.state.loginType==='login' ? this.otherUserLogin() : this.otherUserRegister()}
      {this.state.errorMsg ? <p style={{color:'red'}}><br/>{this.state.errorMsg}</p> : []}
      </div>)
  },

});
