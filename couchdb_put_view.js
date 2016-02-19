var superagent = require('superagent')
var _chost = process.env.COUCHDB_HOST || '127.0.0.1'
var _cport = process.env.COUCHDB_PORT || 5984
var _cuser = process.env.COUCHDB_USER ;
var _cpass = process.env.COUCHDB_PASS ;


/**
 * I'm not going to protect you from being an idiot.
 * initialize with the couchdb to save to
 *
 * expects that the url, port, username, password are in environment
 * variables.  If not, there are no defaults for user, pass.  Host
 * defaults to localhost, and port to the couchdb standard 5984
 *
 * var cuser = env.COUCHDB_USER ;
 * var cpass = env.COUCHDB_PASS ;
 * var chost = env.COUCHDB_HOST || '127.0.0.1';
 * var cport = env.COUCHDB_PORT || 5984;
 */
function couchdb_put_view(opts,cb){
    if(!opts) opts = {}
    var cuser =  opts.user || _cuser
    var cpass =  opts.pass || _cpass
    var chost =  opts.host || _chost
    var cport =  opts.port || _cport
    var couch = 'http://'+chost+':'+cport

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

    var uri = [couch,db,design].join('/')
    var req = superagent
              .put(uri)
              .type('json')
              .set('accept','application/json')
              .set('followRedirect',true)
    if(cuser && cpass){
        req.auth(cuser,cpass)
    }
    req.send(doc)
    .end(function(err,res){
        if(err) throw new Error(err)
        if(res.error){console.log(res.body)}
        return cb(null, res.body)
    })
}
module.exports=couchdb_put_view
