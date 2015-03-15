module.exports = function(socket) {
    
    socket.on('connection', function(socket) {
        console.log('a user connection');
        socket.on('disconnect', function() {
            console.log('user disconnected')
        })
    });
};

