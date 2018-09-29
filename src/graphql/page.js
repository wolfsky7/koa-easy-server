const {
  graphql,
  GraphQLString,
  GraphQLInt,
  GraphQLObjectType,
  GraphQLList,
  GraphQLSchema
}=require('graphql')

const page=new GraphQLObjectType({
  name:'Page',
  fields:{
    type:{type:GraphQLString},
    createTime:{type:GraphQLInt},
    desc:{type:GraphQLString},
    path:{type:GraphQLString},
  }
})

// 等于 是 先 接口 取出数据 然后 在这里 按前端要求格式化输出
var pages=data=>new GraphQLSchema({
  query:new GraphQLObjectType({
    name:'Pages',
    fields:{
      rows:{
        type:new GraphQLList(page),
        resolve:async (_,args)=>{
          return data;
        }
      }
    }
  })
  
})

module.exports=pages