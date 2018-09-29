const {fetch}=require('../lib/easy-test')

describe('doc----}|------------------------------->',()=>{
		test('test',()=>{
			return fetch.get('/doc/test',{he:Math.random()}).then(rs=>{
				expect(rs.status).toBe(500);
			})
		}) 
		//{append}
})