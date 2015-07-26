// Generated on 2015-07-23 using generator-angular 0.11.1
'use strict';

// # Globbing
// for performance reasons we're only matching one level down:
// 'test/spec/{,*/}*.js'
// use this if you want to recursively match all subfolders:
// 'test/spec/**/*.js'

module.exports = function (grunt) {

  // Load grunt tasks automatically
  require('load-grunt-tasks')(grunt);

  // Time how long tasks take. Can help when optimizing build times
  require('time-grunt')(grunt);

  // Configurable paths for the application
  var appConfig = {
    bower: require('./bower.json') ,
    app: require('./bower.json').appPath || 'app',
    dist: 'dist'
  };

  // Define the configuration for all the tasks
  grunt.initConfig({

    // Project settings
    yeoman: appConfig,

    // Watches files for changes and runs tasks based on the changed files
    watch: {
      bower: {
        files: ['bower.json'],
        tasks: ['wiredep']
      },
      js: {
        files: ['<%= yeoman.app %>/{,**/}*.js'],
       // tasks: ['newer:jshint:all'],
        tasks:['requirejs'],
        options: {
          livereload: '<%= connect.options.livereload %>'
        }
      },
      jsTest: {
        files: ['test/spec/{,*/}*.js'],
        tasks: ['newer:jshint:test', 'karma']
      },
      compass: {
        files: ['<%= yeoman.app %>/styles/{,*/}*.{scss,sass}'],
        tasks: ['compass:server', 'autoprefixer']
      },
      gruntfile: {
        files: ['Gruntfile.js']
      },
      livereload: {
        options: {
          livereload: '<%= connect.options.livereload %>'
        },
        files: [
          '<%= yeoman.app %>/{,*/}*.html',
          '.tmp/styles/{,*/}*.css',
          '<%= yeoman.app %>/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}'
        ]
      }
    },

    // The actual grunt server settings
    connect: {
      options: {
        port: 9000,
        // Change this to '0.0.0.0' to access the server from outside.
        hostname: 'localhost',
        livereload: 35729
      },
      livereload: {
        options: {
          open: true,
          middleware: function (connect) {
            return [
              connect.static('.tmp'),
              connect().use(
                '/bower_components',
                connect.static('./bower_components')
              ),
              connect().use(
                '/app/styles',
                connect.static('./app/styles')
              ),
              connect.static(appConfig.app)
            ];
          }
        }
      },
      test: {
        options: {
          port: 9001,
          middleware: function (connect) {
            return [
              connect.static('.tmp'),
              connect.static('test'),
              connect().use(
                '/bower_components',
                connect.static('./bower_components')
              ),
              connect.static(appConfig.app)
            ];
          }
        }
      },
      dist: {
        options: {
          open: true,
          base: '<%= yeoman.dist %>'
        }
      }
    },

    // Make sure code styles are up to par and there are no obvious mistakes
    jshint: {
      options: {
        jshintrc: '.jshintrc',
        reporter: require('jshint-stylish')
      },
      all: {
        src: [
          'Gruntfile.js',
          '<%= yeoman.app %>/scripts/{,*/}*.js'
        ]
      },
      test: {
        options: {
          jshintrc: 'test/.jshintrc'
        },
        src: ['test/spec/{,*/}*.js']
      }
    },

    // Empties folders to start fresh
    clean: {
      dist: {
        files: [{
          dot: true,
          src: [
            '.tmp',
            '<%= yeoman.dist %>/{,*/}*',
            '!<%= yeoman.dist %>/.git{,*/}*'
          ]
        }]
      },
      server: '.tmp'
    },

    // Add vendor prefixed styles
    autoprefixer: {
      options: {
        browsers: ['last 1 version']
      },
      server: {
        options: {
          map: true,
        },
        files: [{
          expand: true,
          cwd: '.tmp/styles/',
          src: '{,*/}*.css',
          dest: '.tmp/styles/'
        }]
      },
      dist: {
        files: [{
          expand: true,
          cwd: '.tmp/styles/',
          src: '{,*/}*.css',
          dest: '.tmp/styles/'
        }]
      }
    },

    // Automatically inject Bower components into the app
    wiredep: {
      app: {
        src: ['<%= yeoman.app %>/index.html'],
        ignorePath:  /\.\.\//
      },
      test: {
        devDependencies: true,
        src: '<%= karma.unit.configFile %>',
        ignorePath:  /\.\.\//,
        fileTypes:{
          js: {
            block: /(([\s\t]*)\/{2}\s*?bower:\s*?(\S*))(\n|\r|.)*?(\/{2}\s*endbower)/gi,
              detect: {
                js: /'(.*\.js)'/gi
              },
              replace: {
                js: '\'{{filePath}}\','
              }
            }
          }
      },
      sass: {
        src: ['<%= yeoman.app %>/styles/{,*/}*.{scss,sass}'],
        ignorePath: /(\.\.\/){1,2}bower_components\//
      }
    },

    // Compiles Sass to CSS and generates necessary files if requested
    compass: {
      options: {
        sassDir: '<%= yeoman.app %>/styles',
        cssDir: '.tmp/styles',
        generatedImagesDir: '.tmp/images/generated',
        imagesDir: '<%= yeoman.app %>/images',
        javascriptsDir: '<%= yeoman.app %>/scripts',
        fontsDir: '<%= yeoman.app %>/styles/fonts',
        importPath: './bower_components',
        httpImagesPath: '/images',
        httpGeneratedImagesPath: '/images/generated',
        httpFontsPath: '/styles/fonts',
        relativeAssets: false,
        assetCacheBuster: false,
        raw: 'Sass::Script::Number.precision = 10\n'
      },
      dist: {
        options: {
          generatedImagesDir: '<%= yeoman.dist %>/images/generated'
        }
      },
      server: {
        options: {
          sourcemap: true
        }
      }
    },

    // Renames files for browser caching purposes
    filerev: {
      dist: {
        src: [
         // '<%= yeoman.dist %>/{,*/}*.js',
          '<%= yeoman.dist %>/styles/{,*/}*.css',
         // '<%= yeoman.dist %>/img/{,*/}*.{png,jpg,jpeg,gif,webp,svg}',
           
        ]
      }
    },

    // Reads HTML for usemin blocks to enable smart builds that automatically
    // concat, minify and revision files. Creates configurations in memory so
    // additional tasks can operate on them
    useminPrepare: {
      html: '<%= yeoman.app %>/index.html',
      options: {
        dest: '<%= yeoman.dist %>',
        flow: {
          html: {
            steps: {
              js: ['concat', 'uglifyjs'],
              css: ['cssmin']
            },
            post: {}
          }
        }
      }
    },

    // Performs rewrites based on filerev and the useminPrepare configuration
    usemin: {
      html: ['<%= yeoman.dist %>/{,*/}*.html'],
      css: ['<%= yeoman.dist %>/styles/{,*/}*.css'],
      options: {
        assetsDirs: [
          '<%= yeoman.dist %>',
          '<%= yeoman.dist %>/images',
          '<%= yeoman.dist %>/styles'
        ]
      }
    },

    // The following *-min tasks will produce minified files in the dist folder
    // By default, your `index.html`'s <!-- Usemin block --> will take care of
    // minification. These next options are pre-configured if you do not wish
    // to use the Usemin blocks.
    // cssmin: {
    //   dist: {
    //     files: {
    //       '<%= yeoman.dist %>/styles/main.css': [
    //         '.tmp/styles/{,*/}*.css'
    //       ]
    //     }
    //   }
    // },
    // uglify: {
    //   dist: {
    //     files: {
    //       '<%= yeoman.dist %>/scripts/scripts_min.js': [
    //         '<%= yeoman.dist %>/scripts/scripts.js'
    //       ]
    //     }
    //   }
    // },


    uglify:{
            options : {
               // banner:'/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n',
                sourceMapRoot: '../',
                sourceMap:'dist/' + '.map',
                sourceMapUrl: '.min.js.map'
            },
    },

   // uglify: {
   //          options: {
   //              mangle: true,
   //              compress: true,
   //              report: 'min'
   //          },
   //          files:{
   //            expand:true ,
   //            cwd:"<%= yeoman.dist %>/scripts",
   //            src:"{,**/}*.js", 
   //            dest:"<%= yeoman.dist %>/scripts"
   //          }
   //      },


    // concat: {
    //   dist: {}
    // },

    imagemin: {
      dist: {
        files: [{
          expand: true,
          cwd: '<%= yeoman.app %>/images',
          src: '{,*/}*.{png,jpg,jpeg,gif}',
          dest: '<%= yeoman.dist %>/images'
        }]
      }
    },

    svgmin: {
      dist: {
        files: [{
          expand: true,
          cwd: '<%= yeoman.app %>/images',
          src: '{,*/}*.svg',
          dest: '<%= yeoman.dist %>/images'
        }]
      }
    },

    htmlmin: {
      dist: {
        options: {
          collapseWhitespace: true,
          conservativeCollapse: true,
          collapseBooleanAttributes: true,
          removeCommentsFromCDATA: true,
          removeOptionalTags: true
        },
        files: [{
          expand: true,
          cwd: '<%= yeoman.dist %>',
          src: ['*.html', 'views/{,**/}*.html'],
          dest: '<%= yeoman.dist %>'
        }]
      }
    },

    // ng-annotate tries to make the code safe for minification automatically
    // by using the Angular long form for dependency injection.
    ngAnnotate: {
      dist: {
        files: [
               // {
                //    expand: true,
               //    cwd: '.tmp/concat/scripts',
               //    src: '*.js',
               //    dest: '.tmp/concat/scripts'
               //  } ,

                 //  自己添加部分;    annotate 处理 自己代码  
                {
                  expand: true,  //  动态匹配  src -- dist ;  ????; 

                  cwd:  '<%= yeoman.app%>',
                  
                  src:  'scripts/{,**/}*.js',
                  // src:  'app/scripts/controllers/main.js' , //{,*/}*.js',
                  dest: '.tmp/.annotate'

                }  
        ]
      }
    },

    // Replace Google CDN references
    cdnify: {
      dist: {
        html: ['<%= yeoman.dist %>/*.html']
      }
    },

    // Copies remaining files to places other tasks can use
    copy: {
      dist: {
        options:{
          dot: true
        },

        files: [

              // 'bootstrap.prod.js',


                // 静态文件;  font , img , styles  ; 
                // script 用 ngAnnotate , jshite 处理; 
               {
                  expand: true,
                  dot: true, //  它允许模式模式匹配句点开头的文件名，即使模式并不明确文件名开头部分是否有句点
                  cwd: '<%= yeoman.app %>',
                  dest: '<%= yeoman.dist %>',
                  src: [
                    '*.{ico,png,txt}',
                    '{,**/}*.html',
                    'require_config.prod.js',

                    //htaccess文件(或者"分布式配置文件"）提供了针对目录改变配置的方法，
                    //'.htaccess', 

                    //'scripts/{,**/}*.js',   // js 文件有 requirejs 任务 处理; 

                    '{fonts,img,views}/{,**/}*.*' 
                  ]
                },  

                { // 拷贝 bower.json 文件;  被 concat 命令 合并到了 
                  //  .tmp/concat/  scripts/vendor.js     
                  //  "scripts/vendor.js" 是在 index.html中配置的; 
                     // expand:true , 
                     // cwd:  '.tmp',  
                     // src:   '{concat,**/}*.*', 
                     // dest: '<%= yeoman.dist %>'

                },  
                //  angular js 文件 ; 
                {
                  expand: true,
                  cwd: '.tmp/img',
                  dest: '<%= yeoman.dist %>/images',
                  src: ['generated/*']
                } ,




        ]
      },


      vendor:{ files:  [
                        { expand: true,
                          cwd:"app/vendor",
                          src:"*.js",
                          dest:"dist/vendor"
                        },
                        {
                          expand: true,
                          cwd:'bower_components',
                          dest:'<%= yeoman.dist %>/vendor',
                          src:[
                               'requirejs/require.js', 

                              'jquery/jquery.min.js', 
                              'angular/angular.min.js',

                              'lodash/lodash.min.js',  
                              'angular-bootstrap/ui-bootstrap-tpls.min.js',

                              'angular-ui-router/release/angular-ui-router.min.js',
                              'angular-translate/angular-translate.min.js',
                              'angular-resource/angular-resource.min.js',

                              'angular-animate/angular-animate.min.js',
                              'angular-cookies/angular-cookies.min.js'
                         
                          ]
                        }
                 ] 
      },

      styles: {
        expand: true,
        cwd: '<%= yeoman.app %>/styles',
        dest: '.tmp/styles/',
        src: '{,*/}*.css'
      }
    },

    // Run some tasks in parallel to speed up the build process
    concurrent: {
      server: [
       // 'compass:server'
      ],
      test: [
        'compass'
      ],
      dist: [
       // 'compass:dist',
        'imagemin',
        'svgmin'
      ]
    },

    // Test settings
    karma: {
      unit: {
        configFile: 'test/karma.conf.js',
        singleRun: true
      }
    } ,



    processhtml: {
            options: {
                commentMarker: 'process'
            },
            dist: {
                files: {
                    '<%= yeoman.dist %>/index.html': 
                    '<%= yeoman.dist %>/index.html'
                }
            }
    },
    requirejs: {
          compile: {
              options: {
                 
                  baseUrl: 'app/scripts',

                  mainConfigFile: 'app/require_config.js',

                  include: ['app', 'boot'],  // 额外的define ; 

                  insertRequire: ['boot'],  //  额外的 require(..);
 
                  out: '<%= yeoman.dist  %>/scripts/thinglinx.js',

                  //generateSourceMaps: true,

                  optimize:"none",

                 // stubModules: ['directive'], 

                  

                  paths: {
                          
                        "scripts":".", // scripes  路径忽略; 

                        "vendor":"empty:", // 忽略 wendor 路径 js 文件; 


                        'jQuery': 'empty:',
                        'angular': 'empty:',
                        'lodash': 'empty:',  
                        'angular-ui': 'empty:', 
                        'angular-ui-router': 'empty:', 
                        'angular-translate': 'empty:', 
                        'angular-resource': 'empty:',
                        
                        'angular-animate': 'empty:',
                        'angular-cookies': 'empty:',



                        'ngStorage': 'empty:',
                        'ui-jq': 'empty:',
                        'ui-load': 'empty:',
                        'ui-validate': 'empty:',

                  }
              }
          }
      }



  });


  grunt.registerTask('serve', 'Compile then start a connect web server', function (target) {
    if (target === 'dist') {
      return grunt.task.run(['build', 'connect:dist:keepalive']);
    }

    grunt.task.run([
      'clean:server',
      'wiredep',
      'concurrent:server',
      'autoprefixer:server',
      'connect:livereload',
      'watch'
    ]);
  });

  grunt.registerTask('server', 'DEPRECATED TASK. Use the "serve" task instead', function (target) {
    grunt.log.warn('The `server` task has been deprecated. Use `grunt serve` to start a server.');
    grunt.task.run(['serve:' + target]);
  });

  grunt.registerTask('test', [
    'clean:server',
    'wiredep',
    'concurrent:test',
    'autoprefixer',
    'connect:test',
    'karma'
  ]);



  grunt.registerTask('dist', [
        'clean:dist',
        'useminPrepare',
        'copy:dist', 
        'copy:vendor', 
        'cssmin', 
        'requirejs',  //   
        //'filerev', // md5 命名文件; 
        'usemin',  
        'processhtml',
        'watch:js'
  ])




  grunt.registerTask('build', [
    'clean:dist',
    
    //  'wiredep',  // 加载 bower.json 中 的类库 , ;  这里手动 该; 
                    // 需要有<!-- build:js |css  
                    //          <!- bower:js|css    两个标签的支持; 

    'useminPrepare',  // 预处理 index.html 文件; 内存中生成 concat, cssmin , uglify 命令; 

       // 'concurrent:dist',   //   img , svg  文件  压缩 并复制到 dist 目录;  
       // 'autoprefixer',    //  处理 css ;  添加前缀????  


    //'concat',         // 处理 合并build:js ,  
                        // 不处理 build:css ;  
                        //无<!-- build:js 时  , useminPrepare 不会生成该命令 ; 
                           // 想用 须手动配置; 

    // 'ngAnnotate',   //    ng  function($scope)  转变成   ['$scope', function($scope){ ..}]  形式;  

 
    //---------------分水岭----------------
    
    'copy:dist',    // 拷贝  html , img , bower.json 类库文件 ...  到 dist目录; 
    'copy:vendor',  
    // 'cdnify',
  

    'cssmin',  // 合并 build:css 文件; 
    //'uglify',  //  拷贝 build:js ,到 dist 并压缩;  
                 //  若想不压缩; 须在copy中配置  从.tmp 拷贝到  dist ; 
                 // 无 <!-- build:js , useminPrepare 不会生成该命令 ; 想用 须手动配置;

    'requirejs',  //   
    //'filerev', // md5 命名文件; 


    'usemin',  // 使用 build:js , build:css  合并后的文件路径; 并使用Md5 名称;  
    // 'htmlmin' // 压缩 html 代码; 
    'processhtml'

  ]);


  grunt.registerTask('r', [
     'requirejs'
  ]);


  grunt.registerTask('default', [
    'newer:jshint',
    'test',
    'build'
  ]);


 


};


