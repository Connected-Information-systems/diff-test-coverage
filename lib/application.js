const _ = require('lodash');
const Promise = require('bluebird');
const coverageParser = require('@connectis/coverage-parser');
const coverageMerger = require('@connectis/coverage-merger');
const diffParser = require('../lib/diff-parser');
const diffAdditionFilterMerger = require('./diff-addition-filter-merger');
const diffCoverageFilter = require('./diff-coverage-filter');
const coverageCalculator = require('./coverage-calculator');

module.exports = {
    run
};

function run({coverageReports, diff}) {
    return Promise.resolve()
        .then(() => diffParser.parse(diff.text, diff.baseDir))
        .then(fileDiffs => diffAdditionFilterMerger.filterAndMerge(fileDiffs, {diff}))
        .then(additionsByFile => {
            const diffFiles = _.keys(additionsByFile);
            return Promise
                .map(coverageReports.globs, (glob, index) => coverageParser.parseGlobs(glob, {
                    type: coverageReports.types[index] || _.last(coverageReports.types),
                    baseDir: coverageReports.baseDir,
                    pathMode: 'unmodified',
                    filter: item => _.some(diffFiles, file => _.endsWith(file, item.file))
                }))
                .then(coverageResults => ({
                    additionsByFile: additionsByFile,
                    coverageResults: _.flatten(coverageResults)
                }))
        })
        .then(({additionsByFile, coverageResults}) => diffCoverageFilter.filter(coverageResults, additionsByFile))
        .then(({coverageByFile, additionsByFile}) => ({
            additionsByFile,
            coverageByFile: _.mapValues(coverageByFile, filesCoverage => coverageMerger.merge(filesCoverage))
        }))
        .then(({coverageByFile, additionsByFile}) => ({
            additionsByFile,
            coverageByFile,
            totals: coverageCalculator.calculateTotals(coverageByFile)
        }));
}
