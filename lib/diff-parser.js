const path = require('path');
const diffParser = require('diffparser');

module.exports = {
    parse
};

function parse(diff, parentDir){
    const result = diffParser(diff);
    result.forEach(item => {
        item.to = path.resolve(parentDir, item.to);
        item.from = path.resolve(parentDir, item.from);
    });
    return result;
}
