var putview = require('./couchdb_put_view.js')
var fs = require('fs')
var config_okay = require('config_okay')
var argv = require('minimist')(process.argv.slice(2));
console.dir(argv);

var path    = require('path')
var rootdir = path.normalize(process.cwd())
console.log(rootdir)

var viewfile = rootdir+'/'+argv.v
var config_file = rootdir+'/'+argv.c

if(argv.c === undefined){
    console.log('Defaulting to config.json for the CouchDB config file.  Change by using the -c option')
    config_file = rootdir+'/config.json'
}
if(argv.v === undefined){
    console.log('Defaulting to view.json for the CouchDB view to store.  Change by using the -v option')
    viewfile = rootdir+'/view.json'
}

var config = {}
config_okay(config_file,function(e,c){
    if(e) throw new Error(e)
    config.couchdb = c.couchdb

    fs.readFile(viewfile, function (err, data) {
        if (err) throw err;
        config.couchdb.doc = JSON.parse(data)
        // now put that into couchdb

        putview(config.couchdb
                ,function(err,r){
                    if(err) throw new Error(err)
                    // all done, return original callback
                    console.log(r)
                    return null
                })
        return null
    })
    return null
})
