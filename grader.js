#!/usr/bin/env node
/*
Automatically grade files for the presence of specified HTML tags/attributes.
Uses commander.js and cheerio. Teaches command line application development
and basic DOM parsing.

References:

 + cheerio
   - https://github.com/MatthewMueller/cheerio
   - http://encosia.com/cheerio-faster-windows-friendly-alternative-jsdom/
   - http://maxogden.com/scraping-with-node.html

 + commander.js
   - https://github.com/visionmedia/commander.js
   - http://tjholowaychuk.com/post/9103188408/commander-js-nodejs-command-line-interfaces-made-easy

 + JSON
   - http://en.wikipedia.org/wiki/JSON
   - https://developer.mozilla.org/en-US/docs/JSON
   - https://developer.mozilla.org/en-US/docs/JSON#JSON_in_Firefox_2
*/

var fs = require('fs');
var util = require('util');
var program = require('commander');
var cheerio = require('cheerio');
var restler = require('restler');
//var URLFILE_DEFAULT = "http://pure-scrubland-5283.herokuapp.com/";
var HTMLFILE_DEFAULT = "index.html";
var CHECKSFILE_DEFAULT = "checks.json";

var assertFileExists = function(infile) {
    var instr = infile.toString();
    if(!fs.existsSync(instr)) {
        console.log("%s does not exist. Exiting.", instr);
        process.exit(1); // http://nodejs.org/api/process.html#process_process_exit_code
    }
    return instr;
};

var cheerioHtmlFile = function(htmlfile) {
    return cheerio.load(fs.readFileSync(htmlfile));
};


var loadChecks = function(checksfile) {
    return JSON.parse(fs.readFileSync(checksfile));
};

var htmlURL = function(out, checks) {
    var urldata = function(result, response) {
        if (result instanceof Error) {
            console.error('Error: ' + util.format(response.message));
        } else {
            $ = cheerio.load(result);
            for(var jj in checks) {
                var present = $(checks[jj]).length > 0;
                out[checks[jj]] = present;
            }
        }
        var outJson = JSON.stringify(out, null, 4);
        //console.log('output after using restler \n');
        //console.log(outJson);
        fs.writeFileSync('hwk3c.txt', outJson);
  };
  return urldata;
};

var checkHtmlFile = function(htmlfile, url, checksfile) {
    var out = {};
    var checks = loadChecks(checksfile).sort();
    if (url) {
       var urldata = htmlURL(out, checks);
       restler.get(url).on('complete', urldata);    
    } else {
       $ = cheerioHtmlFile(htmlfile);
       for(var ii in checks) {
           var present = $(checks[ii]).length > 0;
           out[checks[ii]] = present;
       }
      var outJson = JSON.stringify(out, null, 4);
      console.log(outJson);
    }
    
};

var clone = function(fn) {
    // Workaround for commander.js issue.
    // http://stackoverflow.com/a/6772648
    return fn.bind({});
};

if(require.main == module) {
    program
        .option('-c, --checks <check_file>', 'Path to checks.json', clone(assertFileExists), CHECKSFILE_DEFAULT)
        .option('-f, --file <html_file>', 'Path to index.html', clone(assertFileExists), HTMLFILE_DEFAULT)
        .option('-u, --url <url_file>' , 'Path to deployed html file')
        .parse(process.argv);
    var checkJson = checkHtmlFile(program.file, program.url, program.checks);
    //var outJson = JSON.stringify(checkJson, null, 4);
    //console.log(outJson);
} else {
    exports.checkHtmlFile = checkHtmlFile;
}
