/* global require console process describe it */

var should = require('should')
var viewer = require('../.')
var fs = require('fs')

var _ = require('lodash')
var superagent = require('superagent')

var path    = require('path')
var rootdir = path.normalize(__dirname)
var config_file = rootdir+'/../test.config.json'
var viewfile = rootdir+'/files/view.json'

var config_okay = require('config_okay')
var config={}

var test_db

function create_tempdb(done){
    // create a test db, the put data into it
    var date = new Date()
    test_db = [config.couchdb.db,
                          date.getHours(),
                          date.getMinutes(),
                          date.getSeconds(),
                          date.getMilliseconds()].join('-')
    config.couchdb.db = test_db
    var cdb =
        [config.couchdb.host+':'+config.couchdb.port
        ,config.couchdb.db].join('/')
    superagent.put(cdb)
    .type('json')
    .auth(config.couchdb.auth.username
         ,config.couchdb.auth.password)
    .end(function(e,r){
        if(r.error){
            // do not delete if we didn't create
            config.delete_db=false
        }else{
            config.delete_db=true
        }
        var docs = {'docs':[{'_id':'doc1'
                    ,foo:'bar'}
                   ,{'_id':'doc2'
                    ,'baz':'bat'}
                   ]}
        _.each([1,2,3,4,5,6,7,8,9],function(v){
            docs.docs.push({'superb':'timing',
                            'result':v
                           })
            return null
        })
        superagent.post(cdb+'/_bulk_docs')
        .type('json')
        .set('accept','application/json')
        .send(docs)
        .end(function(e,r){
            if(e) done(e)
            _.each(r.body
                  ,function(resp){
                       resp.should.have.property('ok')
                       resp.should.have.property('id')
                       resp.should.have.property('rev')
                   });
            return done()
        })
        return null
    })
}


before(function(done){
    config_okay(config_file,function(err,c){
        if(err){
            console.log('Problem trying to parse options in ',config_file)
            throw new Error(err)
        }
        if(c.couchdb.db === undefined){
            c.couchdb.db = 'testdb'
        }
        config = c
        create_tempdb(done)
        return null
    })
})

after(function(done){
    var cdb =
        [config.couchdb.host+':'+config.couchdb.port
        ,config.couchdb.db].join('/')
    superagent.del(cdb)
        .type('json')
        .auth(config.couchdb.auth.username,
              config.couchdb.auth.password
             )
        .end(function(e,r){
            if(e) return done(e)
            return done()
        })
    return null
})


describe('test put a view',function(){
    var design_doc
    before(function(done){
        fs.readFile(viewfile, function (err, data) {
            if (err) throw err;
            design_doc = JSON.parse(data)
            return done()

        })
    })

    it('should create the view, and use it'
       ,function(done){
           var opts = config.couchdb
           opts.doc = design_doc
           viewer(opts
                 ,function(err,docs){
                     should.not.exist(err)
                     should.exist(docs)
                     docs.should.not.have.property('error')
                     docs.should.have.property('ok',true)
                     docs.should.have.property('id','_design/test')
                     docs.should.have.property('rev')

                     var cdb =
                             [config.couchdb.host+':'+config.couchdb.port
                              ,config.couchdb.db
                              ,'_design/test/_view/superb_result'].join('/')
                     superagent.get(cdb)
                         .type('json')
                         .end(function(e,r){
                             if(e) return done(e)
                             var b = JSON.parse(r.text)
                             should.exist(b)
                             b.should.have.property('rows')
                             b.rows.should.have.length(1)
                             b.rows[0].should.have.property('key')
                             b.rows[0].should.have.property('value',9)
                             return done()
                         })

                  })
       })
})
