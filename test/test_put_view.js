/* global require console process describe it */

const tap = require('tap')
const superagent = require('superagent')
const fs = require('fs')
const viewer = require('../.')

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

const utils = require('./utils.js')

const path    = require('path')
const rootdir = path.normalize(__dirname)
const config_okay = require('config_okay')
const config_file = rootdir+'/../test.config.json'
const config={}

const viewfile = rootdir+'/files/view.json'

const date = new Date()
const inprocess_string = date.toISOString()+' inprocess'

let cdb
const test_db ='test%2fput%2fview'

// function(e,r){
//             if(e) done(e)
//             r.body.forEach(
//                   function(resp){
//                        resp.should.have.property('ok')
//                        resp.should.have.property('id')
//                        resp.should.have.property('rev')
//                   })
//             return done()
//         })




function test_put_view( t ) {
    let  design_doc

    return promise_wrapper(fs.readFile, viewfile)
        .then( data => {
            design_doc = JSON.parse(data)
            return Promise.resolve(design_doc)
        })
        .then( design_doc => {
            var opts = config.couchdb
            opts.doc = design_doc
            return new Promise((resolve,reject)=>{
                viewer(opts
                   ,function(err,docs){
                       t.notOk(err,'should not get error')
                       t.ok(docs,'should get docs')
                       t.notOk(docs.error)
                       t.ok(docs.ok)
                       t.is(docs.id,'_design/test')
                       t.ok(docs.rev)
                       //console.log('done putting view, call resolve')
                       return resolve()
                   })
            })
        })
        .then( ()=>{

            var cdb =
                [config.couchdb.host+':'+config.couchdb.port
                 ,config.couchdb.db
                 ,'_design/test/_view/superb_result'].join('/')
            // console.log('getting',cdb)
            return superagent.get(cdb)
                .type('json')
        })
        .then( r => {
            t.ok(r.text)
            var b = JSON.parse(r.text)
            // console.log('got output of view:',b)
            t.ok(b)
            t.ok(b.rows)
            t.is(b.rows.length, 1)
            t.is(b.rows[0].key,null)
            t.ok(b.rows[0].value)
            t.is(b.rows[0].value,9)
            return Promise.resolve(r)
        })
}

function test_put_again( t ){
    let  design_doc

    return promise_wrapper(fs.readFile, viewfile)
        .then( data => {
            design_doc = JSON.parse(data)
            return Promise.resolve(design_doc)
        })
        .then( design_doc => {

            // now try again, what happens?
            console.log('trying a second put view.  Should fail')
            var opts = config.couchdb
            opts.doc = design_doc
            return  new Promise((resolve,reject)=>{
                viewer(opts
                       ,function(err,docs){
                           t.ok(err)
                           if(!err) return reject()
                           return resolve()
                       })
            })

        })
}

function test_put_again_no_callback( t ){
    let  design_doc

    return promise_wrapper(fs.readFile, viewfile)
        .then( data => {
            design_doc = JSON.parse(data)
            return Promise.resolve(design_doc)
        })
        .then( design_doc => {

            // now try again, what happens?
            console.log('trying a second put view.  Should fail')
            var opts = config.couchdb
            opts.doc = design_doc
            return  viewer(opts)
                .then( docs => {
                    t.fail('should not succeed')
                })
                .catch( e => {
                    t.pass('should fail to double put')
                })
        })
}

config_okay(config_file)
    .then(function(c){
        console.log('configure test db')
        config.couchdb = c.couchdb
        return utils.create_tempdb(config)
    })
    .then(()=>{
        console.log('populate test db')
        return utils.populate_db(config)
    })

    .then( r => {
        // console.log('call test')
        return tap.test('test getting a doc',test_put_view)
    })
    .then( () => {
        // console.log('double put view test')
        return tap.test('test duplicate put',test_put_again)
    })
    .then( () => {
        // console.log('double put view test, no callback')
        return tap.test('test duplicate put',test_put_again_no_callback)
    })
    .then(function(tt){
        // console.log('done, tearing down')
        utils.teardown(config,function(eeee,rrrr){
            return tap.end()
        })
        return null
    })
    .catch( function(e){
        console.log('caught error')
        throw e
    })
