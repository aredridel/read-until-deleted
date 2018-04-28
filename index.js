#!/usr/bin/env node

const { open, watch, stat } = require('mz/fs')
const createReadStream = require('fd-read-stream')
const { resolve } = require('path')
const pump = require('pump')
const { pipeline, through } = require('promise-streams')
const through2 = require('through2').obj
const main = require('async-main').default

main(async () => {
    const streams = await watchAndStream('test.log')
    await pipeline(streams, through(async (stream) => {
        await pipeline(stream, through(async ({data, offset}) => { console.log(data, offset) }))
    }))
})

async function watchAndStream(file) {
    const out = through2()
    try {
        const baseState = await stat(file)
        const watcher = watch(file)
        const reader = createReadStream(await open(file, 'r'), { tail: true })

        const chunker = makeChunker()
        const marker = makeMarker()

        watcher.on('change', async (eventType, newName) => {
            if (eventType != 'rename') return;
            try {
                const newState = await stat(newName)
            } catch (e) {
                if (e.code == 'ENOENT') {
                    closeOnQuiet(reader)
                } else {
                    out.emit('error', e)
                }
            }
        })

        out.push(pump(reader, chunker, marker))
    } catch (e) {
        out.emit('error', e)
    }
    return out
}

function closeOnQuiet(stream) {
    const t = setTimeout(() => stream.destroy(), 10000)

    stream.once('data', () => {
        clearTimeout(t)
        setTimeout(() => closeOnQuiet(stream), 1000)
    })
}

function makeMarker() {
    let offset = 0
    return through(async function (data) {
        const obj = { data, offset }
        this.push(obj)
        offset += data.length
    })
}

function makeChunker() {
    let buf = Buffer.alloc(0)

    return through(async function (data) {
        if (buf.length) {
            buf = Buffer.concat([buf, data])
        } else {
            buf = data
        }

        while (buf.indexOf(0x0a) != -1) {
            this.push(buf.slice(0, buf.indexOf(0x0a) + 1))
            buf = buf.slice(buf.indexOf(0x0a) + 1)
        }
    })
}
