"use strict";
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
const fs = require("fs")

//var logger = require('morgan');
//var routes = require('./routes/router');
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
//app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use( express.static( __dirname + '/views' ) );
app.use( '/static', express.static( __dirname + '/static' ) )
app.use( '/src', express.static( path.join(__dirname, 'src' ) ))
app.use( '/tests', express.static( __dirname + '/tests' ) )
app.use( '/node', express.static( __dirname + '/node_modules' ) )
app.use( '/img', express.static( __dirname + '/static/resources/img' ) )
app.use( '/datas', express.static( __dirname + '/static/resources/datas' ) )


app.get( '/', ( req, res ) => {
    res.render( 'index.html' );
} );

var util = require('util');
var log_file = fs.createWriteStream(__dirname + '/debug.log', {flags : 'w'});
var log_stdout = process.stdout;

console.log = function(d) { //
  log_file.write(util.format(d) + '\n');
  log_stdout.write(util.format(d) + '\n');
};

module.exports = app;
