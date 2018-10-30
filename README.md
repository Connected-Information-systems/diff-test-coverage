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

## Example output
![Screenshot](https://raw.githubusercontent.com/Connected-Information-systems/diff-test-coverage/master/screenshots/screenshot.png "Example output")

## Usage and options
Execute `diff-test-coverage` to see the documentation.
```
Usage:
1. Execute your tests to generate your test coverage reports.
2. Figure out what Git or Mercurial command to use to generate your diff (see Examples below).
3. Execute: <diff command> | diff-test-coverage -c <coverage report glob> -t <coverage report type> --

Options:
  --help                   Show help  [boolean]
  --version                Show version number  [boolean]
  -c, --coverage           Glob pattern(s) that specify which coverage report files to use.  [array] [required]
  -t, --type               The type of coverage report. When provided multiple times the types will be mapped to the matching coverage glob patterns.  [array] [required] [choices: "lcov", "cobertura", "clover", "jacoco", "golang-cover"]
  -l, --line-coverage      Required line coverage percentage on the diff. The application will exit with -1 if this is not reached.  [number] [default: 80]
  -b, --branch-coverage    Required branch coverage percentage on the diff. The application will exit with -1 if this is not reached.  [number] [default: 80]
  -f, --function-coverage  Required function coverage percentage on the diff. The application will exit with -1 if this is not reached.  [number] [default: 80]
  --diff-base-dir          The base directory for resolving relative paths in the diff. Uses current working directory by default.  [string] [default: `process.cwd()`]
  --diff-filter            Glob pattern(s) that specify which files from the diff should be included.  [array]
  --log-base-dir           The base directory for resolving relative paths in the console logger. Uses current working directory by default.  [string] [default: `process.cwd()`]
  --log-template           The information which should be logged to the console.  [array] [choices: "diff-files", "coverage-files-line", "coverage-files-complete", "totals-line", "totals-complete", "errors"] [default: ["coverage-files-complete","totals-complete","errors"]]
  --color                  Whether colors should be used in the log. Default: autodetect by 'chalk'.  [boolean]

Examples:
  git diff master...MY-BRANCH | diff-test-coverage -c **/coverage.xml -t cobertura --                                                                     Runs 'diff-test-coverage' with a git diff and Cobertura coverage reports.
  hg export -r "branch(.) and not merge()" | diff-test-coverage -c **/target/site/jacoco/jacoco.xml -t jacoco --                                          Runs 'diff-test-coverage' with a mercurial diff and Jacoco coverage reports.
  <diff command> | diff-test-coverage --log-template diff-files coverage-files-line totals-line errors <other args> --                                    Runs 'diff-test-coverage' with custom logging.
  <diff command> | diff-test-coverage --diff-filter *.java *.kt --log-template diff-files coverage-files-complete totals-complete errors <other args> --  Runs 'diff-test-coverage' with the diff filtered on Java and Kotlin files.
  <diff command> | diff-test-coverage --no-color <other args> --                                                                                          Runs 'diff-test-coverage' without color in the log.
  git diff master...MY-BRANCH                                                                                                                             Creates a diff of the Git branch 'MY-BRANCH' which originated from the master branch.
  hg export -r "branch(.) and not merge()"                                                                                                                Creates a diff of the current Mercurial branch, excluding any merge commits.
  hg export -r "branch(MY-BRANCH) and not merge()"                                                                                                        Creates a diff of the Mercurial branch MY-BRANCH, excluding any merge commits.
```

[npm-url]: https://www.npmjs.org/package/@connectis/diff-test-coverage
[npm-image]: https://badge.fury.io/js/%40connectis%2Fdiff-test-coverage.svg

[depstat-url]: https://david-dm.org/Connected-Information-systems/diff-test-coverage
[depstat-image]: https://david-dm.org/Connected-Information-systems/diff-test-coverage.svg
