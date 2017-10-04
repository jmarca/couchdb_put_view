# Put design doc into  CouchDB

[![Greenkeeper badge](https://badges.greenkeeper.io/jmarca/couchdb_put_view.svg)](https://greenkeeper.io/)
[![Code
Climate](https://codeclimate.com/github/jmarca/couchdb_put_view/badges/gpa.svg)](https://codeclimate.com/github/jmarca/couchdb_put_view)
[![Test
Coverage](https://codeclimate.com/github/jmarca/couchdb_put_view/badges/coverage.svg)](https://codeclimate.com/github/jmarca/couchdb_put_view/coverage)
[![Build
Status](https://travis-ci.org/jmarca/couchdb_put_view.svg?branch=master)](https://travis-ci.org/jmarca/couchdb_put_view)

This is a module to simplify putting a desgin doc into  CouchDB.

Actually it doesn't help very much, but it saves me some typing.

Anyway, pass in the opts object with the db and a javascript object
containing the design doc as so

```javascript
var putview = require('couchdb_put_view')

putview({db:db
        ,doc:design_doc}
       ,cb2)
```

An example of how to use this library is given in the included program
`put_view.js`.  This is  reproduced below.

```javascript
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
```

Note that the above script uses my `config_okay` library, which
expects configuration data in a json file that looks like:

```
{
    "couchdb": {
        "host": "127.0.0.1",
        "port":5984,
        "auth":{"username":"james",
                "password":"oh my god no semicolons"
               },
        "db":"a_teststatedb"
    }
}
```

This file should be saved as config.json or something similar and set
to read/write only by the owner (something like `chmod 0600
config.json`)


If you have a list of thousands of dbs that all want the same design
doc, then you can use this library to set up a loop using
Promise.all().  Something like:

```
const mydbs = [ ... ]

// setup config to include the view, etc

config = { "doc" : ...parsed function  thing ...
          ,"host":"127.0.0.1" // or whatever
          ,"port":5984 // or whatever
          ,"auth":{"username":"champagne" // fixme
                   ,"password":"horse with a staplegun pulling espresso" // fixme
                   }
         }

const promises =
    mydbs.map( db => {

        // create a local copy of
        // the config object
        const local_config = Object.assign({},config)

        // put this database name into the config object
        local_config.db = db

        // call put view for this database
        return putview(config)
    })
}
return Promise.all(promises)

```

I haven't actually run that code, so it probably won't work, but it is
close enough to get started.
