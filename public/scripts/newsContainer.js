var socket = io();
var NewsContainer = React.createClass({
    updateItems: function(item) {
        if(item.sourceID == this.props.sourceID) {
            var newData = this.state.data;
            newData.push(item.data);
            this.setState(newData);
        }
    },
    getInitialState: function() {
        socket.on('stream:item', this.updateItems);
        return {data: []};
    },
    render: function() {
        var slice = this.state.data.slice(0, this.props.numItems);
        var items = slice.map(function(item) {
            return (
                <div className="feed-item">
                    <a href={item.link}>{item.title}</a>
                </div>
            )
        })
        return (
            <div className= "news-container three columns">
                <h3 className="container-title">
                    {this.props.title}
                </h3>
                {items}
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
        socket.emit('sources:new', {title: title, url: url});
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
                <NewsContainer url={container.url} title={container.title} sourceID={container.sourceID} numItems={10} />
            );
        });

        var chunks = [];
        var i,j,chunk = 4;
        for(i = 0, j = containers.length; i<j; i += chunk) {
            var chunkArr = containers.slice(i, i+chunk);
            chunks.push(chunkArr);
        }

        var rows = chunks.map(function(chunk) {
            return(
                <div className="row">
                    {chunk}
                </div>
            );
        }) 

        return (
            <div className="display-case nine columns">
                {rows}
            </div>
        );
    }
});

var NewsStand = React.createClass({
    loadNewsSources: function() {
        socket.emit('sources:retrieve')
    },
    updateSourceState: function(data) {
        this.setState({data: data});
    },
    getInitialState: function() {
        socket.on('update:sources', this.loadNewsSources);
        socket.on('sources:found', this.updateSourceState);
        return {data: []};
    },
    componentDidMount: function() {
        this.loadNewsSources();
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
