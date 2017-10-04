const putview = require('./couchdb_put_view.js')
const fs = require('fs')
const config_okay = require('config_okay')
var argv = require('minimist')(process.argv.slice(2));

function promise_wrapper(fn,arg){
    return new Promise((resolve, reject)=>{
        fn(arg,function(e,r){
            if(e){
                console.log(e)
                return reject(e)
            }else{
                return resolve(r)
            }
        })
    })
}

const path    = require('path')
const rootdir = path.normalize(process.cwd())

let viewfile = rootdir+'/'+argv.v
let config_file = rootdir+'/'+argv.c

if(argv.c === undefined){
    console.log('Defaulting to config.json for the CouchDB config file.  Change by using the -c option')
    config_file = rootdir+'/config.json'
}
if(argv.v === undefined){
    console.log('Defaulting to view.json for the CouchDB view to store.  Change by using the -v option')
    viewfile = rootdir+'/view.json'
}

var config = {}
config_okay(config_file)
    .then( c => {
        // console.log('configure test db')
        config.couchdb = c.couchdb
        return promise_wrapper(fs.readFile,viewfile)
    })
    .then( data => {

        config.couchdb.doc = JSON.parse(data)
        // now put that into couchdb

        return putview(config.couchdb)
    })
    .then(r => {
        console.log('view written', r)
    })
    .catch( err => {
        console.log('error putting view in couchdb',err)
    })
