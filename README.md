# staged-files

> Get staged files for use in [git hooks](https://github.com/gtramontina/ghooks) or some task runner.

## API

From the command line (mostly useful for systems without `xargs`).

```console
staged-files 'optional-pattern/**' -- optional_command
```

[Vinyl](https://github.com/gulpjs/vinyl-fs) compatible stream.

```js
var fs = require('vinyl-fs');
var stagedFiles = require('staged-files');

stagedFiles()
  .pipe(fs.src(['**/*.js'], { passthrough: true }))
  .pipe(fs.dest('./output'));
```
