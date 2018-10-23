const _ = require('lodash');

const diffKey = 'to';
const coverageKey = 'file';

module.exports = {
    filter
};

function filter(coverageResults, diffResults) {
    const diffByFile = indexAndFilter(diffResults, diffKey, coverageResults, coverageKey);
    const coverageByFile = indexAndFilter(coverageResults, coverageKey, diffResults, diffKey);
    return _.chain(coverageByFile)
        .cloneDeep()
        .forEach(fileCoverage => filterFileCoverage(fileCoverage, diffByFile[fileCoverage[coverageKey]]))
        .value();
}

function indexAndFilter(collection, collectionKey, filterCollection, filterCollectionKey) {
    return _.chain(collection)
        .keyBy(collectionKey)
        .pick(_.map(filterCollection, filterCollectionKey))
        .value();
}

function filterFileCoverage(fileCoverage, fileDiff) {
    const touchedLines = getTouchedLines(fileDiff);
    fileCoverage.functions = filterFunctionCoverage(fileCoverage.functions, touchedLines);
    fileCoverage.lines = filterLineOrBranchCoverage(fileCoverage.lines, touchedLines);
    fileCoverage.branches = filterLineOrBranchCoverage(fileCoverage.branches, touchedLines);
}

function filterFunctionCoverage(functionCoverage, touchedLines) {
    // We only have 1 line indication per function, therefore we cannot filter them correctly.
    return {
        hit: 0,
        found: 0,
        details: []
    };
}

function filterLineOrBranchCoverage(lineOrBranchCoverage, touchedLines) {
    const details = _.filter(lineOrBranchCoverage.details, detail => _.includes(touchedLines, detail.line));
    return {
        found: details.length,
        hit: _.sumBy(details, detail => detail.hit ? 1 : 0),
        details
    };
}

function getTouchedLines(fileDiff) {
    return _.chain(fileDiff.chunks)
        .flatMap('changes')
        .filter(change => _.includes(['add', 'normal'], change.type))
        .map('newLine')
        .value();
}
