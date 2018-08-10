const fetch=require('../lib/easy-test')
describe('test---------------------------->',()=>{
		test('首页',()=>{
			return fetch.get('/',{keyword:Math.random(),}).then(rs=>{
				expect(rs.status).toBe(0);
			})
		}) 
		test('获取首页数据',()=>{
			return fetch.get('/home',null).then(rs=>{
				expect(rs.status).toBe(0);
			})
		}) 
		test('获取瀑布流数据',()=>{
			return fetch.get('/home/water',{skip:Math.random(),limit:Math.random(),}).then(rs=>{
				expect(rs.status).toBe(0);
			})
		}) 
		test('新增',()=>{
			return fetch.post('/home',{image:Math.random(),desc:Math.random(),type:Math.random(),}).then(rs=>{
				expect(rs.status).toBe(0);
			})
		}) 
		test('修改',()=>{
			return fetch.put('/home',{_id:Math.random(),}).then(rs=>{
				expect(rs.status).toBe(0);
			})
		}) 
		test('删除',()=>{
			return fetch.delete('/home',null).then(rs=>{
				expect(rs.status).toBe(0);
			})
		}) 
		//{append}
})