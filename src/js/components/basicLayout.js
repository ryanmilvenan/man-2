'use strict';
var PureRenderMixin = require('react/lib/ReactComponentWithPureRenderMixin');
var ReactGridLayout = require('react-grid-layout');
var React = require('react');
var ResponsiveReactGridLayout = require('react-grid-layout').Responsive;
var _ = require('lodash');
var NewsContainer = require('./newsContainer');
var socket = require('./socket');

var BasicLayout = React.createClass({
  mixins: [PureRenderMixin],

  getDefaultProps: function() {
    return {
      className: "layout",
      cols: 12,
      rowHeight: 38
    };
  },

  getInitialState: function() {
    var ls = {};
    if (global.localStorage) {
      try {
        ls = JSON.parse(global.localStorage.getItem('rgl-7')) || {};
      } catch(e) {}
    }
    return {layout: ls.layout || []};
  },

  componentDidUpdate: function(prevProps, prevState) {
    this._saveToLocalStorage();
  },

  resetLayout: function() {
    this.setState({layout: []});
  },

  _saveToLocalStorage: function() {
    if (global.localStorage) {
      global.localStorage.setItem('rgl-7', JSON.stringify({
        layout: this.state.layout
      }));
    }
  },

  onLayoutChange: function(layout) {
    console.log('layout changed', layout);
    // this.props.onLayoutChange(layout); // updates status display
    this.setState({layout: layout});
    console.log(layout);
    console.log(this.props.data);
    var counter = 0
    for (var i = 0; i < this.props.data.length; i++){
      socket.emit('sources:updatePosition', {sourceID: this.props.data[i].sourceID, x: layout[i].x, y: layout[i].y})
    }
  },

  generateDOM: function() {
    var counter = 0
    var containers = this.props.data.map(function(container) {
        counter += 1
        // console.log(container)
            return (
              <div key={counter} _grid={{w: container.w, h: container.h, x: container.x, y: container.y}}>
                <NewsContainer key={container.id} url={container.url} title={container.title} sourceID={container.sourceID} numItems={10} loggedIn={this.props.loggedIn} />
              </div>
            );
        }.bind(this));
    return containers
  },

  render: function() {
    console.log
    return (
      <div>
        <ReactGridLayout
            {...this.props}
            layout={this.state.layout}
            onLayoutChange={this.onLayoutChange}>
            {this.generateDOM()}
        </ReactGridLayout>
      </div>
    );
  }
});

module.exports = BasicLayout;

