/**
* 自动引入controller 下的文件
*  <>-----}|------------------------------->
* 
*/

const fs = require('fs');
const path = require('path')
const Router = require('koa-router')

const checkRouter = route => {
  return new Promise(s => {
    process.nextTick(() => {
      if (route instanceof Router) {
        return s(route);
      }

      if (route && route.prototype && route.prototype.__router && route.prototype.__router instanceof Router) {
        new route()
        return s(route.prototype.__router)
      }
      return s(null)
    })
  })
}

const readDir = async (dir) => {
  let routes = [];
  let i = 0;
  const resultCheck = (s) => {
    if (i == 0) {
      s(routes)
    }
  }

  return new Promise((s) => {
    fs.readdir(dir, (err, names) => {
      if (err) {
        return s([])
      }
      names.forEach(name => {
        i++;
        if (name.slice(-3, name.length) == ".js") {
          readFile(path.join(dir, name)).then(rs => {
            if (rs)
              routes = routes.concat(rs)
            i--;
            resultCheck(s);
          })

        }
        else {
          readDir(path.join(dir, name)).then(rs => {
            i--;
            routes = routes.concat(rs);
            resultCheck(s);
          })
        }
      })
    })
  })

}


const readFile = async (file) => {
  if (/\.test\.js/.test(file)) {
    // 测试文件
    return null
  }

  let route = require(file) || {};
  route = route.default || route;

  return checkRouter(route);
}

const getRoutes = async (dir) => {
  return readDir(dir)
}

const autoroute = async (koa, dir) => {
  const absolutedir = path.resolve(dir);
  const routes = await getRoutes(absolutedir);
  routes.filter(r => !!r).forEach(route => {
    koa.use(route.routes())
  })
  return routes;
}

module.exports = autoroute;


