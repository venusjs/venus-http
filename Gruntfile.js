module.exports = function(grunt) {
  grunt.loadNpmTasks('grunt-eslint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-jsdoc');
  grunt.loadNpmTasks('grunt-mocha-istanbul');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-release');

  var src  = ['lib/**/*.js', 'index.js'];
  var test = ['test/unit/**/*.js'];

  grunt.initConfig({

    // Configuration for grunt-contrib-clean
    clean : {
      doc : 'doc',
      test : 'coverage',
      unit : 'coverage/unit'
    },

    // Configuration for grunt-eslint
    eslint: {
      options: {
        config: '.eslintrc'
      },
      target: src
    },

    // Configuration for grunt-mocha-istanbul
    mocha_istanbul: {
      unit: {
        src: 'test/unit',
        options: {
          coverage: true,
          mask: '**/*.spec.js',
          root: './lib',
          reportFormats: ['lcov'],
          reporter : 'spec',
          coverageFolder : 'coverage/unit'
        }
      }
    },

    // Configuration for grunt-jsdoc
    jsdoc : {
      dist : {
        src: src,
        options: {
          destination: 'doc'
        }
      }
    },

    // Configuration for grunt-contrib-watch
    watch : {
      src : {
        files : [src, test],
        tasks : ['test:fast']
      }
    }
  });

  grunt.registerTask('default', ['doc', 'test']);
  grunt.registerTask('doc', ['clean:doc','jsdoc']);
  grunt.registerTask('test', ['eslint', 'clean:unit', 'mocha_istanbul']);
};
