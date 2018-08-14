/**
* 测试
*  <>-----}|------------------------------->
* 
*/

const {fetch}=require('../../lib/easy-test')
const request=require('request')

describe('用户模块',()=>{

  test('测试已存在用户名',()=>{
    return fetch.post('/user/register',{
      unm:'asdf',
      pwd:'12312'
    }).then(rs=>{
      expect(rs.status).toBe(500);
    })
  })

  test('测试注册成功',()=>{
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


  describe('登陆测试',()=>{
    test('测试未知用户名',()=>{
      return fetch.post('/user/login',{
        unm:'asd',
        pwd:'12312'
      }).then(rs=>{
        expect(rs.status).toBe(500);
      })
    })
    test('测试不正确的密码',()=>{
      return fetch.post('/user/login',{
        unm:'asdf',
        pwd:'12312123'
      }).then(rs=>{
        expect(rs.status).toBe(500);
      })
    })
    test('测试成功',()=>{
      return fetch.post('/user/login',{
        unm:'asdf5',
        pwd:'12312'
      }).then(rs=>{
        expect(rs.status).toBe(0);
      })
    })
  })

  describe('用户信息',()=>{
    let __userToken='';
    beforeAll(()=>{
      return fetch.post('/user/login',{
        unm:'asdf5',
        pwd:'12312'
      }).then(rs=>{
        __userToken=rs.token;
        return Promise.resolve(true)
      })
    })

    test.skip('修改用户信息',()=>{
      const ims=request.get("http://dummyimage.com/200x100/"+Math.floor(Math.random()*1000));
      const form={
        formData:{
          token:__userToken,
          images:ims,
          desc:'banner1',
          type:'banner'
        }
      }

      return fetch.post('/user/info',form).then(rs=>{
        expect(rs.status).toBe(500);
      })
    })

    test.skip('刷新用户信息',()=>{
      return fetch.post('/user/profile',{
        token:__userToken
      }).then(rs=>{
        expect(rs.status).toBe(500);
      })
    })
  })