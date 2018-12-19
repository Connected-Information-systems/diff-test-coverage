const _ = require('lodash');

module.exports = {
    filter
};

function filter(coverageResults, additionsByFile) {
    const additionFiles = _.keys(additionsByFile);
    const filteredCoverageResults = filterCoverageResults(coverageResults, additionFiles);
    return {
        additionsByFile,
        coverageByFile: _.chain(filteredCoverageResults)
            .cloneDeep()
            .forEach(fileCoverage => filterFileCoverage(fileCoverage, additionsByFile[fileCoverage.absoluteFile]))
            .filter(fileCoverage => fileCoverage.lines.found > 0)
            .groupBy('absoluteFile')
            .value()
    };
}

function filterCoverageResults(coverageResults, additionFiles) {
    return _.chain(coverageResults)
        .filter(fileCoverage => coverageFileInDiffFiles(fileCoverage.file, additionFiles))
        .forEach(fileCoverage => fileCoverage.absoluteFile = getMatchingDiffFile(fileCoverage.file, additionFiles))
        .value();
}

function coverageFileInDiffFiles(coverageFile, additionFiles) {
    return _.some(additionFiles, additionFile => coverageFileMatchesDiffFile(coverageFile, additionFile));
}

function getMatchingDiffFile(coverageFile, additionFiles) {
    return _.find(additionFiles, additionFile => coverageFileMatchesDiffFile(coverageFile, additionFile));
}

function coverageFileMatchesDiffFile(coverageFile, additionFile) {
    return _.endsWith(additionFile, coverageFile);
}

function filterFileCoverage(fileCoverage, fileAdditions) {
    fileCoverage.functions = filterCoverageSection(fileCoverage.functions, fileAdditions.additions, 'hit');
    fileCoverage.lines = filterCoverageSection(fileCoverage.lines, fileAdditions.additions, 'hit');
    fileCoverage.branches = filterCoverageSection(fileCoverage.branches, fileAdditions.additions, 'taken');
}

function filterCoverageSection(coverageSection, addedLines, hitKey) {
    const details = _.filter(coverageSection.details, detail => _.includes(addedLines, detail.line));
    return {
        found: details.length,
        hit: _.sumBy(details, detail => detail[hitKey] ? 1 : 0),
        details
    };
}