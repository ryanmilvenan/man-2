var React = require('react');
var PageHeader = require('react-bootstrap').PageHeader;
var TabbedArea = require('react-bootstrap').TabbedArea;
var TabPane = require('react-bootstrap').TabPane;
var socket = require('./socket');
var DisplayCase = require('./displayCase');

var TopBar = React.createClass({   
    loadTabs: function(data) {
        this.setState({data: data.tabs});
        this.setState({numTabs: data.tabs.length});
        var offset = this.state.key - 1;
        this.props.tabHandler(this.state.data[offset]);
        socket.emit('sources:populate', {user: this.props.username, tab: data.tabs[offset]});
    },
    handleSelect: function(key) {
        if(key > this.state.numTabs) {
            this.handleNewTab(key);
        } else {
            this.setState({key: key});
            var offset = this.state.data.length - this.state.key;
            this.props.tabHandler(this.state.data[offset]);
            socket.emit('sources:populate', {user:this.props.username, tab: this.state.data[offset]});
        }
    },
    handleNewTab: function(key) {
        var tabTitle = prompt("What is the name of your new tab?");
        var tabIdx = key - 1;
        if(tabTitle) {
            socket.emit("tab:new", {title: tabTitle, user:this.props.username, tabIdx:tabIdx});
        }
    },
    toggleSideBar: function() {
        this.props.sidebarHandler();
    },
    getInitialState: function() {
        socket.on('server:tabs', this.loadTabs);
        return {data: [], key: 1, numTabs: 0, colSize:"col-xs-12"};
    },
    handleSideBar: function() {
        if(this.props.sideBar) {
            this.setState({colSize:"col-xs-12"});
        } else {
            this.setState({colSize:"col-xs-9"});
        }
    },
    render: function() {
        var tabIdx = 0;
        var tabs = this.state.data.map(function(tab) {
            tabIdx++;
            return (
                <TabPane key={tabIdx} eventKey={tabIdx} tab={tab.title} > 
                    <DisplayCase key={tabIdx} url={this.props.url} loggedIn={this.props.loggedIn} />
                </TabPane>
            )
        }.bind(this));
        tabIdx++;
        return (
            <div className={this.state.colSize}>
             
                <PageHeader className="title"><small>Homepage 2.0</small></PageHeader>
                <iframe src="https://duckduckgo.com/search.html?prefill=search duckduckgo" className="search-bar" frameBorder="0"></iframe>

                <div className="menu-button icon-cog">
                    <a href="#" onClick={this.toggleSideBar}></a>
                </div>
                <TabbedArea activeKey={this.state.key} onSelect={this.handleSelect}>
                    {tabs}
                    {this.props.username ? 
                    <TabPane eventKey={tabIdx} tab="Add New"></TabPane>
                    : null}
                </TabbedArea>                
            </div>
        );
    }
});

module.exports=TopBar;
