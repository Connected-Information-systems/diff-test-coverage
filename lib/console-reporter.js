const _ = require('lodash');
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const stripAnsi = require('strip-ansi');
const coverageCalculator = require('./coverage-calculator');


const templates = [
    'diff-files',
    'coverage-files-line',
    'coverage-files-complete',
    'coverage-lines-line',
    'coverage-lines-branches',
    'coverage-lines-complete',
    'totals-line',
    'totals-complete',
    'errors',
    'full'
];
const templateSets = {
    'full': ['diff-files', 'coverage-lines-complete', 'coverage-files-complete', 'totals-complete', 'errors']
};
const templateDir = path.resolve(__dirname, '../log-templates');

module.exports = {
    report,
    templates
};

function report({coverageByFile, additionsByFile, totals, options}) {
    const templateNames = getTemplatesNames(options);
    const logMessage = templateNames
        .map(templateName => getLogMessage({templateName, coverageByFile, additionsByFile, totals, options}))
        .join('\n');
    console.log(_.trim(logMessage));
}

function getTemplatesNames(options) {
    return _.chain(options.consoleReport.templates)
        .map(templateName => templateSets[templateName] || templateName)
        .flatten()
        .value();
}

function getLogMessage({templateName, coverageByFile, additionsByFile, totals, options}) {
    const templateFile = path.join(templateDir, templateName + '.template');
    const templateString = fs.readFileSync(templateFile, 'utf8');
    const template = _.template(templateString);
    let previousLineNumber;
    return template({
        coverageByFile,
        additionsByFile,
        totals,
        options,
        chalk,
        getRelativePath: (file) => path.relative(options.consoleReport.baseDir, file),
        isError: (coverageResult, type) => isError(coverageResult, type, options),
        displayLineCoverageLine: (file, lineNumber, line) => {
            const linesCoverageDetails = _.get(coverageByFile, [file, 'lines', 'details']);
            const message = displayLineCoverageLine(lineNumber, previousLineNumber, line, linesCoverageDetails);
            return separateNonSubsequentLines(lineNumber, message);

        },
        displayBranchCoverageLine: (file, lineNumber, line) => {
            const branchesCoverageDetails = _.get(coverageByFile, [file, 'branches', 'details']);
            const message = displayBranchCoverageLine(lineNumber, line, branchesCoverageDetails);
            return separateNonSubsequentLines(lineNumber, message);
        },
        displayCompleteCoverageLine: (file, lineNumber, line) => {
            const fileCoverage = coverageByFile[file];
            const message = displayCompleteCoverageLine(lineNumber, line, fileCoverage);
            return separateNonSubsequentLines(lineNumber, message);
        },
        displayCoverage: (coverageResult, type, usePadding) => displayCoverage(coverageResult, type, usePadding, options)
    });

    function separateNonSubsequentLines(lineNumber, message){
        lineNumber = _.parseInt(lineNumber);
        const _previousLineNumber = previousLineNumber;
        previousLineNumber = lineNumber;
        if(!_previousLineNumber){
            return message;
        }
        return _previousLineNumber === (lineNumber -1) ? message : '\n' + message;
    }
}

function displayLineCoverageLine(lineNumber, line, linesCoverageDetails) {
    const isCovered = isLineCovered(linesCoverageDetails, lineNumber);
    return colorMessage(_.padEnd(lineNumber, 4) + line + '\n', isCovered);
}

function displayBranchCoverageLine(lineNumber, line, branchesCoverageDetails) {
    const coverage = getLineBranchesCoverage(branchesCoverageDetails, lineNumber);
    const isCovered = areLineBranchesCovered(coverage);
    const coveredStatistics = coverage.found ? `(${coverage.hit}/${coverage.found})` : '';
    return colorMessage(_.padEnd(`${lineNumber} ${coveredStatistics}`, 9) + line + '\n', isCovered);
}

function displayCompleteCoverageLine(lineNumber, line, fileCoverage) {
    const isLineFunctionCovered = isLineCovered(fileCoverage.functions.details, lineNumber);
    const isLineLineCovered = isLineCovered(fileCoverage.lines.details, lineNumber);
    const branchesCoverage = getLineBranchesCoverage(fileCoverage.branches.details, lineNumber);
    const areBranchesCovered = areLineBranchesCovered(branchesCoverage);

    const markings = [
        isLineFunctionCovered !== null ? colorMessage('F', isLineFunctionCovered) : null,
        isLineLineCovered !== null ? colorMessage('L', isLineLineCovered) : null,
        areBranchesCovered !== null ? colorMessage(`B(${branchesCoverage.hit}/${branchesCoverage.found})`, areBranchesCovered) : null,
    ];

    return _.chain(markings)
        .compact()
        .join(' | ')
        .thru(message => padEnd(lineNumber, 4) +  padEnd(message, 14) + line + '\n')
        .value()
}

function isLineCovered(coverageDetails, lineNumber){
    const lineCoverage =  _.find(coverageDetails, detail => detail.line.toString() === lineNumber.toString());
    return lineCoverage ? lineCoverage.hit > 0 : null;
}

function getLineBranchesCoverage(branchesCoverageDetails, lineNumber){
    const branchCoverageList = _.filter(branchesCoverageDetails, detail => detail.line.toString() === lineNumber.toString());
    return {
        found: branchCoverageList.length,
        hit: _.sumBy(branchCoverageList, branchCoverage => branchCoverage.taken ? 1: 0)
    };
}

function areLineBranchesCovered(branchesLineCoverage){
    return branchesLineCoverage.found === 0 ? null : branchesLineCoverage.found === branchesLineCoverage.hit;
}

function displayCoverage(coverageResult, type, usePadding, options) {
    return displayPercentage(coverageResult, type, usePadding, options) + ' ' + displayNumbers(coverageResult, type, usePadding);
}

function displayPercentage(coverageResult, type, usePadding, options) {
    const coverageItem = coverageResult[type];
    const percentage = coverageCalculator.calculatePercentage(coverageItem);
    const percentageString = usePadding ? _.padStart(`${percentage}%`, 4) : `${percentage}%`;
    const isSuccess = !isError(coverageResult, type, options);
    return colorMessage(percentageString, isSuccess);
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

function padEnd(message, length){
    const stripped = stripAnsi(message);
    const colorLength = message.length - stripped.length;
    return _.padEnd(message, length + colorLength);
}

function colorMessage(message, isSuccess){
    const color = getColor(isSuccess);
    return color(message);
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