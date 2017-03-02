const express = require('express');
const util = require('util');
const expressValidator = require('express-validator');
const promise = require('bluebird');
const serveStatic = require('serve-static');
const path = require('path');
const options = {
    promiseLib: promise,
};
const pgp = require('pg-promise')(options);

const cn = process.env.DATABASE_URL || "postgres://admin:root123@localhost:5432/task_manager";
const db = pgp(cn);
const bodyParser = require('body-parser');

const app = express();


app.set('port', (process.env.PORT || 5000));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false,
}));
app.use(expressValidator());

app.use(serveStatic(path.resolve(__dirname + '/client')));

app.all('*', (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers',
        'Content-Type,Content-Length, Authorization, Accept,X-Requested-With');
    res.header('Access-Control-Allow-Methods', 'PUT,POST,GET,DELETE,OPTIONS');
    if (req.method === 'OPTIONS') {
        res.send(200);
    } else {
        next();
    }
});

//  TODO: move to routes.api file
app.get('/data', (req, res) => {
    db.any('select array_to_json(array(select row_to_json(n) from projects p left join lateral (select p.id, p.name, p.deadline, array_to_json(array(select row_to_json((select a from (select t.id, t.name, t.status, t.priority) a)) from tasks t where project_id = p.id)) as tasks) n on true ))')
        .then((data) => {
            const result = data[0].array_to_json;
            res.send(JSON.stringify(result));
        });
});

app.get('/projects', (req, res) => {
    db.any('select * from projects')
        .then((data) => {
            res.send(JSON.stringify(data));
        })
        .catch((error) => {
            console.log(error);
        });
});

app.post('/addProject', (req, res) => {
    req.checkBody({
        'projectname': {
            notEmpty: true,
            errorMessage: 'No projectname'
        },
        'deadline': {
            notEmpty: true,
            errorMessage: 'No deadline data'
        }
    });
    const data = [req.body.projectname, req.body.deadline];
    req.getValidationResult().then(function(result) {
        if (!result.isEmpty()) {
            res.status(400).send('There have been validation errors: ' + util.inspect(result.array()));
            return;
        }
        db.none('insert into projects(name, deadline) values($1, $2)', data)
            .then(() => {
                res.send('New project has been successfully added!');
            })
            .catch((error) => {
                console.error(error);
            });
    });
});

app.delete('/project/:project_id', (req, res) => {
    req.checkParams('project_id', 'Invalid urlparam').isInt();
    const data = parseInt(req.params.project_id, 10);

    req.getValidationResult().then(function(result) {
        if (!result.isEmpty()) {
            res.status(400).send('There have been validation errors: ' + util.inspect(result.array()));
            return;
        }
        db.result('delete from projects where id=$1', data)
            .then((result) => {
                res.send(`Project with id: ${data} has been successfully deleted!`);
            })
            .catch((error) => {
                console.log('ERROR:', error.message || error);
            });
    });
});

app.put('/project/:project_id', (req, res) => {
    req.checkParams('project_id', 'Invalid urlparam').isInt();
    req.checkBody({
        'name': {
            notEmpty: true,
            errorMessage: 'No projectname'
        },
        'deadline': {
            notEmpty: true,
            errorMessage: 'No deadline data'
        }
    });
    req.getValidationResult().then(function(result) {
        if (!result.isEmpty()) {
            res.status(400).send('There have been validation errors: ' + util.inspect(result.array()));
            return;
        }
        db.none('update projects set name=$1, deadline=$2 where id=$3', [req.body.name, req.body.deadline, parseInt(req.params.project_id, 10)])
            .then(() => {
                res.status(200)
                    .json({
                        status: 'success',
                        message: 'Updated project',
                    });
            })
            .catch((err) => {
                console.log(err);
            });
    });
});


app.post('/addTask', (req, res) => {
    req.checkBody({
        'name': {
            notEmpty: true,
            errorMessage: 'No projectname'
        },
        'status': {
            notEmpty: true,
            isBoolean: true,
            errorMessage: 'No status data or not bool'
        },
        'project_id': {
            notEmpty: true,
            isInt: true,
            errorMessage: 'No project id or not int'
        },
        'priority': {
            notEmpty: true,
            isInt: true,
            errorMessage: 'No priority or not int'
        }
    });
    const data = [req.body.name, req.body.status, req.body.project_id, req.body.priority];
    req.getValidationResult().then(function(result) {
        if (!result.isEmpty()) {
            res.status(400).send('There have been validation errors: ' + util.inspect(result.array()));
            return;
        }
        db.none('insert into tasks(name, status, project_id, priority) values($1, $2, $3, $4)',
            data).then(() => {
            res.send(`Task with id: ${data} has been successfully added!`);
        }).catch((error) => {
            console.error(error);
        });
    });
});

app.delete('/task/:task_id', (req, res) => {
    req.checkParams('task_id', 'Invalid urlparam').isInt();
    const data = parseInt(req.params.task_id, 10);
    req.getValidationResult().then(function(result) {
        if (!result.isEmpty()) {
            res.status(400).send('There have been validation errors: ' + util.inspect(result.array()));
            return;
        }
        db.result('delete from tasks where id=$1', data)
            .then((result) => {
                res.send(`Task with id: ${data} has been successfully deleted!`);
            })
            .catch((error) => {
                console.log('ERROR:', error.message || error);
            });
    });
});

app.put('/task/:task_id', (req, res) => {
    req.checkParams('task_id', 'Invalid urlparam').isInt();
    req.checkBody({
        'name': {
            notEmpty: true,
            errorMessage: 'No projectname'
        },
        'status': {
            notEmpty: true,
            isBoolean: true,
            errorMessage: 'No status data or not bool'
        },
        'priority': {
            notEmpty: true,
            isInt: true,
            errorMessage: 'No priority or not int'
        }
    });
    req.getValidationResult().then(function(result) {
        if (!result.isEmpty()) {
            res.status(400).send('There have been validation errors: ' + util.inspect(result.array()));
            return;
        }
        db.none('update tasks set name=$1, status=$2, priority=$3 where id=$4', [req.body.name, req.body.status, req.body.priority, parseInt(req.params.task_id, 10)])
            .then(() => {
                res.status(200)
                    .json({
                        status: 'success',
                        message: 'Updated puppy',
                    });
            })
            .catch((err) => {
                console.log(err);
            });
    });
});

app.listen(app.get('port'), function() {
    console.log('Node app is running on port', app.get('port'));
});
