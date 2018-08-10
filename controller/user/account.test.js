/**
* 测试
*  <>-----}|------------------------------->
* 
*/

const fetch=require('../../lib/easy-test')

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

  describe('刷新用户信息测试',()=>{
    test.skip('刷新用户信息',()=>{
      return fetch.post('/user/profile',{
        token:'',
      }).then(rs=>{
        expect(rs.status).toBe(500);
      })
    })
  })