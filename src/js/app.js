var React = require('react');
var NewsStand = require('./components/newsStand');

React.render(
    <NewsStand url='http://localhost:3000/sources' />,
    document.getElementById('content')
);
