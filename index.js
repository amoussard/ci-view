var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var request = require('request');
var bodyParser = require('body-parser');
var sockets = [];

app.use(express.static('public'));
app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));

app.get('/', function(req, res){
  res.sendFile(__dirname + '/public/index.html');
});

app.post('/hooks/circle', function(req, res){
    var project = req.body.payload;

    sockets.forEach(socket => {
        socket.emit('new_project', {
            name: project.reponame,
            branch: decodeURIComponent(project.branch),
            status: project.status
        });
    });

    res.send('ok');
});

io.on('connection', function(socket) {
    sockets.push(socket);

    var options = {
        url: 'http://circleci.com/api/v1/projects?circle-token=435ebb00ad5ab34afc7773ed9c56cf84ea01c8be',
        headers: {
            'Accept': 'application/json'
        }
    }

    request(options, function(error, response, body) {
        var projects = JSON.parse(body);

        projects.forEach(project => {
            for (var branchName in project.branches) {
                var branch = project.branches[branchName];
                var lastBuild = branch.recent_builds.shift();

                socket.emit('new_project', {
                    name: project.reponame,
                    branch: decodeURIComponent(branchName),
                    status: lastBuild.status
                });
            }
        });
    });
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});
