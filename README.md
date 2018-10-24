# diff-test-coverage
> A Node.js commandline tool which filters test coverage based on a (source control) diff.

[![NPM version][npm-image]][npm-url][![Dependency Status][depstat-image]][depstat-url]

Supported coverage report formats:
- lcov
- cobertura
- clover
- jacoco
- golang-cover

Supported source control systems:
- Git
- Mercurial
- Anything else that produces unified diffs.

## Installation
1. Install [Node.js with NPM](https://nodejs.org/en/download/)
2. `npm i - g @connectis/diff-test-coverage`

## Usage and options
Execute `diff-test-coverage` to see the documentation.
```
Usage: <diff command> | diff-test-coverage -c <coverage report glob> -t <coverage report type> --

Options:
  --help                 Show help  [boolean]
  --version              Show version number  [boolean]
  -c, --coverage         Glob pattern(s) that specify which coverage report files to use.  [array] [required]
  -t, --type             The type of coverage report. When provided multiple times the types will be mapped to the matching coverage glob patterns.  [array] [required] [choices: "lcov", "cobertura", "clover", "jacoco", "golang-cover"]
  -l, --line-coverage    Required line coverage percentage on the diff. The application will exit with -1 if this is not reached.  [number] [default: 80]
  -b, --branch-coverage  Required branch coverage percentage on the diff. The application will exit with -1 if this is not reached.  [number] [default: 80]
  --coverage-base-dir    The base directory for resolving relative paths in coverage reports. Uses current working directory by default.  [string] [default: `process.cwd()`]
  --diff-base-dir        The base directory for resolving relative paths in the diff. Uses current working directory by default.  [string] [default: `process.cwd()`]

Examples:
  git diff master...MY-BRANCH | diff-test-coverage -c **/coverage.xml -t cobertura --  Runs 'diff-test-coverage' with a git diff and Cobertura coverage reports.
  git diff master...MY-BRANCH                                                          Creates a diff of the Git branch 'MY-BRANCH' which originated from the master branch.
  hg diff -r 'p1(min(branch(.))):.'                                                    Creates a diff of the current Mercurial branch.
  hg diff -r 'p1(min(branch(MY-BRANCH))):MY-BRANCH'                                    Creates a diff of the Mercurial branch MY-BRANCH.
```

[npm-url]: https://www.npmjs.org/package/@connectis/diff-test-coverage
[npm-image]: https://badge.fury.io/js/%40connectis%2Fdiff-test-coverage.svg

[depstat-url]: https://david-dm.org/Connected-Information-systems/diff-test-coverage
[depstat-image]: https://david-dm.org/Connected-Information-systems/diff-test-coverage.svg
