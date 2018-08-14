module.exports = {
    "extends": "eslint:recommended",
    "globals": {
      "__DEV__": true,
    },
    "plugins": [
        // "react"
    ],
    "parser":"babel-eslint",
    "env": {
      "browser": true,
      "node": true,
    },
    "settings": {
      "import/core-modules": [ "resolveAssetSource" ]
    },
    "rules": {
      // "react/jsx-filename-extension": 0,
      // "react/no-array-index-key": 1,
      // "react/sort-comp":0,//出现次序 警告
      // "react/prop-types":1,//proptypes 警告
      "import/no-extraneous-dependencies":1,
      "no-underscore-dangle": 1,
      "no-return-assign": 1,
      "arrow-body-style": 0,
      "no-plusplus": 0,
      "no-unsafe-finally": 0,
      "no-use-before-define":1,//使用和定义的顺序 警告就好
      "class-methods-use-this": 0,
      "import/prefer-default-export": 0,
      "no-restricted-properties": 1,
       "linebreak-style": 0,
       "semi":0,// [2, "always"],//语句强制分号结尾
       "prefer-rest-params":0,//arguments 参数不许使用
       "prefer-const":1,//const 警告
       "comma-dangle": 1,//对象字面量项尾不能有逗号
      "no-console": 0,
      "no-await-in-loop":0,//
      "no-extend-native":1,
      "import/no-extraneous-dependencies":1,
      "consistent-return":1,
      "no-undef":1
    }
};
