var React = require('react');
var Navbar = require('react-bootstrap').Navbar;
var Nav = require('react-bootstrap').Nav;
var NavItem = require('react-bootstrap').NavItem;
var DropdownButton = require('react-bootstrap').DropdownButton;
var MenuItem = require('react-bootstrap').MenuItem;
var ButtonToolbar = require('react-bootstrap').ButtonToolbar;
var Button = require('react-bootstrap').Button;
var DropdownButton = require('react-bootstrap').DropdownButton;

var NavBar = React.createClass({   
    render: function() {
        var buttonsInstance = (
            <ButtonToolbar>
              <Button>Default</Button>
            </ButtonToolbar>
        );

        return (                
            <Navbar brand='React-Bootstrap'>
                <Nav>
                    <NavItem eventKey={1} href='#'>Link</NavItem>
                    <NavItem eventKey={2} href='#'>Link</NavItem>
                    <DropdownButton bsStyle='primary' eventKey={3} title='Add an API'>
                        <MenuItem eventKey='1'>
                            <form className="add-source-form col-xs-2" onSubmit={this.handleSubmit}>
                                <input type="text" placeholder="Title" ref="title" />
                                <br/>
                                <input type="text" placeholder="URL" ref="url" />
                                <br/>
                                <input type="submit" value="Add source" />
                            </form>
                        </MenuItem>
                        <MenuItem eventKey='2'>Another action</MenuItem>
                        <MenuItem eventKey='3'>Something else here</MenuItem>
                        <MenuItem divider />
                        <MenuItem eventKey='4'>Separated link</MenuItem>
                    </DropdownButton>
                    <Button>Import</Button>
                    <Button>Export</Button>
                </Nav>
            </Navbar>

        );
    }
});

module.exports=NavBar;
