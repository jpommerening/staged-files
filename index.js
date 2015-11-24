var spawn = require('child_process').spawn;
var os = require('os');
var through = require('through2');
var assign = require('object-assign');
var File = require('vinyl');

function fileStream(base) {
  function createFile(line) {
    var path = line.toString();
    if (path) {
      this.push(new File({ base: base, path: path }));
    }
  }

  var buffer = new Buffer('');
  return through.obj(function write(chunk, enc, cb) {
    var i = 0;
    var lines = (buffer + chunk).split(os.EOL);
    buffer = lines.pop();
    lines.forEach(createFile, this);
    cb();
  }, function end(cb) {
    createFile.call(this, buffer);
    cb();
  });
}

function stagedFiles(opt) {
  var buffers = [];
  var options = assign({
    cwd: process.cwd()
  }, opt);

  var stdout = spawn('git', [
    'rev-parse',
    '--show-toplevel',
    '--is-inside-work-tree'
  ], options).stdout;

  return stdout.pipe(through.obj(function write(chunk, enc, cb) {
    buffers.push(chunk);
    cb();
  }, function end(cb) {
    var data = buffers.join('').split(os.EOL);
    if (data.length >= 2 && data[0] && data[1] === 'true') {
      var base = data[0];
      var stdout = spawn('git', [ 'diff', '--cached', '--name-only' ], options).stdout;
      var files = stdout.pipe(fileStream(base));

      files.on('error', this.emit.bind(this, 'error'));
      files.on('data', this.push.bind(this));
      files.on('end', cb);
    }
  }));
}

module.exports = stagedFiles;
