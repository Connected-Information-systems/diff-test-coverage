#! /usr/bin/env node
const coverageParser = require('../lib/coverage-parser');
const application = require('../lib/application');
const coverageLogger = require('../lib/coverage-logger');

require('pipe-args').load();
const argv = require('yargs')
    .usage(`Usage: <diff command> | diff-test-coverage -c <coverage report glob> -t <coverage report type> --`)
    .options({
        c: {
            alias: 'coverage',
            demand: true,
            describe: 'Glob pattern(s) that specify which coverage report files to use.',
            type: 'array'
        },
        t: {
            alias: 'type',
            demand: true,
            describe: 'The type of coverage report. When provided multiple times the types will be mapped to the matching coverage glob patterns.',
            type: 'array',
            choices: coverageParser.types
        }
    })
    .demand(1)
    .example(`hg diff -r 'p1(min(branch(CPB-1352))):CPB-1352' | diff-test-coverage -c **/lcov.info -t lcov --`)
    .wrap(null)
    .argv;

application.run({
    coverageReports: {
        globs: argv.coverage,
        types: argv.type
    },
    diff: {
        text: argv._[0],
        baseDir: process.cwd()
    }
}).then(filteredCoverageByFile => coverageLogger.log(filteredCoverageByFile, process.cwd()));

