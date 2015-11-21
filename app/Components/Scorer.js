var React = require('react');
var $ = require('jquery');
var Box = require('./Box');

module.exports = React.createClass({
    displayName: 'Scorer',

    getInitialState: function() {
        return { serverData: null, currentRemImage: null, boxes: [] };
    },

    componentWillMount: function() {
        this.getNextRemImage()
    },

    getPreviousRemImage: function() {
        var self = this;
        $.get('/api/previousRemImage', function(data){
            self.setState({ currentRemImage: data.imageURL });
        });
    },

    getNextRemImage: function() {
        var self = this;
        $.get('/api/nextRemImage', function(data){
            self.setState({ currentRemImage: data.imageURL });
        });
    },

    onImgClick: function(e) {
        if (e.button !== 0) return;
        var imgPos = $(this.refs.sigImg.getDOMNode()).offset();
        var newBox = <Box initialPos={{x: e.pageX-50, y: e.pageY-50}} className='box' style={{ border: '2px solid #0d0', padding: '10px'}}/>;
        this.setState({
            boxes: this.state.boxes.concat([newBox])
        });
        console.log(this.state.boxes);
    },

    render: function () {
        var self = this;
        return (
            <div><p>Now logged in as {this.props.username}</p>
            <div style={{position:'reletive'}}>
                {this.state.boxes.map(function(box){return box})}
                <img ref='sigImg' src={window.location.href + (this.state.currentRemImage)} alt='remImage' onClick={this.onImgClick}></img>
            </div>
            <input ref='previous' type='button' onClick={this.getPreviousRemImage } value='Previous Epoch'></input>
            <input ref='next' type='button' onClick={this.getNextRemImage} value='Next Epoch'></input>
            </div>
        );
    }

});
