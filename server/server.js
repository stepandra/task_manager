const express = require('express');
const promise = require('bluebird');

const options = {
  promiseLib: promise,
};
const pgp = require('pg-promise')(options);

const cn = {
  host: 'localhost',
  port: 5432,
  database: 'task_manager',
  user: 'admin',
  password: 'root123',
};

const db = pgp(cn);
const bodyParser = require('body-parser');

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

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

app.get('/data', (req, res) => {
  db.any('select array_to_json(array(select row_to_json(n) from projects p left join lateral (select p.id, p.name, array_to_json(array(select row_to_json((select a from (select t.id, t.name, t.status, t.priority) a)) from tasks t where project_id = p.id)) as tasks) n on true ))')
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
  const data = [req.body.projectname];
  db.none('insert into projects(name) values($1)', data)
    .then(() => {
      res.send('New project has been successfully added!');
    })
    .catch((error) => {
      console.error(error);
    });
});

app.post('/addTask', (req, res) => {
  const data = [req.body.name, req.body.status, req.body.project_id, req.body.priority];
  db.none('insert into tasks(name, status, project_id, priority) values($1, $2, $3, $4)',
  data).then(() => {
      res.send('New task has been successfully added!');
    }).catch((error) => {
      console.error(error);
    });
});

app.delete('/task/:task_id', (req, res) => {
  const data = parseInt(req.params.task_id, 10);
  db.result('delete from tasks where id=$1', data)
    .then((result) => {
        // rowCount = number of rows affected by the query
      console.log(result.rowCount); // print how many records were deleted;
      res.send(`Task with id: ${data} has been successfully deleted!`);
    })
    .catch((error) => {
      console.log('ERROR:', error.message || error);
    });
});

app.put('/task/:task_id', (req, res) => {
  db.none('update tasks set name=$1, status=$2, priority=$3 where id=$4',
    [req.body.name, req.body.status, req.body.priority, parseInt(req.params.task_id, 10)])
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

app.listen(3000);
