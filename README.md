# lean-package

A tool for cleaning package.json before publishing.

## Usage

```
npx lean-package --help

Usage: lean-package [options...]
 -c, --copy <copy>   Additionally copy these comma delimited fields to the output package.json
 -d, --description <description>  Override "description" field in the output package.json
 -h, --help          Display this usage help
 -i, --input <file>  Path to input package.json
 -n, --name <name>   Override "name" field in the output package.json
 -o, --output <file>  Write to file instead of stdout
 -s, --silent        Do not output any extraneous messaging
 -v, --version       Show the version
```
