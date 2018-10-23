const _ = require('lodash');

module.exports = {
    calculateTotals,
    calculatePercentage
};


function calculateTotals(coverageByFile){
    const coverageArray = _.toArray(coverageByFile);
    return {
        lines: calculateTotal(coverageArray, 'lines'),
        branches: calculateTotal(coverageArray, 'branches'),
        functions: calculateTotal(coverageArray, 'functions')
    }
}

function calculateTotal(coverageArray, type){
    const totals = {
        found: _.sumBy(coverageArray, fileCoverage => fileCoverage[type].found),
        hit:  _.sumBy(coverageArray, fileCoverage => fileCoverage[type].hit),
    };
    totals.percentage = calculatePercentage(totals);
    return totals;
}

function calculatePercentage(coverageItem){
    return coverageItem.found ? _.round((coverageItem.found / coverageItem.hit) * 100, 2): 100;
}
