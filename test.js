const tape = require('tape')
const readUntilDeleted = require('./')
const { createWriteStream, unlink } = require('mz/fs')

tape('watchAndStream', t => {

  const out = createWriteStream('test.file')

  out.on('error', t.fail)
  out.on('ready', async () => {

    const reader = await readUntilDeleted('test.file')

    const received = []

    reader.on('data', (data) => received.push(data))

    out.write('test 1\n')
    setTimeout(() => {
      out.write('test 2\n')
    }, 100)

    setTimeout(async () => {
      try {
        await unlink('test.file')
      } catch (e) {
        t.fail(e)
      }
    }, 200)
    
    setTimeout(() => {
      out.write('test 3\n')
    }, 300)

    setTimeout(() => {
      t.equal(received[0].toString(), 'test 1\n')
      t.equal(received[1].toString(), 'test 2\n')
      t.equal(received[2].toString(), 'test 3\n')
      t.end()
    }, 500)
  })

  
})
