const _ = require('lodash');
const Promise = require('bluebird');
const fastGlob = require('fast-glob');

const parsers = {
    'lcov': Promise.promisify(require('lcov-parse')),
    'cobertura': Promise.promisify(require('cobertura-parse').parseFile),
    'clover': require('@cvrg-report/clover-json').parseFile,
    'jacoco': Promise.promisify(require('jacoco-parse').parseFile),
    'golang-cover': require('@cvrg-report/golang-cover-json').parseFile
};

const types = _.keys(parsers);

module.exports = {
    parseGlobs,
    parseFiles,
    parseFile,
    types
};


function parseGlobs(globs, typesOrParsers, filter) {
    return Promise
        .map(globs, (glob, index) => findFilesAndParsers(glob, typesOrParsers, index))
        .map(({files, parser}) => parseFiles(files, parser, filter))
        .then(globsResults => _.flatten(globsResults));
}

function findFilesAndParsers(glob, typesOrParsers, index) {
    return findFiles(glob)
        .then(files => ({
            files,
            parser: getParserByIndex(typesOrParsers, index)
        }));
}

function findFiles(glob) {
    return fastGlob(glob, {absolute: true})
}

function parseFiles(files, typeOrParser, filter) {
    return Promise
        .map(files, file => parseFile(file, typeOrParser, filter))
        .then(filesResults => _.flatten(filesResults))
}

function parseFile(file, typeOrParser, filter) {
    const parser = getParser(typeOrParser);
    return parser(file)
        .then(results => filter ? _.filter(results, filter) : results)
}

function getParserByIndex(typesOrParsers, index){
    const typeOrParser = typesOrParsers[index] || _.last(typesOrParsers);
    return getParser(typeOrParser);
}

function getParser(typeOrParser){
    const parser = _.isFunction(typeOrParser) ? typeOrParser : parsers[typeOrParser];
    if (!parser) {
        throw new Error(`Unknown coverage type: ${typeOrParser}. Supported types are: ${types}`);
    }
    return parser;
}
