/* global describe,it,afterEach,beforeEach */

// See https://www.npmjs.com/package/command-line-test
const CliTest = require('command-line-test')
const path = require('path')
const fs = require('fs-extra')
const should = require('should')  // eslint-disable-line no-unused-vars
const firstline = require('firstline')
const pjson = require('../package')

// If global command is used, you must 'npm link' before tests.
// const COMMAND = 'genversion';  // Global
const GENERATE_COMMAND = 'bin/genversion.js'  // Local
// const CHECK_COMMAND = 'bin/checkVersion.js'  // Local

const P = '.tmp/v.js'

const removeTemp = function () {
  if (fs.existsSync(P)) {
    fs.unlinkSync(P)
    fs.rmdirSync(path.dirname(P))
  }
}

describe('genversion cli', function () {
  beforeEach(function () {
    removeTemp()
  })

  afterEach(function () {
    removeTemp()
  })

  it('should generate file and dir if they do not exist', function (done) {
    const clit = new CliTest()

    clit.exec(GENERATE_COMMAND + ' ' + P, function (err, response) {
      if (err) {
        console.error(err, response)
        return
      }

      // Should not have any output
      response.stdout.should.equal('')
      response.stderr.should.equal('')

      fs.existsSync(P).should.equal(true)

      return done()
    })
  })

  it('should not generate if unknown file exists', function (done) {
    // Generate file with unknown signature
    const INVALID_SIGNATURE = 'foobarcontent'
    fs.outputFileSync(P, INVALID_SIGNATURE)

    const clit = new CliTest()

    clit.exec(GENERATE_COMMAND + ' ' + P, function (err, response) {
      if (err) {
        console.error(err, response)
        return
      }

      response.stderr.should.startWith('ERROR')

      // Ensure the file was not replaced
      firstline(P).then(function (line) {
        line.should.equal(INVALID_SIGNATURE)
        return done()
      }).catch(function (errc) {
        return done(errc)
      })
    })
  })

  it('should allow --es6 flag', function (done) {
    const clit = new CliTest()

    clit.exec(GENERATE_COMMAND + ' --es6 ' + P, function (err, response) {
      if (err) {
        console.error(err, response)
        return
      }

      fs.readFileSync(P).toString().should.equal('// generated by genversion\n' +
        'export const version = \'' + pjson.version + '\'\n')

      return done()
    })
  })

  it('should allow --semi and --es6 flag', function (done) {
    const clit = new CliTest()

    clit.exec(GENERATE_COMMAND + ' --semi --es6 ' + P, function (err, response) {
      if (err) {
        console.error(err, response)
        return
      }

      fs.readFileSync(P).toString().should.equal('// generated by genversion\n' +
        'export const version = \'' + pjson.version + '\';\n')

      return done()
    })
  })

  it('should allow verbose flag', function (done) {
    const clit = new CliTest()

    clit.exec(GENERATE_COMMAND + ' -v ' + P, function (err, response) {
      if (err) {
        console.error(err, response)
        return
      }

      response.stdout.should.containEql(pjson.version)

      return done()
    })
  })

  it('should allow source argument with filepath', function (done) {
    const clit = new CliTest()

    const cmd = GENERATE_COMMAND + ' --source ./test/fixture/package.json ' + P
    clit.exec(cmd, function (err, resp) {
      if (err) {
        console.error(err, resp)
        return
      }

      const wantedContent = '// generated by genversion\n' +
        'module.exports = \'0.1.2\'\n'
      fs.readFileSync(P).toString().should.equal(wantedContent)

      return done()
    })
  })

  it('should allow source argument with dirpath', function (done) {
    const clit = new CliTest()

    const cmd = GENERATE_COMMAND + ' --source ./test/fixture ' + P
    clit.exec(cmd, function (err, resp) {
      if (err) {
        console.error(err, resp)
        return
      }

      const wantedContent = '// generated by genversion\n' +
        'module.exports = \'0.1.2\'\n'
      fs.readFileSync(P).toString().should.equal(wantedContent)

      return done()
    })
  })

  it('should detect missing target path', function (done) {
    const clit = new CliTest()

    clit.exec(GENERATE_COMMAND + ' -v', function (err, response) {
      if (err) {
        console.error(err, response)
        return
      }

      // NOTE: response.stderr is null because process exited with code 1
      response.error.code.should.equal(1)

      return done()
    })
  })

  it('should show version', function (done) {
    const clit = new CliTest()

    clit.exec(GENERATE_COMMAND + ' --version', function (err, response) {
      if (err) {
        console.error(err)
        return
      }

      response.stdout.should.equal(pjson.version)

      return done()
    })
  })
})
