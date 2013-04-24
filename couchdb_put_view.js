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
    var db = opts.db
    var doc = opts.doc
    if(doc === undefined ) throw new Error('need a doc to save in opts.doc')
    var design = doc._id
    if(design === undefined ) throw new Error('need a name for the design doc')

    var uri = [couchdb,db,design].join('/')
    console.log(uri)
    var req = superagent
              .put(uri)
              .type('json')
              .set('accept','application/json')
              .set('followRedirect',true)
    if(user){
        req.auth(user,pass)
    }
    req.send(doc)
    .end(function(err,res){
        if(err) throw new Error(err)
        if(res.error){console.log(res.body)}
        return cb(null, res.body)
    })
}
module.exports=couchdb_put_view
