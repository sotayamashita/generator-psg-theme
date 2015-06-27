'use strict'
var yeoman = require('yeoman-generator')
var chalk = require('chalk')
var yosay = require('yosay')
var npmName = require('npm-name')
var _s = require('underscore.string')

var extractThemeName = function (appname) {
  var match = appname.match(/^psg theme (.+)/)

  if (match && match.length === 2) {
    return match[1].toLowerCase()
  }

  return appname
}

module.exports = yeoman.generators.Base.extend({
  constructor: function () {
    yeoman.Base.apply(this, arguments)

    this.option('flat', {
      type: Boolean,
      required: false,
      defaults: false,
      desc: 'When specified, generators will be created at the top level of the project.'
    })
  },

  initializing: function () {
    this.pkg = require('../../package.json')
    this.currentYear = (new Date()).getFullYear()
    this.config.set('structure', this.options.flat ? 'flat' : 'nested')
    this.generatorsPrefix = this.options.flat ? '' : './'
    this.appGeneratorDir = this.options.flat ? 'app' : 'generators'
  },

  prompting: {
    askFor: function () {
      var done = this.async()
      console.log(this.appname)
      var themeName = extractThemeName(this.appname)
      console.log(themeName)

      this.log(yosay(
        'Welcome to the mathematical ' + chalk.red('PostCSS Style Guide Theme') + ' generator!'
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
          var name = 'psg-theme-' + answers.themeName

          npmName(name, function (err, available) {
            if (!available) {
              done(true)
            }

            if (err) {
              console.log(err)
            }

            done(false)
          })
        }
      }]

      this.prompt(prompts, function (props) {
        if (props.askNameAgain) {
          return this.prompting.askFor.call(this)
        }

        this.themeName = props.themeName
        this.appname = _s.slugify('psg-theme-' + this.themeName)

        done()
      }.bind(this))
    }
  },

  writing: {
    projectfiles: function () {
      this.template('_package.json', 'package.json')
      this.template('LICENSE.md')
      this.template('README.md')
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

    templates: function () {
      this.fs.copy(
        this.templatePath('editorconfig'),
        this.destinationPath('.editorconfig')
      )
      this.fs.copy(
        this.templatePath('template.ejs'),
        this.destinationPath('template.ejs')
      )
      this.fs.copy(
        this.templatePath('style.css'),
        this.destinationPath('style.css')
      )
    }
  },

  install: function () {
    this.npmInstall()
  }
})
