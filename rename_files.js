#! /usr/bin/env node

const chalk = require('chalk');
const fs = require('fs');
const path = require('path');
const yargs = require('yargs');

const getAllFiles = (dirPath, arrayOfFiles, recursive = false) => {
  const files = fs.readdirSync(dirPath);
  arrayOfFiles = arrayOfFiles || [];

  files.forEach((file) => {
    // console.log(file);
    if (fs.statSync(dirPath + '/' + file).isDirectory()) {
      if (recursive) {
        arrayOfFiles = getAllFiles(dirPath + '/' + file, arrayOfFiles);
      }
    } else {
      arrayOfFiles.push(path.resolve(path.join(path.resolve(dirPath), '/', file)));
    }
  });

  return arrayOfFiles;
};

const renameFiles = (from, to, directory = process.cwd(), extension = '', recursive = false) => {
  const pattern = new RegExp(`(.*?)(${from})(.*?${extension}$)`);
  const allFiles = getAllFiles(directory, [], recursive);
  const matchedFiles = [];
  allFiles.forEach((filePath) => {
    const dirName = filePath.split('/').slice(0, -1).join('/');
    // console.log(dirName);
    const oldFileName = filePath.split('/').slice(-1)[0];
    // console.log(oldFileName);
    if (pattern.exec(oldFileName)) {
      const newFileName = oldFileName.replace(pattern, `$1${to}$3`);
      // console.log(newFileName);
      matchedFiles.push({
        from: filePath,
        to: `${dirName}/${newFileName}`
      })
    }
  });
  // console.log(matchedFiles);
  matchedFiles.forEach((match) => {
    console.log(chalk.blue(`Renaming ${match.from} to ${match.to}`));
    fs.rename(match.from, match.to, (err) => {
      if (err) {
        console.log(chalk.red(err));
      } else {
        console.log(chalk.green(`Successfully ${match.from} to ${match.to}`))
      }
    });
  });
}

const options = yargs
  .usage('Usage: -f <from_pattern> -t <to_pattern> -d <dir_to_search>')
  .option('f', { alias: 'from_pattern', describe: 'Pattern to search', type: 'string', demandOption: true })
  .option('t', { alias: 'to_pattern', describe: 'Pattern to replace with', type: 'string', demandOption: true })
  .option('d', { alias: 'dir_to_search', describe: 'Directory to search files', default: process.cwd(), type: 'string', demandOption: false })
  .option('e', { alias: 'extension', describe: 'File extensions to update', default: '', type: 'string', demandOption: false })
  .option('r', { alias: 'recursive', describe: 'Search directory recursively?', default: false, type: 'boolean', demandOption: false })
  .argv;

const from = options.from_pattern;
const to = options.to_pattern;
const directory = options.dir_to_search;
const extension = options.extension;
const recursive = options.recursive;

renameFiles(from, to, directory, extension, recursive);
