// Importing required modules and styles
import $ from 'jquery'; // Importing jQuery
import angular from 'angular'; // Importing AngularJS
import podStationInternalReuse from './reuse/ng/reuse'; // Importing podStationInternalReuse module

// Importing CSS files
import './popup.css'; // Importing popup CSS
import './podstation.css'; // Importing podStation CSS
import 'font-awesome/css/font-awesome.css'; // Importing Font Awesome CSS

// Waiting for the document to be ready
$(document).ready(function () {
	// Adding click event listener to 'open' button
	$('#open').click(function (event) {
		event.preventDefault(); // Preventing default action

		// Getting the background page
		chrome.runtime.getBackgroundPage(function (bgPage) {
			bgPage.openPodStation(); // Opening the podStation
		});
	});
});

// Creating AngularJS module
const myApp = angular.module('podstationPopupApp', [podStationInternalReuse.name]);

// Creating AngularJS controller
myApp.controller('feedsInPageController', ['$scope', 'analyticsService', function ($scope, analyticsService) {
	$scope.feedsInPage = []; // Initializing feedsInPage array

	// Querying for the active tab in the current window
	chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
		var tab = tabs[0]; // Getting the first tab

		// Sending a message to get the feeds in the page
		chrome.runtime.sendMessage({ type: 'getFeedsInPage', tabId: tab.id }, function (response) {
			$scope.$apply(function () {
				$scope.feedsInPage = response; // Setting the feedsInPage array
			});
		});
	});

	// Function to add a podcast
	$scope.addPodcast = function (feedUrl) {
		analyticsService.trackEvent('feed', 'add_from_page'); // Tracking the event

		// Sending a message to add the podcast
		chrome.runtime.sendMessage({ type: 'addPodcast', feedUrl: feedUrl }, function (response) {
			$scope.$apply(function () {
				$scope.feedsInPage = response; // Updating the feedsInPage array
			});
		});
	};
}]);

// Creating AngularJS filter
myApp.filter('chrome_i18n', function () {
	return function (input) {
		// Returning the localized message for the input
		return chrome.i18n.getMessage(input);
	};
});

// Running the AngularJS module
angular.module('podstationPopupApp').run(['messageService', 'analyticsService', function (messageService, analyticsService) {
	// Sending a message to get the options
	messageService.for('optionsManager').sendMessage('getOptions', {}, function (options) {
		if (options.analytics) {
			// Setting up Google Analytics
			(function (i, s, o, g, r, a, m) {
				i['GoogleAnalyticsObject'] = r; i[r] = i[r] || function () {
					(i[r].q = i[r].q || []).push(arguments)
				}, i[r].l = 1 * new Date(); a = s.createElement(o),
					m = s.getElementsByTagName(o)[0]; a.async = 1; a.src = g; m.parentNode.insertBefore(a, m)
			})(window, document, 'script', 'https://www.google-analytics.com/analytics.js', 'ga');

			ga('create', 'UA-67249070-2', 'auto');
			ga('set', 'checkProtocolTask', function () { });

			analyticsService.trackPageView('/feedsInPage'); // Tracking the page view
		}
	});
}]);