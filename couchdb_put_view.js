var superagent = require('superagent')
var server = process.env.COUCHDB_HOST || 'localhost'
var port = process.env.COUCHDB_PORT || 5984
var user = process.env.COUCHDB_USER ;
var pass = process.env.COUCHDB_PASS ;
var couchdb = 'http://'+server+':'+port

/**
 * I'm not going to protect you from being an idiot.
 */
function couchdb_put_view(opts,cb){
    var cdb_uri = couchdb

    if(opts.url){
        cdb_uri = opts.url+':'+opts.port
    }
    var cdb_u = opts.user || user
    var cdb_p = opts.pass || pass

    var db = opts.db
    var doc = opts.doc
    if(doc === undefined ) throw new Error('need a doc to save in opts.doc')
    var design = doc._id
    if(design === undefined ) throw new Error('need a name for the design doc')

    // fixup views functions
    // copied from couchapp.js
    function prepare(x) {
        for (var i in x) {
            if (i[0] != '_') {
                if (typeof x[i] == 'function') {
                    x[i] = x[i].toString()
                    x[i] = 'function '+x[i].slice(x[i].indexOf('('))
                }
                if (typeof x[i] == 'object') {
                    prepare(x[i])
                }
            }
        }
    }
    prepare(doc)

    var uri = [couchdb,db,design].join('/')
    var req = superagent
              .put(uri)
              .type('json')
              .set('accept','application/json')
              .set('followRedirect',true)
    if(cdb_u){
        req.auth(cdb_u,cdb_p)
    }
    req.send(doc)
    .end(function(err,res){
        if(err) throw new Error(err)
        if(res.error){console.log(res.body)}
        return cb(null, res.body)
    })
}
module.exports=couchdb_put_view
