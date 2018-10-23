const path = require('path');
const diffParser = require('diffparser');

module.exports = {
    parse
};

function parse(diff, baseDir){
    const result = diffParser(diff);
    result.forEach(item => {
        item.to = path.resolve(baseDir, item.to);
        item.from = path.resolve(baseDir, item.from);
    });
    return result;
}
