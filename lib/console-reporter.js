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
            return displayLineCoverage(lineNumber, line, linesCoverageDetails);
        },
        displayBranchCoverage: (file, lineNumber, line) => {
            const branchesCoverageDetails = _.get(coverageByFile, [file, 'branches', 'details']);
            return displayBranchCoverage(lineNumber, line, branchesCoverageDetails);
        },
        displayCoverage: (coverageResult, type, usePadding) => displayCoverage(coverageResult, type, usePadding, options)
    });
}

function displayLineCoverage(lineNumber, line, linesCoverageDetails) {
    const lineCoverage = _.find(linesCoverageDetails, detail => detail.line.toString() === lineNumber.toString());
    const isCovered = lineCoverage ? lineCoverage.hit > 0 : null;
    const color = getColor(isCovered);
    return color(_.padEnd(lineNumber, 4) + line) + '\n';
}

function displayBranchCoverage(lineNumber, line, branchesCoverageDetails) {
    const branchCoverageList = _.filter(branchesCoverageDetails, detail => detail.line.toString() === lineNumber.toString());
    const coverage = {
        found: branchCoverageList.length,
        hit: _.sumBy(branchCoverageList, branchCoverage => branchCoverage.taken ? 1: 0)
    };
    const isCovered = coverage.found === 0 ? null : coverage.found === coverage.hit;
    const color = getColor(isCovered);
    const coveredStatistics = coverage.found ? `(${coverage.hit}/${coverage.found})` : '';
    return color(_.padEnd(`${lineNumber} ${coveredStatistics}`, 9) + line) + '\n';
}

function displayCoverage(coverageResult, type, usePadding, options) {
    return displayPercentage(coverageResult, type, usePadding, options) + ' ' + displayNumbers(coverageResult, type, usePadding);
}

function displayPercentage(coverageResult, type, usePadding, options) {
    const coverageItem = coverageResult[type];
    const percentage = coverageCalculator.calculatePercentage(coverageItem);
    const percentageString = usePadding ? _.padStart(`${percentage}%`, 4) : `${percentage}%`;
    const color = getColor(!isError(coverageResult, type, options));
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

function getColor(isSuccess) {
    if (isSuccess === null) {
        return _.identity;
    } else if (isSuccess) {
        return chalk.green;
    } else {
        return chalk.red;
    }
}
