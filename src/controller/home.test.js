/**
* test
*  <>-----}|------------------------------->
* 
*/
const {fetch,testLogin}=require('../lib/easy-test')
const request=require('request')

let __userToken="";

describe('首页管理',()=>{
  beforeAll(()=>{
    return testLogin().then(rs=>{
      // console.log(rs)
      __userToken=rs
      console.log('token>'+__userToken)
      return Promise.resolve(true)
    })
  },5000)

  const uppload=async (type="banner")=>{
    const ims=[request.get("http://dummyimage.com/200x100/"+Math.floor(Math.random()*1000))];
    const form={
      formData:{
        token:__userToken,
        images:ims,
        desc:'banner1',
        type:type
      }
    }
    return fetch.post('/home',form)
  }

  test('上传banner',()=>{
    console.log('token>'+__userToken)
    return uppload().then(rs=>{
      expect(rs.status).toBe(0);
    })
  })

  test('上传watter',()=>{
    console.log('token>'+__userToken)
    return uppload('water').then(rs=>{
      expect(rs.status).toBe(0);
    })
  })

  test('修改banner',()=>{
    // let ims=[request.get("http://dummyimage.com/200x100/"+Math.floor(Math.random()*1000)),];
    
    return uppload('banner').then(rs=>{
      console.log(rs);
      console.log(rs.result.insertId);
      const form={
        formData:{
          token:__userToken,
          // images:ims,
          desc:'banner123-'+Math.random()*1000,
          type:'banner',
          _id:rs.result.insertId
        }
      }
      return fetch.put('/home',form).then(rs1=>{
        console.log(rs1);
        expect(rs1.status).toBe(0);
      })
    }) 
  })



  test('删除banner',()=>{
    return uppload().then(rs=>{
      console.log(rs);
      return fetch.delete('/home',{
        _id:rs.result.insertId
      }).then(rs=>{
        console.log(rs);
        expect(rs.status).toBe(0);
        return Promise.resolve();
      })
    })
  })



  test('获取首页 banner water',()=>{
    return fetch.get('/home',null).then(rs=>{
      console.log(rs);
      expect(rs.status).toBe(0);
    })
  })

  test('获取water',()=>{
    return fetch.get('/home/water',{
      token:__userToken,
      skip:0,
      limit:5,
      format:`{
        rows{
          path
          desc
        }
      }`
    }).then(rs=>{
      console.log(rs);
      expect(rs.status).toBe(0);
    })
  })
})

