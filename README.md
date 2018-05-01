read-until-deleted
==================

Yet another file tailing module.

Simply reads a file until it is quiet after being deleted, including following renames.

This lets log rotation follow files, keep reading any data written into them as log rotation flushes logs out.

Synopsis
--------

```javascript
const readUntilDeleted = require('read-until-deleted')

function readUntilDeleted(filename, { timeout: 10000, start: 0 }) -> Promise<Stream>
```

The timeout is how long a file that has been deleted will be watched for new input

The start position is where to start reading in the file.

Example
-------

```javascript
const reader = await readUntilDeleted('test.file', { start: 1024 })
reader.pipe(process.stdout)
```


Exceptions
----------

Throws `{ code: "ENOENT" }` if the file does not exist
