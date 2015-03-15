
var NewsContainer = React.createClass({
    getInitialState: function() {
        return {data: []};
    },
    render: function() {
        return (
            <div className= "news-container three columns">
                <h3 className="container-title">
                    {this.props.title}
                </h3>
            </div>
        );
    }

});

var AddSourceForm = React.createClass({
    handleSubmit: function(e) {
        e.preventDefault();
        var title = this.refs.title.getDOMNode().value.trim();
        var url = this.refs.url.getDOMNode().value.trim();
        if(!title || !url) {
            return;
        }
        $.ajax({
            url:this.props.url,
            dataType:'json',
            method: 'POST',
            data: {title: title, url: url},
            success: function(data) {
                console.log(data);
            },
            error: function(xhr, status, err) {
                console.error(this.props.url, status, err.toString());
            }.bind(this)
        });
    },
    render: function() {
        return (
            <form className="add-source-form two columns" onSubmit={this.handleSubmit}>
                <input type="text" placeholder="Title" ref="title" />
                <input type="text" placeholder="URL" ref="url" />
                <input type="submit" value="Add source" />
            </form>
        );
    }
})

var DisplayCase = React.createClass({
    render: function() {
        var containers = this.props.data.map(function(container) {
            return (
                <NewsContainer url={container.url} title={container.title} />
            );
        });

        console.log("Containers size "+containers.length)
        var chunks = [];
        var i,j,chunk = 4;
        for(i = 0, j = containers.length; i<10; i += chunk) {
            var chunkArr = containers.slice(i, i+chunk);
            chunks.push(chunkArr);
        }
        console.log("Chunks size "+chunks.length)

        var rows = chunks.map(function(chunk) {
            return(
                <div className="row">
                    {chunk}
                </div>
            );
        }) 

        console.log("ROWS" +rows)
        return (
            <div className="display-case nine columns">
                {rows}
            </div>
        );
    }
});

var NewsStand = React.createClass({
    loadNewsSources: function() {
        $.ajax({
            url: this.props.url,
            dataType: 'json',
            success: function(data) {
                console.log(data);
                this.setState({data: data});
            }.bind(this),
            error: function(xhr, status, err) {
                console.error(this.props.url, status, err.toString());
            }.bind(this)
        });
    },
    getInitialState: function() {
        return {data: [], rowCount: 0};
    },
    componentDidMount: function() {
        this.loadNewsSources();
        setInterval(this.loadNewsSources, this.props.pollInterval)
    },
    render: function() {
        return (
            <div className="news-stand twelve columns">
                <DisplayCase url={this.props.url} data={this.state.data} />
                <AddSourceForm url={this.props.url} />
            </div>
        );
    }
    
});

React.render(
    <NewsStand url='http://localhost:3000/sources' pollInterval={2000} />,
    document.getElementById('content')
)
