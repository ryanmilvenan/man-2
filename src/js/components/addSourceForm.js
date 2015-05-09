var React = require('react');
var Input = require('react-bootstrap').Input;
var socket = require('./socket');

var AddSourceForm = React.createClass({
    getInitialState: function() {
        socket.on('source:invalid', this.handleError);
        return {tabs: [], titleValue:'', urlValue:''};
    },
    handleError: function(error) {
        alert(error.error);
    },
    handleTitleChange: function() {
        this.setState({titleValue: this.refs.title.getValue()});
    },
    handleUrlChange: function() {
        this.setState({urlValue: this.refs.url.getValue()});
    },
    handleSubmit: function(e) {
        e.preventDefault();
        var offset = this.props.tabIdx - 1;
        var tab = this.props.tab;
        var title = this.refs.title.getValue();
        var url = this.refs.url.getValue();
        var username = this.props.username;
        console.log(this.props.tab);
        var number = this.props.tab.sources.length;
        var w = 3;
        var h = 18;
        var x = (number-parseInt(number/4)*4)*w;
        console.log(number/4);
        console.log(parseInt(number/4));
        console.log(parseInt(x));
        var y = parseInt(number/4)*h;
        if(!title || !url) {
            return;
        }
        socket.emit('sources:new', {title: title, url: url, username: username, tab: tab, x:x, y:y, h:h, w:w});
        this.setState({titleValue: ''});
        this.setState({urlValue: ''});
    },
    render: function() {
        return (
            <form className="add-source-form col-xs-2" onSubmit={this.handleSubmit}>
                <div className="add-source-inputs">
                    <Input type="text" size="22" value={this.state.titleValue} placeholder="Title" ref="title" onChange={this.handleTitleChange} />
                    <Input type="text" size="22" value={this.state.urlValue} placeholder="URL" ref="url" onChange={this.handleUrlChange} />
                </div>
                <Input type="submit" value="Add source"/>
            </form>
        );
    }
})

module.exports=AddSourceForm;
