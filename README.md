# Put design doc into  CouchDB

This is a module to simplify putting a desgin doc into  CouchDB.

Actually it doesn't help very much, but it save me some typing.

Anyway, pass in the opts object with the db and a javascript object
containing the design doc as so

```javascript
var putview = require('couchdb_put_view')

putview({db:db
        ,doc:design_doc}
       ,cb2)
```

An example of how to use this library is given in the included program
`put_view.js`.  This is  reproduced below with a few minor differences.

```javascript

var putview = require('couchdb_put_view')
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

// read the config file, then read the view, then put it
// in a chain of three stacked callbacks.

var config = {}
config_okay(config_file,function(e,c){
    if(e) throw new Error(e)
    config = c.couchdb
    //
    //  we have the configuration information for couchdb now
    //
    fs.readFile(viewfile, function (err, data) {
        if (err) throw err;
        //
        // no error, then we have data, which is currently textual JSON
        // so parse that now, add it to config
        //
        config.doc = JSON.parse(data)
        // now put that into couchdb
        //
        putview(config
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

```

Note that the above function used my `config_okay` library, which
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
doc, then one can set up an async loop, using a library like async or
queue-async.  For example, if you have a list of databases `dblist`,
then you can do something like:

```
function put_design_doc(db,cb){
    // make sure to create a local copy of
    // the global config object
    var local_config = config

    // put this database name into the config object
    local_config.db = db

    // call put view for this database
    putview(config
            ,function(err,r){
                if(err) throw new Error(err)
                // all done, return callback
                // to trigger next async function call
                return cb()
            })
    return null
}
async.eachLimit(dblist,5,put_design_doc,cb))
```

I haven't actually run that code, so it probably won't work, but it is
close enough to get started.
