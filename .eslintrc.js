module.exports = {
  "env": {
    "es6": true,
    "node": true,
    "browser": true,
    "mocha": true
  },
  "plugins": [
    "react"
  ],
  "parser": "babel-eslint",
  "extends": "eslint:recommended",
  "rules": {
    "indent": [
      "error",
      "tab",
      {
        "SwitchCase": 1
      }
    ],
    "linebreak-style": [
      "error",
      "unix"
    ],
    "no-console": [
      "off"
    ],
    "no-ex-assign": [
      "off"
    ],
    "no-extra-boolean-cast": [
      "off"
    ],
    "no-unused-vars": [
      "error",
      {
        "vars": "all",
        "args": "none",
        "varsIgnorePattern": "config|_|logger|testing|should"
      }
    ],
    "semi": [
      "error",
      "always"
    ]
  }
}
