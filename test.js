const tape = require('tape')
const readUntilDeleted = require('./')
const { createWriteStream, unlink } = require('mz/fs')

tape('watchAndStream', t => {

  const out = createWriteStream('test.file')

  out.on('error', t.fail)
  out.on('ready', async () => {

    try {
      const reader = await readUntilDeleted('test.file')

      const received = []

      reader.on('data', (data) => received.push(data))

      out.write('test 1\n')

      await delay(100)

      out.write('test 2\n')

      await delay(150)

      await unlink('test.file')
    
      await delay(150)

      out.write('test 3\n')
      out.end()

      await delay(150)

      t.equal(received[0].toString(), 'test 1\n')
      t.equal(received[1].toString(), 'test 2\n')
      t.equal(received[2].toString(), 'test 3\n')
      t.end()
    } catch (e) {
      t.fail(e)
    }
  })

  
})

tape('watchAndStream with offset', t => {

  const out = createWriteStream('test.file')

  out.on('error', t.fail)
  out.on('ready', async () => {
    try {
      out.write('test 1\n')

      await delay(150)

      const reader = await readUntilDeleted('test.file', { start: 3 })

      const received = []

      reader.on('data', (data) => received.push(data))

      await delay(150)

      out.write('test 2\n')

      await delay(150)

      await unlink('test.file')

      await delay(150)
      
      out.write('test 3\n')
      out.end()

      await delay(150)

      t.equal(received[0].toString(), 't 1\n')
      t.equal(received[1].toString(), 'test 2\n')
      t.equal(received[2].toString(), 'test 3\n')
      t.end()
    } catch (e) {
      t.fail(e)
    }
  })

  
})

function delay(ms) {
  return new Promise(y => {
    setTimeout(y, ms)
  })
}

