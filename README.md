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

If you have to read the design doc in from a file, then I do this:

```javascript

var putview = require('./couchdb_put_view')
var viewfile = process.env.MY_DESIGN_DOC || './views/collect2.json'
var fs = require('fs')
var design_doc
function read_design_doc(file,cb){
    if(design_doc !== undefined){
        // don't read the file in twice
        return cb(null)
    }
    fs.readFile(file, function (err, data) {
        if (err) throw err;
        design_doc = JSON.parse(data)
        cb(null,design_doc)
    });
    return null
}

function put_design_doc(db,cb){
    read_design_doc(viewfile
                    ,function(err,dd){
                        if(err) throw new Error(err)
                        putview({db:db
                                ,doc:dd}
                                ,function(err,r){
                                    if(err) throw new Error(err)
                                    // all done, return original callback
                                    cb(null,r)
                                    return null
                                })
                        return null
                    })
    return null
}

put_design_doc('mydatabase',function(e,r){
    if(e) throw new Error(e)
    console.log('done saving view, result is ',r)
    return null
})


```

The `async.series` makes sure that the design doc is read in first, and
then the put code is called.

Usually you only do this once, so it is no big deal if it is super
slow and inefficient.

If I have a list of thousands of dbs that all want the same design
doc, I set up the two functions above, but invoke them as so:

```
async.series([read_design_doc
              ,function(cb){
                   async.eachLimit(dblist,5,put_design_doc,cb))
                   return null
             }]
             ,function(err){
                   // okay or not
             })

```

I haven't actually run that code, so it probably won't work
