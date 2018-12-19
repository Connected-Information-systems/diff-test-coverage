const _ = require('lodash');
const micromatch = require('micromatch');

module.exports = {
    filterAndMerge
};

function filterAndMerge(fileDiffs, options) {
    return _.chain(fileDiffs)
        .filter(fileDiff => fileDiff.to && fileDiff.to !== '/dev/null')
        .filter(fileDiff => !options.diff.filterGlobs || micromatch.some(fileDiff.to, options.diff.filterGlobs, {matchBase: true}))
        .groupBy(fileDiff => fileDiff.to)
        .mapValues(mergeChanges)
        .pickBy(fileAdditions => fileAdditions.additions.length)
        .value();
}

function mergeChanges(fileDiffs) {
    const fileDiff = _.last(fileDiffs);

    const changes = _.chain(fileDiffs)
        .flatMap('chunks')
        .flatMap('changes')
        .reduce(reduceChanges, {})
        .value();

    const lines = _.chain(changes)
        .map(change => [change.newLine, change.content.substr(1)])
        .fromPairs()
        .value();

    const additions = _.chain(changes)
        .filter(change => change.type === 'add')
        .map(change => change.newLine)
        .value();

    return {
        from: fileDiff.from,
        to: fileDiff.to,
        lines,
        additions
    };
}

function reduceChanges(result, change, key, allChanges){
    if(change.type === 'del'){
        return removeLineChange(result, change, allChanges)
    } else {
        return setLineChange(result, change);
    }
}

function setLineChange(result, change){
    result[change.newLine] = change;
    return result;
}

function removeLineChange(result, change, allChanges){
    const index = _.indexOf(allChanges, change);
    const chunkChanges = _.slice(allChanges, index - change.position + 1, index + 1);
    const shouldRemove = !_.some(chunkChanges, chunkChange => chunkChange.newLine === change.oldLine);
    if(shouldRemove){
        delete result[change.oldLine];
        return _.mapKeys(result, (line, lineNumber) => {
            lineNumber = parseInt(lineNumber);
            return lineNumber < change.oldLine ? lineNumber : lineNumber - 1;
        });
    } else{
        return result;
    }
}