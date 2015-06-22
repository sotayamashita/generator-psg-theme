'use strict'
var yeoman = require('yeoman-generator')
var chalk = require('chalk')
var yosay = require('yosay')
var npmName = require('npm-name')
var _s = require('underscore.string')

var extractThemeName = function (appname) {
  var match = appname.match(/^psg-theme-(.+)/)

  if (match && match.length === 2) {
    return match[1].toLowerCase()
  }

  return appname
}

module.exports = yeoman.generators.Base.extend({
  prompting: {
    askForThemeName: function () {
      var done = this.async()
      var themeName = extractThemeName(this.appname)

      // Have Yeoman greet the user.
      this.log(yosay(
        'Welcome to the mathematical ' + chalk.red('PostCSS Theme') + ' generator!'
      ))

      var prompts = [{
        type: 'input',
        name: 'themeName',
        message: "What's the theme name of your PostCSS Style Guide?",
        default: themeName
      }, {
        type: 'confirm',
        name: 'askNameAgain',
        message: 'The name above already exists on npm, choose another?',
        default: true,
        when: function (answers) {
          var done = this.async()
          var name = 'psg-theme-' + answers.generatorName

          npmName(name, function (err, available) {
            if (!available) {
              done(true)
            }

            if (err) {
              //
            }

            done(false)
          })
        }
      }]

      this.prompt(prompts, function (props) {
        if (props.askNameAgain) {
          return this.prompting.askForThemeName.call(this)
        }

        this.themeName = props.themeName
        this.appname = _s.slugify('psg-theme' + this.themeName)

        done()
      }.bind(this))
    }
  },

  writing: {
    app: function () {
      this.fs.copy(
        this.templatePath('_package.json'),
        this.destinationPath('package.json')
      )
    },

    gitfiles: function () {
      this.fs.copy(
        this.templatePath('gitattributes'),
        this.destinationPath('.gitattributes')
      )
      this.fs.copy(
        this.templatePath('gitignore'),
        this.destinationPath('.gitignore')
      )
    },

    projectfiles: function () {
      this.fs.copy(
        this.templatePath('editorconfig'),
        this.destinationPath('.editorconfig')
      )
    }
  },

  install: function () {
    this.installDependencies()
  }
})
