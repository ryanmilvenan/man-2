var socket = io();

var NewsItem = React.createClass({
    getInitialState: function() {
        return {description: []};
    },
    expandArticle: function() {
        if(this.state.description.length > 0) {
            this.setState({description: []}); 
        } else {
            this.setState({description: this.props.data.description})
        }
        console.log(this.props.data)
    },
    render: function() {
        return (
            <div className="feed-item">
                <a href={this.props.link}>{this.props.title}</a>
            </div>
        )
    }
});

var NewsContainer = React.createClass({
    updateItems: function(item) {
        if(item.sourceID == this.props.sourceID) {
            var newData = this.state.data;
            newData.push(item.data);
            this.setState(newData);
        }
    },
    deleteSource: function() {
       socket.emit('sources:remove', {sourceID: this.props.sourceID}) 
    },
    getInitialState: function() {
        socket.on('stream:item', this.updateItems);
        return {data: []};
    },
    render: function() {
        var slice = this.state.data.slice(0, this.props.numItems);
        var items = slice.map(function(item) {
            return (
                <NewsItem link={item.link} title={item.title} data={item} />
            )
        })
        return (
            <div className= "news-container three columns">
                <div className= "delete-button icon-cross">
                    <a href="#" onClick={this.deleteSource}></a>
                </div>
                <h3 className="container-title">
                    {this.props.title}
                </h3>
                {items}
            </div>
        );
    }

});

var SideBar = React.createClass({
    getInitialState: function() {
        return {sourceForm: false}
    },
    toggleHidden: function() {
        if(this.state.sourceForm) {
            this.setState({sourceForm: false})
        } else
            this.setState({sourceForm: true}) 
    },
    render: function() {
        return (
            <div>
                <button onClick={this.toggleHidden}>Hide</button>
                {this.state.sourceForm ? <AddSourceForm url={this.props.url} /> : null }
            </div>
        )
    }
});

var AddSourceForm = React.createClass({
    getInitialState: function() {
        socket.on('source:invalid', this.handleError)
        return {}
    },
    handleError: function(error) {
        alert(error.error)
    },
    handleSubmit: function(e) {
        e.preventDefault();
        var title = this.refs.title.getDOMNode().value.trim();
        var url = this.refs.url.getDOMNode().value.trim();
        if(!title || !url) {
            return;
        }
        socket.emit('sources:new', {title: title, url: url});
        title = "";
        url = "";
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
                <NewsContainer key={container.id} url={container.url} title={container.title} sourceID={container.sourceID} numItems={10} />
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
                <SideBar url={this.props.url} />
            </div>
        );
    }
    
});

React.render(
    <NewsStand url='http://localhost:3000/sources' />,
    document.getElementById('content')
)
