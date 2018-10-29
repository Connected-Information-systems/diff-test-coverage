const _ = require('lodash');
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const coverageCalculator = require('./coverage-calculator');

const templates = ['diff-files', 'coverage-files-line', 'coverage-files-complete', 'totals-line', 'totals-complete', 'errors'];
const templateDir = path.resolve(__dirname, '../log-templates');

module.exports = {
    log,
    templates
};

function log({coverageByFile, diffByFile, totals, options}) {
    const logMessage = options.log.templates
        .map(templateName => getLogMessage({templateName, coverageByFile, diffByFile, totals, options}))
        .join('\n');
    console.log(_.trim(logMessage));
}

function getLogMessage({templateName, coverageByFile, diffByFile, totals, options}) {
    const templateFile = path.join(templateDir, templateName + '.template');
    const templateString = fs.readFileSync(templateFile, 'utf8');
    const template = _.template(templateString);
    return template({
        coverageByFile,
        diffByFile,
        totals,
        options,
        chalk,
        getRelativePath: (file) => path.relative(options.log.baseDir, file),
        isError: (coverageResult, type) => isError(coverageResult, type, options),
        displayCoverage: (coverageResult, type, usePadding) => displayCoverage(coverageResult, type, usePadding, options)
    });
}

function displayCoverage(coverageResult, type, usePadding, options) {
    return displayPercentage(coverageResult, type, usePadding, options) + ' ' + displayNumbers(coverageResult, type, usePadding);
}

function displayPercentage(coverageResult, type, usePadding, options) {
    const coverageItem = coverageResult[type];
    const percentage = coverageCalculator.calculatePercentage(coverageItem);
    const percentageString = usePadding ? _.padStart(`${percentage}%`, 4) : `${percentage}%`;
    const color = isError(coverageResult, type, options) ? chalk.red : chalk.green;
    return color(percentageString);
}

function displayNumbers(coverageResult, type, usePadding) {
    const coverageItem = coverageResult[type];
    const numberString = `(${coverageItem.hit}/${coverageItem.found})`;
    return usePadding ? _.padEnd(numberString, 9) : numberString;
}

function isError(coverageResult, type, options) {
    const percentage = coverageCalculator.calculatePercentage(coverageResult[type]);
    return percentage < options.coverageThresholds[type];
}
