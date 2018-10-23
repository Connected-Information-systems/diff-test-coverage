const _ = require('lodash');
const path = require('path');

module.exports = {
    log
};

function log(coverageByFile, baseDir){
    logFilesCoverage(coverageByFile, baseDir);
    logTotals(coverageByFile);
}

function logFilesCoverage(coverageByFile, baseDir){
    console.log('Diff Code Coverage Results:\n');
    _.forEach(coverageByFile, fileCoverage => logFileCoverage(fileCoverage, baseDir));
}

function logFileCoverage(fileCoverage, baseDir){
    const percentage = calculateCoveragePercentage(fileCoverage.lines);
    const relativeFile = path.relative(baseDir, fileCoverage.file);
    console.log(`  ${percentage}% (${fileCoverage.lines.hit}/${fileCoverage.lines.found}) ${relativeFile}`);
}

function logTotals(coverageByFile){
    const totals = calculateTotals(coverageByFile);
    const totalLineCoveragePercentage = calculateCoveragePercentage(totals.lines);
    console.log(`\nTotal Diff Coverage: ${totalLineCoveragePercentage}%`);
}

function calculateTotals(coverageByFile){
    const coverageArray = _.toArray(coverageByFile);
    return {
        lines: calculateTotal(coverageArray, 'lines'),
        branches: calculateTotal(coverageArray, 'branches'),
    }
}

function calculateTotal(coverageArray, type){
    return {
        found: _.sumBy(coverageArray, fileCoverage => fileCoverage[type].found),
        hit:  _.sumBy(coverageArray, fileCoverage => fileCoverage[type].hit)
    }
}

function calculateCoveragePercentage(coverageItem){
    return _.round((coverageItem.found / coverageItem.hit) * 100, 2);
}
