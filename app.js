const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const app = express();

app.use(logger('dev'))
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/memo', require('./routes/memo'));
app.use('/users', require('./routes/users'));
const port = 5000
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

module.exports = app;
