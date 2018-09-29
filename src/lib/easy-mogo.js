const EasyQueue=require('easy-queue')
const MongoClient = require('mongodb').MongoClient;
const ObjectID=require('mongodb').ObjectID;
const config = require('../config/config')
const url=`mongodb://${config.db.host}:${config.db.port}`;

const easyQ=new EasyQueue({
  doing:(db,finished)=>{
    MongoClient.connect(url,(err,client)=>{
      if(err){
        return finished(err)
      }

      finished(null,[client,db?client.db(db):null])
    })
  },
  maxCount:10
})

const getConnect=db=>easyQ.add(db)

const mg={
  getConnect,
  execute:async function(cb){
    let rs=await getConnect(config.db.database);
    await cb(rs);
    rs[0].close();
  },
  checkDb:async db1=>{
    if(!db1){
      return (await getConnect(config.db.database))[1]
    }
    return db1;
  },
  createMethod:({coll,data,sets,method})=>{
    return new Promise((s,f)=>{
      if(sets){
        coll[method](data,{$set:sets},(err,rs)=>{
          err?f(err):s(rs)
        })
      }
      else coll[method](data,(err,rs)=>{
        err?f(err):s(rs)
      })
    })
  },
  page:async (col,data,db1,limit=10,skip=0)=>{
    let db=await mg.checkDb(db1)
    return new Promise((s,f)=>{
      db.collection(col).find(data).skip(skip).limit(limit).toArray((er,rs)=>{
        if(er)f(er);
        else s(rs);
      })
    })
  },
  find:async (col,data,db1)=>{
    if(data._id){
      data._id=ObjectID(data._id)
    }
    let db=await mg.checkDb(db1)
    let coll=db.collection(col);
    return new Promise((s,f)=>{
      coll.find(data).toArray((err,rs)=>{
        if(err)f(err)
        else s(rs)
      })
    })
    
  },
  insert:async function(col,data,db1){
    let db=await mg.checkDb(db1)
    let coll=db.collection(col);
    let method="insert"
    return mg.createMethod({coll,data,method})
  },
  update:async function(col,data,sets,db1){
    if(data._id){
      data._id=ObjectID(data._id)
    }
    let db=await mg.checkDb(db1)
    let coll=db.collection(col);
    let method="update"
    // if(data instanceof Array){
    //   method="updateMany"
    // }
    return mg.createMethod({coll,data,sets,method})
  },
  del:async function(col,data,db1){
    if(data._id){
      data._id=ObjectID(data._id)
    }
    let db=await mg.checkDb(db1)
    let coll=db.collection(col);
    let method="deleteOne"
    if(data instanceof Array){
      method="deleteMany"
    }
    return mg.createMethod({coll,data,method})
  }
}

module.exports=mg;