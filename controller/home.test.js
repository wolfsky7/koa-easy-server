/**
* test
*  <>-----}|------------------------------->
* 
*/
const fetch=require('../../lib/easy-test')
const request=require('request')

let __userToken="";

describe('首页管理',()=>{

  beforeAll(()=>{
    return fetch.post('/user/login',{
      unm:'asdf5',
      pwd:'12312'
    }).then(rs=>{
      __userToken=rs.token;
      return Promise.resolve(true)
    })
  },5000)

  test.only('上传banner',()=>{
    let ims=[request.get("http://dummyimage.com/200x100/"+Math.floor(Math.random()*1000)),];
    let form={
      formData:{
        token:__userToken,
        image:ims,
        desc:'banner1',
        type:'banner',
      }
    }
    return fetch.post('/home',form).then(rs=>{
      expect(rs.status).toBe(500);
    })
  })

  test('上传water',()=>{
    return fetch.post('/user/register',{
      unm:'asdf',
      pwd:'12312'
    }).then(rs=>{
      expect(rs.status).toBe(500);
    })
  })

  test('修改banner',()=>{
    return fetch.post('/user/register',{
      unm:'asdf'+Math.floor(Math.random()*10000),
      pwd:'12312',
      _from:'test'
    }).then(rs=>{
      console.log(rs);
      expect(rs.status).toBe(0);
    })
  })

  test('修改water',()=>{
    return fetch.post('/user/register',{
      unm:'asdf'+Math.floor(Math.random()*10000),
      pwd:'12312',
      _from:'test'
    }).then(rs=>{
      console.log(rs);
      expect(rs.status).toBe(0);
    })
  })

  test('删除banner',()=>{
    return fetch.post('/user/register',{
      unm:'asdf'+Math.floor(Math.random()*10000),
      pwd:'12312',
      _from:'test'
    }).then(rs=>{
      console.log(rs);
      expect(rs.status).toBe(0);
    })
  })

  test('删除water',()=>{
    return fetch.post('/user/register',{
      unm:'asdf'+Math.floor(Math.random()*10000),
      pwd:'12312',
      _from:'test'
    }).then(rs=>{
      console.log(rs);
      expect(rs.status).toBe(0);
    })
  })

  test('获取banner',()=>{
    return fetch.post('/user/register',{
      unm:'asdf'+Math.floor(Math.random()*10000),
      pwd:'12312',
      _from:'test'
    }).then(rs=>{
      console.log(rs);
      expect(rs.status).toBe(0);
    })
  })

  test('获取water',()=>{
    return fetch.post('/user/register',{
      unm:'asdf'+Math.floor(Math.random()*10000),
      pwd:'12312',
      _from:'test'
    }).then(rs=>{
      console.log(rs);
      expect(rs.status).toBe(0);
    })
  })
})




module.exports=router;

