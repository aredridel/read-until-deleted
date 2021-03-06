#!/usr/bin/env node

const { promisify } = require('util')
const open = promisify(require('fs').open)
const stat = promisify(require('fs').stat)
const { watch } = require('fs')
const createReadStream = require('fd-read-stream')

module.exports = async function readUntilDeleted(file, options = { timeout: 10000 }) {
    const timeout = options.timeout || 10000

    const baseState = await stat(file)
    const watcher = watch(file)
    const fh = await open(file, 'r')
    const reader = createReadStream(fh, Object.assign({}, options, { tail: true }))
    reader.fh = fh
    if (options.start) reader.bytesRead = options.start

    reader.destroy = (destroy => (...args) => {
        destroy.call(reader, ...args);
        watcher.close();
    })(reader.destroy);

    watcher.on('change', async (eventType, newName) => {
        if (eventType != 'rename') return;
        try {
            const newState = await stat(newName)
        } catch (e) {
            if (e.code == 'ENOENT') {
                closeOnQuiet(reader, timeout)
                watcher.close()
            } else {
                out.emit('error', e)
            }
        }
    })

    return reader
}

function closeOnQuiet(stream, timeout) {
    const t = setTimeout(() => stream.destroy(), timeout)

    stream.once('data', () => {
        clearTimeout(t)
        setTimeout(() => closeOnQuiet(stream), 1000)
    })
}
