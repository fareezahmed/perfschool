'use strict';

var fs = require('fs');
var path = require('path');
var express = require('express');
var psi = require('psi');
var localtunnel = require('localtunnel');
var app = express();
var port = process.argv[2] || 7777;

app.set('json spaces', 2);
app.get('/', home);
app.get('/insights', insights);
app.listen(port, listening);

function listening () {
  console.log('Listening on port', port);
}

function home (req, res) {
  var file = path.join(__dirname, 'index.html');
  var index = fs.readFileSync(file, 'utf8');
  res.send(index);
}

function insights (req, res, next) {
  localtunnel(port, tunneled);
  function tunneled (err, tunnel) {
    if (err) {
      next(err); return;
    }
    psi(tunnel.url, stats);
    function stats (err, data) {
      tunnel.close();

      if (err) {
        next(err); return;
      }
      res.json({
        resources: {
          js: data.pageStats.numberJsResources,
          css: data.pageStats.numberCssResources,
          total: data.pageStats.numberResources,
          hosts: data.pageStats.numberHosts
        }
      });
    }
  }
}
