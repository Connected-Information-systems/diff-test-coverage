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
        },
        l: {
            alias: 'line-coverage',
            describe: 'Required line coverage percentage on the diff. The application will exit with -1 if this is not reached.',
            type: 'number',
            default: 80
        },
        b: {
            alias: 'branch-coverage',
            describe: 'Required branch coverage percentage on the diff. The application will exit with -1 if this is not reached.',
            type: 'number',
            default: 80
        },
        'coverage-base-dir': {
            describe: 'The base directory for resolving relative paths in coverage reports. Uses current working directory by default.',
            type: 'string',
            default: process.cwd()
        },
        'diff-base-dir': {
            describe: 'The base directory for resolving relative paths in the diff. Uses current working directory by default.',
            type: 'string',
            default: process.cwd()
        },
        'diff-coverage-base-dir': {
            describe: 'The base directory for displaying the diff coverage results. Uses current working directory by default.',
            type: 'string',
            default: process.cwd()
        },
    })
    .demand(1)
    .example(`hg diff -r 'p1(min(branch(CPB-1352))):CPB-1352' | diff-test-coverage -c **/lcov.info -t lcov --`)
    .wrap(null)
    .argv;

application.run({
    coverageReports: {
        globs: argv.coverage,
        types: argv.type,
        baseDir: argv.coverageBaseDir
    },
    diff: {
        text: argv._[0],
        baseDir: argv.diffBaseDir
    }
}).then(({ coverageByFile, totals }) => {
    coverageLogger.log(coverageByFile, totals, {
        baseDir: argv.diffCoverageBaseDir,
        coverageThresholds: {
            lines: argv.lineCoverage,
            branches: argv.branchCoverage
        }
    });
    if(totals.lines.percentage < argv.lineCoverage || totals.branches.percentage < argv.branchCoverage){
        process.exitCode = 1;
    }
});
