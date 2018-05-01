#!/usr/bin/env node

const { open, watch, stat } = require('mz/fs')
const createReadStream = require('fd-read-stream')

module.exports = async function readUntilDeleted(file, options = { timeout: 10000 }) {
    const baseState = await stat(file)
    const watcher = watch(file)
    const reader = createReadStream(await open(file, 'r'), { tail: true })
    const { timeout } = options

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
