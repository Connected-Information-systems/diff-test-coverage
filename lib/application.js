const _ = require('lodash');
const Promise = require('bluebird');
const coverageParser = require('@connectis/coverage-parser');
const diffParser = require('../lib/diff-parser');
const diffCoverageFilter = require('./diff-coverage-filter');
const coverageCalculator = require('./coverage-calculator');

module.exports = {
    run
};

function run({coverageReports, diff}) {
    return Promise.resolve()
        .then(() => diffParser.parse(diff.text, diff.baseDir))
        .then(diffResults => {
            const diffFiles = _.map(diffResults, 'to');
            return Promise
                .map(coverageReports.globs, (glob, index) => coverageParser.parseGlobs(glob, {
                    type: coverageReports.types[index] || _.last(coverageReports.types),
                    baseDir: coverageReports.baseDir,
                    pathMode: 'unmodified',
                    filter: item => _.some(diffFiles, file => _.endsWith(file, item.file))
                }))
                .then(coverageResults => ({
                    diffResults,
                    coverageResults: _.flatten(coverageResults)
                }))
        })
        .then(({diffResults, coverageResults}) => diffCoverageFilter.filter(coverageResults, diffResults))
        .then(coverageByFile => ({
            coverageByFile,
            totals: coverageCalculator.calculateTotals(coverageByFile)
        }));
}
