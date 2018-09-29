/** log4js 日志
* date 2018-03-13
* author wolfsky7 -->------|----------------->
**/

const log4js=require('log4js')

log4js.configure({
  appenders: { 
    'console': { "type": "console" },
    'file':{
      "type": "dateFile",
      "filename":  `./logs/log`,
      "pattern": "-yyyy-MM-dd.log",
      "alwaysIncludePattern": true,
    }
  },
  categories: { 
    default: { 
      "appenders": ["console","file"], "level": "debug",
    },
    real:{
      appenders:["file"],level:'error'
    }
  }
});

const logger=log4js.getLogger();
global.__g_log=logger;