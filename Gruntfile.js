module.exports = function(grunt) {

    grunt.initConfig({
	pkg: grunt.file.readJSON('package.json'),
	jshint: {
	    files: {
		src: ['js/main.js', 'js/mediawiki-search.jquery.js']
	    }
	},
	sass: {
	    dev: {
		'css/main.css': 'css/main.sass'
	    }
	},
	watch: {
	    scripts: {
		files: ['js/*.js'],
		tasks: ['jshint']
	    },
	    styles: {
		files: ['css/*.sass'],
		tasks: ['sass']
	    }
	}
    }); 
    
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-sass');
    grunt.loadNpmTasks('grunt-contrib-watch');
    

    grunt.registerTask('default', ['watch']); 
    
};
