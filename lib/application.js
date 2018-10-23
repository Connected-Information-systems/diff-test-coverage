const _ = require('lodash');
const Promise = require('bluebird');
const coverageParser = require('../lib/coverage-parser');
const diffParser = require('../lib/diff-parser');
const diffCoverageFilter = require('./diff-coverage-filter');

module.exports = {
    run
};

function run({ coverageReports, diff }){
    return Promise.resolve()
        .then(() => diffParser.parse(diff.text, diff.baseDir))
        .then(diffResults => {
            const diffFiles = _.map(diffResults, 'to');
            return coverageParser.parseGlobs(coverageReports.globs, coverageReports.types, item => _.includes(diffFiles, item.file))
                .then(coverageResults => ({
                    diffResults,
                    coverageResults
                }))
        })
        .then(({diffResults, coverageResults}) => diffCoverageFilter.filter(coverageResults, diffResults));
}
