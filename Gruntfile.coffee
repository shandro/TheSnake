module.exports = (grunt) ->
	# Project configuration.
	grunt.loadNpmTasks 'grunt-contrib-copy'
	grunt.loadNpmTasks 'grunt-contrib-concat'
	grunt.loadNpmTasks 'grunt-contrib-uglify'
	grunt.loadNpmTasks 'grunt-contrib-watch'
	grunt.loadNpmTasks 'grunt-contrib-clean'
	grunt.loadNpmTasks 'grunt-contrib-sass'
	grunt.loadNpmTasks 'grunt-contrib-compass'

	grunt.initConfig
		copy:
			static:
				files: [
					expand: true
					cwd: 'static/'
					src: ['**', '.htaccess']
					dest: 'dist/'
				]
		concat:
			vendor:
				files:
					'dist/js/vendor.js': [
						'js/vendor/jquery-1.10.2.min.js'
						'js/vendor/angular-1.2.16/angular.js'
						'js/vendor/angular-1.2.16/angular-animate.min.js'
					]
			app:
				files:
					'dist/js/app.js': [
						'tmp/app.js'
						'js/*.js'
						'js/**/*.js'
						'!js/vendor/**/*.js'
					]
		compass:
			dev:
				options:
					sassDir: 'sass'
					cssDir: 'dist/css'
					fontsDir: 'dist/css/fonts'
					debugInfo: true
					trace: true
					force: true
					relativeAssets: true
			prod:
				options:
					sassDir: 'sass'
					cssDir: 'dist/css'
					fontsDir: 'css/fonts'
					outputStyle: 'compressed'
					debugInfo: false
					trace: false
					force: false
					relativeAssets: false
		uglify:
			js:
				files:
					'dist/js/vendor.js': 'dist/js/vendor.js'
					'dist/js/app.js': 'dist/js/app.js'
		clean:
			dist: ['dist/']
			tmp: ['tmp/']
		watch:
			js:
				files: [
					'js/**/*.js'
				]
				tasks: ['concat:app']
			css:
				files: ['sass/**/*']
				tasks: ['compass:dev']
			static:
				files: ['static/**/*']
				tasks: ['copy:static']

		grunt.registerTask 'default', ['dev', 'watch']
		grunt.registerTask 'reset', ['clean','dev']

		grunt.registerTask 'dev', [
			'copy:static'
			'concat:vendor'
			'concat:app'
			'compass:dev'
		]
		grunt.registerTask 'production', [
			'clean'
			'copy:static'
			'concat'
			'compass:prod'
			'uglify'
		]
