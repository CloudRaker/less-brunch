'use strict';

const less = require('less');
const sysPath = require('path');
const progeny = require('progeny');

class LESSCompiler {
  constructor(config) {
    if (config == null) config = {};

    this.config = config && config.plugins && config.plugins.less || {};
    this.rootPath = config.paths.root;
  }

  getDependencies(sourceContents, file, callback) {
    progeny({rootPath: this.rootPath})(file, sourceContents, (err, deps) => {
      if (!err) {
        const re = /data-uri\s*\(\s*("|'|)([^)]*)\1\s*\)/g;
        let match;
        while (match = re.exec(sourceContents)) {
          deps.push(sysPath.join(sysPath.dirname(file), match[2]));
        }
      }
      callback(err, deps);
    });
  }

  compile(params) {
    const data = params.data;
    const path = params.path;
    const config = Object.assign({}, this.config, {
      paths: [this.rootPath, sysPath.dirname(path)],
      filename: path
    });

    return new Promise((resolve, reject) => {
      less.render(data, config, (error, output) => {
        //console.log(error, output);
        if (error) {
          let err;
          err = '' + error.type + 'Error:' + error.message;
          if (error.filename) {
            err += ' in "' + error.filename + ':' + error.line + ':' + error.column + '"';
          }
          return reject(err);
        }
        return resolve({data: output.css});
      });
    });
  }
}

LESSCompiler.prototype.brunchPlugin = true;
LESSCompiler.prototype.type = 'stylesheet';
LESSCompiler.prototype.extension = 'less';


module.exports = LESSCompiler;
