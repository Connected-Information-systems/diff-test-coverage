const _ = require('lodash');
const path = require('path');
const chalk = require('chalk');
const coverageCalculator = require('./coverage-calculator');

module.exports = {
    log
};

function log(coverageByFile, totals, options) {
    logFilesCoverage(coverageByFile, options);
    logTotals(totals, options);
    logErrors(totals, options);
}

function logFilesCoverage(coverageByFile, options) {
    console.log('Diff Code Coverage Results:\n');
    _.forEach(coverageByFile, fileCoverage => logFileCoverage(fileCoverage, options));
    console.log('');
}

function logFileCoverage(fileCoverage, options) {
    const percentageString = getPercentageLogString(fileCoverage.lines, options.coverageThresholds.lines, true);
    const relativeFile = path.relative(options.diff.baseDir, fileCoverage.absoluteFile);
    console.log(`  ${_.padStart(percentageString, 4)} (${fileCoverage.lines.hit}/${fileCoverage.lines.found}) ${relativeFile}`);
}

function logTotals(totals, options) {
    const totalLineCoveragePercentageString = getPercentageLogString(totals.lines, options.coverageThresholds.lines);
    console.log(`Total Diff Coverage: ${totalLineCoveragePercentageString}\n`);
}

function logErrors(totals, options) {
    logError(totals, 'lines', options);
    logError(totals, 'branches', options);
    logError(totals, 'functions', options);
}

function logError(totals, type, options){
    if (totals[type].percentage < options.coverageThresholds[type]) {
        console.log(`${chalk.red('ERROR:')} Insufficient ${type} coverage of ${getPercentageLogString(totals[type], options.coverageThresholds[type])} (${totals[type].hit}/${totals[type].found}). Required ${options.coverageThresholds[type]}%.`)
    }
}

function getPercentageLogString(coverageItem, threshold, usePadding = false) {
    const percentage = coverageCalculator.calculatePercentage(coverageItem);
    const percentageString = usePadding ? _.padStart(percentage + '%', 4) : percentage + '%';
    const color = percentage < threshold ? chalk.red : chalk.green;
    return color(percentageString);
}
