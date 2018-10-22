const _ = require('lodash');

module.exports = {
    calculate
};

function calculate(diffResults, coverageResults){
    const diffByFile = _.keyBy(diffResults, 'to');
    const coverageByFile = _.keyBy(coverageResults, 'file');

    console.log('Diff files:', _.keys(diffByFile));
    console.log('Coverage files:', _.keys(coverageByFile));
}
