const superagent = require('superagent')

function create_tempdb(config){
    const date = new Date()
    const test_db_unique = [config.couchdb.db,
                          date.getHours(),
                          date.getMinutes(),
                          date.getSeconds(),
                          date.getMilliseconds()].join('-')
    config.couchdb.db = test_db_unique
    const cdb =
        [config.couchdb.host+':'+config.couchdb.port
        ,config.couchdb.db].join('/')
    //console.log(config)
    return superagent.put(cdb)
        .type('json')
        .auth(config.couchdb.auth.username
              ,config.couchdb.auth.password)

}

function populate_db(config){
    const docs = {'docs':[{'_id':'doc1'
                           ,foo:'bar'}
                          ,{'_id':'doc2'
                            ,'baz':'bat'}
                         ]}
    Array(1,2,3,4,5,6,7,8,9).forEach(function(v){
        docs.docs.push({'superb':'timing',
                        'result':v
                       })
        return null
    })
    const cdb =
        [config.couchdb.host+':'+config.couchdb.port
         ,config.couchdb.db
         ,'_bulk_docs'].join('/')

    return superagent.post(cdb)
        .type('json')
        .set('accept','application/json')
        .auth(config.couchdb.auth.username
              ,config.couchdb.auth.password)
        .send(docs)
}


function teardown(config){
    const cdb =
          config.couchdb.host+':'+config.couchdb.port
          + '/'+ config.couchdb.db
    return superagent.del(cdb)
        .type('json')
        .auth(config.couchdb.auth.username
              ,config.couchdb.auth.password)
}

exports.create_tempdb = create_tempdb
exports.populate_db = populate_db
exports.teardown = teardown
