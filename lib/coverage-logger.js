const _ = require('lodash');
const path = require('path');
const chalk = require('chalk');
const coverageCalculator = require('./coverage-calculator');

module.exports = {
    log
};

function log(coverageByFile, totals, options){
    logFilesCoverage(coverageByFile, options);
    logTotals(totals, options);
}

function logFilesCoverage(coverageByFile, options){
    console.log('Diff Code Coverage Results:\n');
    _.forEach(coverageByFile, fileCoverage => logFileCoverage(fileCoverage, options));
}

function logFileCoverage(fileCoverage, options){
    const percentageString = getPercentageLogString(fileCoverage.lines, options.coverageThresholds.lines);
    const relativeFile = path.relative(options.baseDir, fileCoverage.file);
    console.log(`  ${percentageString} (${fileCoverage.lines.hit}/${fileCoverage.lines.found}) ${relativeFile}`);
}

function logTotals(totals, options){
    const totalLineCoveragePercentageString = getPercentageLogString(totals.lines, options.coverageThresholds.lines);
    console.log(`\nTotal Diff Coverage: ${totalLineCoveragePercentageString}`);
}

function getPercentageLogString(coverageItem, threshold){
    const percentage = coverageCalculator.calculatePercentage(coverageItem);
    const color = percentage < threshold ? chalk.red : chalk.green;
    return color(percentage + '%');
}
