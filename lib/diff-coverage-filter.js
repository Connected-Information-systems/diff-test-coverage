const _ = require('lodash');

module.exports = {
    filter
};

function filter(coverageResults, diffResults) {
    const diffByFile = _.keyBy(diffResults, 'to');
    const diffFiles = _.keys(diffByFile);
    const coverageByFile = indexAndFilterCoverageResults(coverageResults, diffFiles);
    return _.chain(coverageByFile)
        .cloneDeep()
        .forEach(fileCoverage => filterFileCoverage(fileCoverage, diffByFile[fileCoverage.absoluteFile]))
        .filter(fileCoverage => fileCoverage.lines.found > 0)
        .value();
}

function indexAndFilterCoverageResults(coverageResults, diffFiles) {
    return _.chain(coverageResults)
        .filter(fileCoverage => coverageFileInDiffFiles(fileCoverage.file, diffFiles))
        .forEach(fileCoverage => fileCoverage.absoluteFile = getMatchingDiffFile(fileCoverage.file, diffFiles))
        .keyBy('absoluteFile')
        .value();
}

function coverageFileInDiffFiles(coverageFile, diffFiles) {
    return _.some(diffFiles, diffFile => coverageFileMatchesDiffFile(coverageFile, diffFile));
}

function getMatchingDiffFile(coverageFile, diffFiles) {
    return _.find(diffFiles, diffFile => coverageFileMatchesDiffFile(coverageFile, diffFile));
}

function coverageFileMatchesDiffFile(coverageFile, diffFile) {
    return _.endsWith(diffFile, coverageFile);
}

function filterFileCoverage(fileCoverage, fileDiff) {
    const addedLines = getAddedLines(fileDiff);
    fileCoverage.functions = filterCoverageSection(fileCoverage.functions, addedLines);
    fileCoverage.lines = filterCoverageSection(fileCoverage.lines, addedLines);
    fileCoverage.branches = filterCoverageSection(fileCoverage.branches, addedLines);
}

function filterCoverageSection(coverageSection, addedLines) {
    const details = _.filter(coverageSection.details, detail => _.includes(addedLines, detail.line));
    return {
        found: details.length,
        hit: _.sumBy(details, detail => detail.hit ? 1 : 0),
        details
    };
}

function getAddedLines(fileDiff) {
    return _.chain(fileDiff.chunks)
        .flatMap('changes')
        .filter(change => change.type === 'add')
        .map('newLine')
        .value();
}
