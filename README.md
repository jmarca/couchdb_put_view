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
var viewfile = env.IMPUTED_COLLECT_VIEW_FILE || './views/collect2.json'
var collect_view = env.IMPUTED_COLLECT_VIEW || '_design/collect2/_view/idymdh_array'
var fs = require('fs')
var design_doc
function read_design_doc(cb){
    if(design_doc !== undefined){
        return cb(null)
    }
    fs.readFile(viewfile, function (err, data) {
        if (err) throw err;
        design_doc = JSON.parse(data)
        cb(null)
    });
    return null
}

function put_design_doc(db,cb){
    async.series([read_design_doc
                 ,function(cb2){
                      putview({db:db
                              ,doc:design_doc}
                             ,cb2)
                      return null
                  }]
                ,cb)
    return null
}

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



Pass
in your view and query parameters, and it will return the response.
If you are an idiot and do something stupid, this module will not
care, and will pass on your request to CouchDB more or less as is.  So
don't go asking for keys and key and startkey and endkey all at once.

If you don't pass in a view in the options object, then the default
"view" is '_all_docs'.
