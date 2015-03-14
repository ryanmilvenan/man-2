
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
        this.props.wrapRows()
        return (
            <div className="display-case nine columns">
                {containers}
            </div>
        );
    }
});

var NewsStand = React.createClass({
    wrapRows: function() {
        
        var idx = $('.display-case').children().length;
        
        var numRowsArr = []
        var classIdx = 0;
        var childIdx = 0;
        $('.display-case').find('.news-container').each(function(container) {
            if(childIdx % 4 == 0) {
                classIdx++;
                numRowsArr.push(classIdx);
            }
            var rowName = "row-"+classIdx;
            $(this).addClass(rowName)
            childIdx++;
        });
        
        if(childIdx >= 4) {
            for(var i = 0; i < numRowsArr.length; i++) {
                var rowName = ".row-" + numRowsArr[i];
                var wrapped = $(rowName).parent().hasClass('row');
                if(!wrapped) {
                    $(rowName).wrapAll("<div class='row' />");
                }
            }
        }
    },
    loadNewsSources: function() {
        $.ajax({
            url: this.props.url,
            dataType: 'json',
            success: function(data) {
                console.log(data);
                this.setState({data: data});
                this.wrapRows();
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
                <DisplayCase url={this.props.url} data={this.state.data} wrapRows={this.wrapRows} />
                <AddSourceForm url={this.props.url} />
            </div>
        );
    }
    
});

React.render(
    <NewsStand url='http://localhost:3000/sources' pollInterval={2000} />,
    document.getElementById('content')
)
