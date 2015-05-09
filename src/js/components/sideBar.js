var React = require('react');
var socket = require('./socket');
var Button = require('react-bootstrap').Button;
var ButtonGroup = require('react-bootstrap').ButtonGroup;
var Modal = require('react-bootstrap').Modal;
var ModalTrigger = require('react-bootstrap').ModalTrigger;
var AddSourceForm = require('./addSourceForm');
var ImportForm = require('./importForm');
var OverlayTrigger = require('react-bootstrap').OverlayTrigger;
var Popover = require('react-bootstrap').Popover;
var Panel = require('react-bootstrap').Panel;
var ListGroup = require('react-bootstrap').ListGroup;
var ListGroupItem = require('react-bootstrap').ListGroupItem;
var Input = require('react-bootstrap').Input;

var SideBar = React.createClass({
    updateExportObj: function(data) {
        if(this.props.loggedIn && this.props.sideBar) {
            this.setState({exportObj:data})
            var dataString = JSON.stringify(this.state.exportObj);
            var dataBlob = new Blob([dataString], {type:'application/json'});
            var exportTag = React.findDOMNode(this.refs.file);
            exportTag.href = window.URL.createObjectURL(dataBlob);
        }
    },
    importObj: function(data) {
        console.log("HEARD CLICK");
        console.log(data);
    },
    getInitialState: function() {
        socket.on('server:user-exists', this.warnExistingUser);
        socket.on('server:invalid-password', this.warnInvalidPassword);
        socket.on('sources:found', this.updateExportObj);
        socket.on('addsource:success', this.hidePopover);
        socket.on('server:tabs', this.setTabs);
        return {sourceForm: false, loggedIn: false, username: "", exportObj:{}, tabs:[]};
    },
    hidePopover: function(){
        this.refs.addSource.hide();
    },
    setTabs: function(data){
        this.setState({tabs: data.tabs});
        console.log(this.state.tabs);
    },
    removeTab: function(){
        
    },
    warnExistingUser: function() {
        alert("An account with this username already exists.");
    },
    warnInvalidPassword: function() {
        alert("This username/password combination is invalid.");
    },
    toggleHidden: function() {
        if(this.state.sourceForm) {
            this.setState({sourceForm: false});
        } else
            this.setState({sourceForm: true});
    },
    handleSubmit: function(e) {
        e.preventDefault();
        var email = this.refs.email.getValue();
        var password = this.refs.password.getValue();
        if(!email || !password) {
            return;
        }
        socket.emit('client:log-in', {email: email, password: password});
        email = "";
        password = "";
    },
    handleCreateUser: function(e) {
        e.preventDefault();
        var email = this.refs.email.getValue();
        var password = this.refs.password.getValue();
        if(!email || !password) {
            return;
        }
        socket.emit('client:create-user', {email: email, password: password});
        email = "";
        password = "";
    },
    render: function() {
        // var Glyphicon = ReactBootstrap.Glyphicon;
        if(this.state.tabs.length > 0){
            console.log("tabs work", this.state.tabs.length);
            var tabs = this.state.tabs.map(function(tab){
                return(
                    <div>
                        <div onClick={this.removeTab} style={{display:'inline-block'}} className="remove-tab-button icon-bin">
                            <a href="#"></a>
                        </div>
                        <p className='remove-tab-name'> {tab.title} </p> 
                        <br/>           
                    </div>
                );
            }.bind(this));
            console.log("Tabs: ",tabs);
        }
        return (
            <div>
            {this.props.sideBar ?
            <div className="side-bar col-xs-3 text-center">
                {this.props.loggedIn ?
                <Button className='log-out-btn' bsStyle='primary' onClick={this.props.logOutHandler}>Log Out</Button>
                :
                <Panel bsStyle='primary' collapsable defaultCollapsed header='Sign In'>
                    <ListGroup fill>
                        <ListGroupItem>
                            <form className="sign-in" onSubmit={this.handleSubmit}>
                                <Input type="text" placeholder="Email" ref="email" />
                                <Input type="password" class="form-control" id="passwordField" placeholder="Password" ref="password" />
                                <Input type="submit" value="Sign in" />
                            </form>
                            <form className="createUser" onSubmit={this.handleCreateUser}>
                                <Input type="submit" value="Create New User" />
                            </form>
                        </ListGroupItem>
                    </ListGroup>
                </Panel>}

                {this.props.loggedIn ?
                <div>
                    <div className='share-template'>
                        <h4>Share your dashboard template.</h4>
                        <ButtonGroup vertical className="import-export-buttons">
                            <ModalTrigger modal={<ImportForm />}>
                                <Button>Import</Button>
                            </ModalTrigger>                             
                            <a href="#" ref="file" download="mySources">
                                <Button>Export</Button>
                            </a>
                        </ButtonGroup>
                    </div>
                    <br/>
                    <div className='remove-tab'>
                        <h5>Remove a tab.</h5>
                        {tabs}
                    </div>
                </div>
                : null }
                
                {this.props.loggedIn ?
                <OverlayTrigger ref='addSource' trigger='click' placement='left' overlay={<Popover title='Add an RSS feed'> Check this info.<AddSourceForm username={this.props.username} tab={this.props.tab} /></Popover>}>
                    <div id="scroll" className="add-button icon-plus">
                        <a href="#"></a>
                    </div>
                </OverlayTrigger>               
                : null }
            </div>
            : null}
            </div>
        )
    }
});

module.exports=SideBar
