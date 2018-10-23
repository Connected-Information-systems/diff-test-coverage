# diff-test-coverage (WIP)
A Node.js commandline tool which filters test coverage based on a (source control) diff.

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
```
Usage: <diff command> | diff-test-coverage -c <coverage report glob> -t <coverage report type> --

Options:
  --help                    Show help  [boolean]
  --version                 Show version number  [boolean]
  -c, --coverage            Glob pattern(s) that specify which coverage report files to use.  [array] [required]
  -t, --type                The type of coverage report. When provided multiple times the types will be mapped to the matching coverage glob patterns.  [array] [required] [choices: "lcov", "cobertura", "clover", "jacoco", "golang-cover"]
  -l, --line-coverage       Required line coverage percentage on the diff. The application will exit with -1 if this is not reached.  [number] [default: 80]
  -b, --branch-coverage     Required branch coverage percentage on the diff. The application will exit with -1 if this is not reached.  [number] [default: 80]
  --coverage-base-dir       The base directory for resolving relative paths in coverage reports. Uses current working directory by default.  [string] [default: "/home/markl/projects/my-federation"]
  --diff-base-dir           The base directory for resolving relative paths in the diff. Uses current working directory by default.  [string] [default: "/home/markl/projects/my-federation"]
  --diff-coverage-base-dir  The base directory for displaying the diff coverage results. Uses current working directory by default.  [string] [default: "/home/markl/projects/my-federation"]

Examples:
  hg diff -r 'p1(min(branch(MY-BRANCH))):MY-BRANCH' | diff-test-coverage -c **/lcov.info -t lcov --
```
