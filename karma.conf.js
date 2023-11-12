/*
  File: karma.conf.js
  Description: This is the configuration file for Karma, a test runner for JavaScript.
  It exports a function that takes a config parameter and sets the configuration for Karma.

  The configuration includes:
  - The base path used to resolve all patterns (files, exclude)
  - The frameworks to use (Jasmine and Webpack in this case)
  - The Webpack configuration to use
  - The list of files/patterns to load in the browser, including jQuery, AngularJS, AngularJS Mocks, spec files, and various files in the background spec
  - The list of files/patterns to exclude from the test bundle

  This configuration is used when running the 'karma start' command.
*/

// Importing required modules
const jasmineSeedReporter = require('./spec/support/jasmine-seed-reporter.js'); // Importing Jasmine Seed Reporter
const webpackConfig = require('./webpack.dev.js'); // Importing Webpack Development Configuration

// Removing the entry point from the Webpack configuration
delete webpackConfig.entry;

// Exporting a function to configure Karma
module.exports = function (config) {
	config.set({
		// Base path that will be used to resolve all patterns (e.g., files, exclude)
		basePath: '',

		// Frameworks to use
		// Available frameworks: https://npmjs.org/browse/keyword/karma-adapter
		frameworks: ['jasmine', 'webpack'], // Using Jasmine and Webpack

		// Providing the Webpack configuration to Karma
		webpack: webpackConfig,

		// List of files / patterns to load in the browser
		files: [
			'node_modules/jquery/dist/jquery.js', // jQuery
			'node_modules/angular/angular.js', // AngularJS
			'node_modules/angular-mocks/angular-mocks.js', // AngularJS Mocks
			{ pattern: 'spec/**/*.spec.js', watched: false }, // Spec files
			{ pattern: 'spec/background/**/*.xml', included: false }, // XML files in the background spec
			{ pattern: 'spec/background/**/*.opml', included: false }, // OPML files in the background spec
			{ pattern: 'spec/background/**/*.json', included: false } // JSON files in the background spec
		],

		// List of files / patterns to exclude
		exclude: [
		],