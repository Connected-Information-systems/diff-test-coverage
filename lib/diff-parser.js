const path = require('path');
const _ = require('lodash');
const diffParser = require('diffparser');

module.exports = {
    parse
};

function parse(diff, baseDir) {
    const result = diffParser(diff);
    result.forEach(item => {
        if(item.to){
            item.to = path.resolve(baseDir, item.to);
        }
        if(item.from){
            item.from = path.resolve(baseDir, item.from);
        }
        item.linesByNumber = getLinesByNumber(item.chunks)
    });
    return result;
}

function getLinesByNumber(chunks){
    return _.chain(chunks)
        .map(chunk => chunk.changes)
        .flatten()
        .map(change => [change.newLine, change.content.substring(1)])
        .fromPairs()
        .value()
}
