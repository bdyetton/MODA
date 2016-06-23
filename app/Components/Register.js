var rb = require('react-bootstrap');
import { ButtonInput, ControlLabel, FormGroup, FormControl} from 'react-bootstrap';
import { Form, ValidatedInput } from 'react-bootstrap-validation';


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
  displayName: 'Register',

  getInitialState: function() {
    return {missingData:false};
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
    self.props.registerOtherUser(userData);
  },

  handleInvalidSubmit: function(errors, values) {
    this.setState({missingData: true});
  },

  updateFormType: function(e){
    var self = this;
    this.setState({formType:e.target.value})
  },

  psgQuestions: function(){
    return(
      <div>
      <ValidatedInput
            type='text'
            name='RPSGTNum'
            validate='required'
            label='What is your RPSGT number/OTIMROEPMQ numero de permis (or equivalent)'
            errorHelp='An RPSGT number or equivalent is required'
      />

      <ValidatedInput
          type='text'
          name='timeWorked'
          validate='required,isNumeric'
          label='How many years have you worked as a polysomnographic technologist?'
          errorHelp={{
              required: 'Please enter a number',
              isNumeric: 'Please enter a number'
          }}
      /></div>
    )
  },

  otherAndGradQuestions: function() {
      return (<div>
        {this.state.formType == 'other' ?
          <ValidatedInput
            type='text'
            name='other'
            validate='required'
            label='What experience do you have that qualifies you to score spindles?'
          />
          : []}

        <ValidatedInput
            type='text'
            name='yearsExperience'
            validate='required,isNumeric'
            label='How many years experience do you have in scoring sleep?'
            errorHelp={{
                required: 'Please enter a number',
                isNumeric: 'Please enter a number'
            }}
        />

        <ValidatedInput
            type='text'
            name='timeWorked'
            validate='required,isNumeric'
            label='Estimate how many total hours you have scored spindles for over your lifetime:'
            errorHelp={{
                required: 'Please enter a number',
                isNumeric: 'Please enter a number'
            }}
        />
      </div>)
  },

  render: function () {
    var self=this;
    return (<Form
        // Supply callbacks to both valid and invalid
        // submit attempts
        onValidSubmit={self.registerOtherUser}
        onInvalidSubmit={self.handleInvalidSubmit}>
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


        <rb.FormGroup style={{position:'relative', left:'50%', width: '250px', transform: 'translateX(-50%)'}} controlId="formControlsSelect">
          <rb.ControlLabel>What is your position?</rb.ControlLabel>
          <rb.FormControl componentClass="select" placeholder="select" onChange={self.updateFormType} ref='position'>
            <option value="...">...</option>
            <option value="psgTech">Polysomnographic Technologist</option>
            <option value="grad">Graduate Student</option>
            <option value="other">Other</option>
          </rb.FormControl>
        </rb.FormGroup>

        {self.state.formType === '...' ? [] : self.state.formType === 'psgTech' ? self.psgQuestions() : self.otherAndGradQuestions()}

        <ValidatedInput
            type='text'
            name='comments'
            label='Any other comments on you experience scoring sleep?'
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

});
