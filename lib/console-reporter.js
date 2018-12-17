const _ = require('lodash');
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const coverageCalculator = require('./coverage-calculator');


const templates = [
    'diff-files',
    'coverage-files-line',
    'coverage-files-complete',
    'coverage-lines-line',
    'coverage-lines-branch',
    'totals-line',
    'totals-complete',
    'errors',
    'full'
];
const templateSets = {
    'full': ['diff-files', 'coverage-lines-line', 'coverage-lines-branch', 'coverage-files-complete', 'totals-complete', 'errors']
};
const templateDir = path.resolve(__dirname, '../log-templates');

module.exports = {
    report,
    templates
};

function report({coverageByFile, diffByFile, totals, options}) {
    const templateNames = getTemplatesNames(options);
    const logMessage = templateNames
        .map(templateName => getLogMessage({templateName, coverageByFile, diffByFile, totals, options}))
        .join('\n');
    console.log(_.trim(logMessage));
}

function getTemplatesNames(options) {
    return _.chain(options.consoleReport.templates)
        .map(templateName => templateSets[templateName] || templateName)
        .flatten()
        .value();
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
        getRelativePath: (file) => path.relative(options.consoleReport.baseDir, file),
        isError: (coverageResult, type) => isError(coverageResult, type, options),
        displayLineCoverage: (file, lineNumber, line) => {
            const linesCoverageDetails = _.get(coverageByFile, [file, 'lines', 'details']);
            const lineCoverage = _.find(linesCoverageDetails, detail => detail.line.toString() === lineNumber.toString());
            const isCovered = lineCoverage ? lineCoverage.hit > 0 : null;
            return displayLineCoverage(lineNumber, line, isCovered);
        },
        displayBranchCoverage: (file, lineNumber, line) => {
            const branchCoverageDetails = _.get(coverageByFile, [file, 'branches', 'details']);
            const branchCoverageList = _.filter(branchCoverageDetails, detail => detail.line.toString() === lineNumber.toString());
            const isCovered = branchCoverageList.length === 0 ? null : _.every(branchCoverageList, branchCoverage => branchCoverage.taken > 0);
            return displayLineCoverage(lineNumber, line, isCovered);
        },
        displayCoverage: (coverageResult, type, usePadding) => displayCoverage(coverageResult, type, usePadding, options)
    });
}

function displayLineCoverage(lineNumber, line, isCovered) {
    const color = getColor(isCovered);
    return color(_.padEnd(lineNumber, 4) + line) + '\n';
}

function displayCoverage(coverageResult, type, usePadding, options) {
    return displayPercentage(coverageResult, type, usePadding, options) + ' ' + displayNumbers(coverageResult, type, usePadding);
}

function displayPercentage(coverageResult, type, usePadding, options) {
    const coverageItem = coverageResult[type];
    const percentage = coverageCalculator.calculatePercentage(coverageItem);
    const percentageString = usePadding ? _.padStart(`${percentage}%`, 4) : `${percentage}%`;
    const color = getColor(isError(coverageResult, type, options));
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

function getColor(condition) {
    if (condition === null) {
        return _.identity;
    } else if (condition) {
        return chalk.green;
    } else {
        return chalk.red;
    }
}