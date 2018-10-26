#! /usr/bin/env node
const path = require('path');
const Promise = require('bluebird');
const getStdin = require('get-stdin');
const coverageParser = require('@connectis/coverage-parser');
const application = require('../lib/application');
const coverageLogger = require('../lib/coverage-logger');

Promise.resolve()
    .then(addStdinToArgv)
    .then(parseCommandLineArgs)
    .then(runApplication);


function addStdinToArgv() {
    return getStdin()
        .then(stdin => {
            process.argv.push(stdin.trim());
        });
}

function parseCommandLineArgs() {
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
            f: {
                alias: 'function-coverage',
                describe: 'Required function coverage percentage on the diff. The application will exit with -1 if this is not reached.',
                type: 'number',
                default: 80
            },
            'diff-base-dir': {
                describe: 'The base directory for resolving relative paths in the diff. Uses current working directory by default.',
                type: 'string',
                default: process.cwd()
            }
        })
        .demand(1)
        .example(`git diff master...MY-BRANCH | diff-test-coverage -c **/coverage.xml -t cobertura --`, `Runs 'diff-test-coverage' with a git diff and Cobertura coverage reports.`)
        .example(`hg export -r "branch(.) and not merge()" | diff-test-coverage -c **/target/site/jacoco/jacoco.xml -t jacoco --`, `Runs 'diff-test-coverage' with a mercurial diff and Jacoco coverage reports.`)
        .example(`git diff master...MY-BRANCH `, `Creates a diff of the Git branch 'MY-BRANCH' which originated from the master branch.`)
        .example(`hg export -r "branch(.) and not merge()"`, `Creates a diff of the current Mercurial branch, excluding any merge commits.`)
        .example(`hg export -r "branch(MY-BRANCH) and not merge()"`, `Creates a diff of the Mercurial branch MY-BRANCH, excluding any merge commits.`)
        .wrap(null)
        .argv;

    return {
        coverageReports: {
            globs: argv.coverage,
            types: argv.type
        },
        diff: {
            text: argv._[0],
            baseDir: path.resolve(argv.diffBaseDir)
        },
        coverageThresholds: {
            lines: argv.lineCoverage,
            branches: argv.branchCoverage,
            functions: argv.functionCoverage
        }
    };
}

function runApplication(options) {
    return application.run(options)
        .then(({coverageByFile, totals}) => {
            coverageLogger.log(coverageByFile, totals, options);

            if (totals.lines.percentage < options.coverageThresholds.lines ||
                totals.branches.percentage < options.coverageThresholds.branches ||
                totals.functions.percentage < options.coverageThresholds.functions) {
                process.exitCode = 1;
            }
        });
}
