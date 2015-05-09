var React = require('react');
var socket = require('./socket');
var NewsContainer = require('./newsContainer');
var BasicLayout = require('./basicLayout.js')

var DisplayCase = React.createClass({
    updateSourceState: function(data) {
        this.setState({data: data});
    },
    getInitialState: function() {
        socket.on('sources:found', this.updateSourceState);
        return {data: []}
    },
    render: function() {
        return (
            <div className="display-case col-xs-9">
                <BasicLayout data={this.state.data} loggedIn={this.props.loggedIn} />
            </div>
        );
    }
});

module.exports=DisplayCase;
