read-until-deleted
==================

Yet another file tailing module.

Simply reads a file until it is quiet after being deleted, including following renames.

This lets log rotation follow files, keep reading any data written into them as log rotation flushes logs out.

Synopsis
--------

```javascript
const readUntilDeleted = require('read-until-deleted')

function readUntilDeleted(filename, { timeout: 10000 }) -> Promise<Stream>
```

Example
-------

```javascript
const reader = await readUntilDeleted('test.file')
reader.pipe(process.stdout)
```


Exceptions
----------

Throws `{ code: "ENOENT" }` if the file does not exist
