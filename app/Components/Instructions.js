var rb = require('react-bootstrap');

module.exports = React.createClass({
  displayName: 'Instructions',

  getInitialState: function() {
    return {
      page: 1,
      instComplete:false
    };
  },

  componentWillMount: function(){
    $('#myModal').on('show.bs.modal', function () {
      $('.modal-content').css('height',$( window ).height()*0.9);
    });
  },

  nextPage: function(){
    this.changePage(1)
  },

  previousPage: function(){
    this.changePage(-1)
  },

  changePage: function(inc){
    var self = this;
    if (self.state.page+inc===10 && !self.state.instComplete) {
      self.setState({page: 10, instComplete: true})
    }
    if (self.state.page+inc!==1 || self.state.page+inc!==10) {
      self.setState({page: self.state.page + inc})
    }
  },

  setRead: function(){
      this.setState({instComplete: true})
  },

  page1: function() {
    return (
      <div>
        <h4>Welcome, thanks for helping us out. Please read the following instructions <i style={{color:'red'}}>at least once.</i></h4>
        <p className='std-para'>
            You task is to find <b>sleep spindles</b> in brainwaves recorded from sleeping subjects.
            You will identify spindles by drawing boxes around them, and then reporting how confident
            you are about the identification. Here is an example of a window containing two spindles
            (underlined in green). <b>Not all windows will contain spindles.</b>
          </p>
          <img src="img/instruction/page1.png" alt="Example of two spindles"></img>
          <br/><br/>
          {this.props.userData.userType=='other' ? <p className='std-para'>
            Your data is saved automatically, so you won't lose any work. When you leave and log back in
            using the same username, it will return to where you left off. If you experience any problems with
            the MODA interface, first try closing your browser and logging back in. If you continue to have
            problems, please contact: moda.sleepscoring@gmail.com
          </p> : <p className='std-para'>You must identify spindles in 10 of these windows to complete at HIT</p>}
        </div>
    )
  },
      //  <rb.ResponsiveEmbed a16by9>
      //  <embed type="image/svg+xml" src="https://www.youtube.com/embed/FavUpD_IjVY"/>
      //</rb.ResponsiveEmbed>

  page2: function(){
    return (<div>
      <h4>What to look for:</h4>
      <p className='std-para'>
        You will be presented with EEG data that measures the brain activity of a person that is in stage 2 sleep. The
        goal is to identify patterns in the data that are known as Sleep Spindles.
      </p>
      <img src="img/instruction/page2.png" alt="Example of a spindle and K-complex"></img>
      <br/>
      <p className='std-para'>
        <b>Figure 1 (source: wikipedia):</b> An example of a sleep spindle and a K-complex. These features are seen in the EEG during
        stage 2 sleep. Note that over time (moving to the right in the horizontal axis) a change in voltage of the
        EEG signal has caused the line to go up and down (vertical axis).
      </p>
    </div>)
  },

  page3: function(){
    return (<div>
      <h4>Definition of a Sleep Spindle:</h4>
      <p className='std-para'>
        For the purpose of this study, we are defining a sleep spindle based on five important characteristics:
        <br/></p>
        <ol className='std-para'>
          <li>Shape </li>
          <li>Speed (frequency of oscillation) </li>
          <li>Duration </li>
          <li>Height </li>
        </ol>
      <p className='std-para'>
        Most importantly, the combination of these characteristics should make the spindle very distinct from
        its surroundings.
      </p>
    </div>)
  },

  page4: function(){
    return (<div>
      <h4>1. Shape of spindles</h4>
      <p className='std-para'>
        The spindle is usually shaped like a diamond or football (this is sometimes referred to as a 'waxing/waning'
        shape). Note that sleep spindles are often found near K-complexes (see Figure 1). Sometimes the K-complex
        wave might be so close to the spindle that it changes the shape of the sleep spindle. A certain amount of
        deformation in the shape of sleep spindle (ie the axis of spindle is not completely flat) is ok (Figure 2).
      </p>
      <img src="img/instruction/page3.png" alt="Shape of spindle example"></img>
      <p className='std-para'>
        <b>Figure 2:</b> Shape of the spindle (underlined in red) is acceptable in the first three examples, but not the
        fourth or fifth. Note that the third spindle shape is changed slightly because of other waves.
      </p>
    </div>)
  },

  page5: function(){
    return (<div>
      <h4>2. Speed of spindles</h4>
      <p className='std-para'>
        A sleep spindle is a group of waves that oscillate (go up and down) at approximately 11-16 cycles per second
        (11-16Hz), or most commonly between 12-14. It can be difficult to estimate their speed.
        However, because the vertical dashed lines in the display mark 0.5 second intervals,
        one way to determine the speed is to count the number of wave peaks between the dashed lines:
        between 6 and 7 wave peaks in 0.5 seconds would be equal to 12-14 cycles per second (Figure 3). It is
        important that the spindle appears as a 'burst'; of waves that are slightly faster (closer together) than the waves
        around it (Figure 4).
      </p>
      <img src="img/instruction/page4a.png" alt="speed of spindle waves explanation"></img>
      <p className='std-para'>
        <b>Figure 3:</b> Estimating the speed of the spindle by counting the number of waves. In this enlarged
        picture, it is easy to see there are between 6 and 7 waves in 0.5 seconds, which is equal to 13 cycles per
        seconds. This is within the 12-14 cycle per second range of sleep spindles.
      </p>
      <img src="img/instruction/page4b.png" alt="speed of spindle waves examples"></img>
      <p className='std-para'>
        <b>Figure 4:</b> The first two examples are appropriate speeds for a sleep spindle. The third example is too
        slow, and the fourth example too fast (too many cycles per second) to be a sleep spindle. Notice that
        you can clearly see gaps between the waves in the third example, and you can see no gaps at all
        between the waves in the fourth example.
      </p>
    </div>)
  },

  page6: function(){
    return (<div>
      <h4>Duration of spindle:</h4>
      <p className='std-para'>
        Most commonly, spindles are around 0.5 to 1.0 seconds in length (duration), but can be as short as 0.4
        seconds and as long as 2.5 seconds (Figure 5).
      </p>
      <img src="img/instruction/page5.png" alt="duration of spindle explanation"></img>
      <p className='std-para'>
        <b>Figure 5:</b> Example spindles of different durations. The second example could be considered one single
        long spindle, but there are slow segments in the middle, and in this case, it has been considered three
        separate spindles of shorter duration. The duration of the third example is too short to be considered a
        spindle (&lt;0.4 seconds).
      </p>
    </div>)
  },

  page7: function(){
    return (<div>
      <h4>Height of waves in spindle:</h4>
      <p className='std-para'>
        The height (amplitude) of the spindle is less important than the other criteria. The height of the waves in the
        spindle is usually a little larger than the waves around it.
        <b> Most importantly, the spindle should be distinct from the other waves around it.</b>
      </p>
    </div>)
  },


  page8: function(){
    return (<div>
      <h4>How to identify sleep spindles:</h4>
      <p className='std-para'>
          To draw a bounding box around the spindles, you need to left click and drag with the mouse around the
          spindle. A menu then appears where you can select how confident you are about the spindle identification:</p>
          <ul className='std-para'>
            <li><b>High:</b> &quot;I am sure that this is a sleep spindle. It meets all of the criteria of shape, speed, duration and
            height and is very distinct from the surrounding waves.&quot;</li>
            <li><b>Medium:</b> &quot;I would bet that this is a spindle, although I am not completely sure because one of the
            criteria is not quite right. There are some imperfections in the spindle, but I still think it is a sleep
            spindle.&quot;</li>
            <li><b>Low:</b> &quot;I think this could be a spindle, but I am not positive. Two or more of the criteria are not
            perfect. It would be best to have someone have a second look at this.&quot;</li>
          </ul>
      <p className='std-para'>
          You must assign a confidence score to each spindle identification.
          Accuracy is important, so be sure to size the bounding box so that it only includes the spindles, not
          surrounding EEG waves. <br/>You can resize and move the bounding box (Figure 6) by clicking in the middle or
          on the edges and dragging. You can change the spindle certainty, or delete the bounding box clicking on it.
          There may be multiple spindles, or none within a window (Figure 7). If there are no spindles in the window,
          indicate this by clicking the box marked &quot;No spindles in window&quot; found at the bottom of your screen before
          moving on to the next window. Note that you will not be able to draw any spindle markers if 'No spindle in window' is checked.
          <br/>If the spindle runs into the end or beginning of the window, just draw the bounding box right up to the edge
          of the window.
      </p>
      <img src="img/instruction/page7.png" alt="duration of spindle explanation"></img>
      <p className='std-para'>
        <b>Figure 6:</b> Use your mouse to draw a bounding box around the spindle. The size of the bounding box
        can be changed by clicking on the middle or on the edges of the box and dragging. In this case, the
        certainty of the spindle has been judged as &quot;High&quot;. *If the spindle runs into the end or beginning of
        the window, just draw the bounding box right up to the edge of the window.
      </p>

    </div>)
  },

  page9: function(){
    return (<div>
      <h4>Here are some examples of spindles:</h4>
      <p className='std-para'>
        Here are some examples of spindles (underlined in green), to help you understand what you should be looking for.
      </p>
      <img src="img/instruction/ex1.png" alt="example"></img>
      <img src="img/instruction/ex2.png" alt="example"></img>
      <img src="img/instruction/ex3.png" alt="example"></img>
      <img src="img/instruction/ex4.png" alt="example"></img>
      <img src="img/instruction/ex5.png" alt="example"></img>
      <img src="img/instruction/ex6.png" alt="example"></img>
      <img src="img/instruction/ex7.png" alt="example"></img>
      <img src="img/instruction/ex8.png" alt="example"></img>
      <img src="img/instruction/ex9.png" alt="example"></img>
      <img src="img/instruction/ex10.png" alt="example"></img>
      <img src="img/instruction/ex11.png" alt="example"></img>
      <img src="img/instruction/ex12.png" alt="example"></img>
      <img src="img/instruction/ex13.png" alt="example"></img>
      <img src="img/instruction/ex14.png" alt="example"></img>
      <p className='std-para's>
      <b>Figure 7:</b> Here are some examples of sleep spindles, indicated with a green bar below them. These are
        the events you will want to identify by drawing a bounding box around them with your mouse. There
        are also other events that are not identified as spindles, because they are too short, too small, or don&#39;t
        have the correct shape. As a reference, the gridlines in the display are spaced at 0.5 seconds so that you
        can approximate the number of cycles by counting the number of waves. Some windows do not have
        any spindles.
      </p>
    </div>)
  },

  page10: function(){
    return (<div>
      <h4>Final Comments</h4>
      <p className='std-para's>
        Remember, you need to select the spindles precisely. Do not include any noise around them. You will only
        get credit if you do a careful job in selecting the spindles. We will double check some of your jobs to
        make sure you select events that fulfill the criteria.
        <br/><br/>
        The goal is to very accurately identify the spindles. Try as best you can to identify where the spindle
        begins and ends. <b>Quality is more important that quantity.</b>
        <br/><br/>

        If you want to <b>score faster</b>, then try using the keyboard:</p>
        <ul className='std-para'>
          <li>'1' Key: Set current marker as Low Confidence.</li>
          <li>'2' Key: Set current marker as Med Confidence.</li>
          <li>'3' Key: Set current marker as High Confidence.</li>
          <li>'Left Arrow' Key: Nudge current marker back in time.</li>
          <li>'Right Arrow' Key: Nudge current marker forward in time.</li>
          <li>'Delete' Key: Remove current marker.</li>
          <p style={{fontSize:'0pt'}}><br/></p>
          <li>'s' Key: Set window as "no markers". All markers must be removed first.</li>
          <li>'q' Key: Go to previous window.</li>
          <li>'e' Key: Go to next window.</li>
        </ul>

      <p className='std-para'>
        These instructions can be opened at any time by clicking on the <i>Instructions</i> button in the top left corner.
        <br/><br/>
        Finally and most importantly, <b style={{color:'red'}}>Thank you for you help!</b>
      </p>
    </div>)
  },

  handleKey: function(event) {
    if (event.keyCode === 39) {
      this.nextPage();
    } else if (event.keyCode === 37) {
      this.previousPage();
    } else {
      return;//Do nothing, let event propagate
    }
    event.stopPropagation();
    event.preventDefault();
  },

  closeInst: function(){
    if(this.state.instComplete) {
      this.props.closeInst()
    }
  },

  render: function() {
    var self = this;
    return (
      <div>
        <rb.Button
          bsStyle="primary"
          dataBackdrop="static"
          dataKeyboard="false"
          onClick={function(){
              self.setRead();
              self.props.openInst();
            }
          }
        >
        Instructions
        </rb.Button>
        {this.props.showInst ?
        <rb.Modal show={false} className='myModal'
                  id='img/instructions'
                  className='inst'
                  dataControlsModal="myModal"
                  dataBackdrop="static"
                  dataKeyboard={false}
                  show={this.props.showInst}
                  onHide={this.closeInst}
                  onKeyDown={this.handleKey}
                  bsSize="large">
          <rb.Modal.Header closeButton={this.state.instComplete}>
            <rb.Modal.Title>Instructions</rb.Modal.Title>
          </rb.Modal.Header>
          <rb.Modal.Body >
            {this['page'+this.state.page]()}
          </rb.Modal.Body>
          <rb.Modal.Footer>
            <p className='pull-left' style={{fontSize:'12pt'}}>Page {this.state.page} of 10</p>
            <rb.Button disabled={this.state.page===1} onClick={this.previousPage}>Back</rb.Button>
            <rb.Button disabled={this.state.page===10} onClick={this.nextPage}>Next</rb.Button>
            <rb.Button dataToggle="tooltip" title='Please read all img/instructions' disabled={!this.state.instComplete} onClick={this.closeInst}>Close</rb.Button>
          </rb.Modal.Footer>
        </rb.Modal> : []}
        <a data-controls-modal="img/instructions"
         data-backdrop="static"
         data-keyboard="false"
         href="#"/>
      </div>

    );
  }
});

//style={{bottom:0}}
//style={{height:'30pc'}}