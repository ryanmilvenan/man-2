var React = require('react');
var CollapsableMixin = require('react-bootstrap').CollapsableMixin;
var ListGroupItem = require('react-bootstrap').ListGroupItem;
var classSet = require('class-set');
var NewsItem = React.createClass({
    mixins: [CollapsableMixin],

    getCollapsableDOMNode: function(){
        return this.refs.panel.getDOMNode();
    },

    getCollapsableDimensionValue: function(){
        return this.refs.panel.getDOMNode().scrollHeight;
    },

    onHandleToggle: function(e){
        e.preventDefault();
        this.setState({expanded:!this.state.expanded});
    },

    render: function() {
        var styles = this.getCollapsableClassSet();
        return (
            <ListGroupItem key={this.props.idx}><a href="#" onClick={this.onHandleToggle}>{this.props.title}</a>
            <div ref='panel' className={classSet(styles)}>
                <div dangerouslySetInnerHTML={{__html: this.props.summary}} />
                <a href={this.props.link}>Detail</a>
            </div></ListGroupItem>
        )
    }
});

module.exports=NewsItem;
