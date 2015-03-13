var NewsContainer = React.createClass({
    render: function() {
        return (
            <div className="newsContainer">
                <h3 className="containerTitle">
                    Test Title
                </h3>
            </div>
        );
    }

});

React.render(
    <NewsContainer />,
    document.getElementById('content')
)
