var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');
var db = require('./db.js');
var bcrypt = require('bcrypt');
var middleware = require('./middleware.js')(db);

var app = express();
var PORT = process.env.PORT || 3000;
var todos = [];
var todoNextId = 1;

app.use(bodyParser.json());

app.get('/', function (req, res) {
    res.send('Todo API Root');
});

app.get('/todos', middleware.requireAuthentication, function (req, res) {
    var query = req.query;
    var where = {
        userId: req.user.get('id')
    };

    if ( query.hasOwnProperty('completed') ) {
        if ( query.completed === 'true' ) {
            where.completed = true;
        } else {
            where.completed = false;
        }
    }

    if ( query.hasOwnProperty('q') && query.q.length > 0 ) {
        where.description = {
            $like: '%' + query.q + '%'
        };
    }

    // Why the fuck does this not work?!
    // db.todo.findAll({
    //         where: where
    //     })
    //     .then(function(todos) {
    //         res.json(todos);
    //     })
    //     .catch(function(e) {
    //         res.status(500).send();
    //     });

    db.todo.findAll({
        where: where
    }).then(function (todos) {
        res.json(todos);
    }, function () {
        res.status(500).send();
    });


});

app.get('/todos/:id', middleware.requireAuthentication, function (req, res) {
    var todoId = parseInt(req.params.id, 10);

    db.todo.findOne({
        where: {
            id: todoId,
            userId: req.user.get('id')
        }
    })
        .then(function (todo) {
            if ( !!todo ) {
                res.json(todo.toJSON());
            } else {
                res.status(404).send("There is no todo with that id.");
            }
        })
        .catch(function (e) {
            res.status(500).send();
        });
});

app.post('/todos', middleware.requireAuthentication, function (req, res) {
    var body = _.pick(req.body, 'description', 'completed');

    db.todo.create(body).then(function (todo) {
        req.user.addTodo(todo).then(function () {
            return todo.reload();
        }).then(function (tood) {
            res.send(todo.toJSON());
        });
    }).catch(function (e) {
        res.status(400).json(e);
    });

});


app.delete('/todos/:id', middleware.requireAuthentication, function (req, res) {
    var todoId = parseInt(req.params.id, 10);

    db.todo.destroy({
        where: {
            id: todoId,
            userId: req.user.get('id')
        }
    }).then(function (rowsDeleted) {
        if ( rowsDeleted === 0 ) {
            res.status(404).json({
                error: 'No todo with id'
            })
        } else {
            res.status(204).send();
        }
    }, function () {
        res.status(500).send();
    });

    // My solution, which is probably not as good.
    // db.todo.findById(todoId)
    //     .then(function(todo) {
    //         if (todo) {
    //             todo.destroy();
    //             res.send('Todo deleted');
    //         } else {
    //             res.status(404).send("No todo with that id found.");
    //         }
    //     }, function(e) {
    //         res.status(500).send();
    //     });
});


// app.put('/todos/:id', middleware.requireAuthentication, function (req, res) {
//     var todoId = parseInt(req.params.id, 10);
//     var matchedTodo = _.findWhere(todos, {id: todoId});
//     var body = _.pick(req.body, 'description', 'completed');
//     var validAttributes = {};
//
//     if ( !matchedTodo ) {
//         return res.status(404).send();
//     }
//     if ( body.hasOwnProperty('completed') && _.isBoolean(body.completed) ) {
//         validAttributes.completed = body.completed;
//     } else if ( body.hasOwnProperty('completed') ) {
//         return res.status(400).send();
//     }
//
//     if ( body.hasOwnProperty('description') && _.isString(body.description) && body.description.trim().length > 0 ) {
//         validAttributes.description = body.description;
//     } else if ( body.hasOwnProperty('description') ) {
//         return res.status(400).send();
//     }
//     _.extend(matchedTodo, validAttributes);
//     res.json(matchedTodo);
// });

app.put('/todos/:id', middleware.requireAuthentication, function (req, res) {
    var todoId = parseInt(req.params.id, 10);
    var body = _.pick(req.body, 'description', 'completed');
    var attributes = {};

    if ( body.hasOwnProperty('completed') ) {
        attributes.completed = body.completed;
    }

    if (body.hasOwnProperty('description')) {
        attributes.description = body.description;
    }

    db.todo.findOne({
        where: {
            id: todoId,
            userId: req.user.get('id')
        }
    }).then(function (todo) {
        if (todo) {
            todo.update(attributes).then(function (todo) {
                res.json(todo.toJSON());
            }, function (e) {
                res.status(400).json(e);
            });
        } else {
            res.status(404).send();
        }
    }, function() {
        res.status(500).send();
    });
});


app.post('/users', function (req, res) {
    var body = _.pick(req.body, 'email', 'password');

    db.user.create(body).then(function (user) {
        res.json(user.toPublicJSON());
    }).catch(function (e) {
        res.status(400).json(e);
    });
});

app.post('/users/login', function (req, res) {
    var body = _.pick(req.body, 'email', 'password');

    db.user.authenticate(body).then(function(user) {
        var token = user.generateToken('authentication');

        if (token) {
            res.header('Auth', token).json(user.toPublicJSON());
        } else {
            res.status(401).send();
        }
    }, function() {
        res.status(401).send();
    });

});

db.sequelize.sync({
    // force: true
    }).then(function () {
    app.listen(PORT, function () {
        console.log("Express listening on port " + PORT + "!");
    });
});




