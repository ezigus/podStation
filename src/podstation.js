// Importing required modules and styles
import $ from 'jquery'; // Importing jQuery
import podStationApp from './ui/ng/podstationApp'; // Importing podStationApp module

import './podstation.css'; // Importing podStation CSS
import 'font-awesome/css/font-awesome.css'; // Importing Font Awesome CSS
import AnalyticsService from './reuse/ng/services/analyticsService'; // Importing AnalyticsService

// Waiting for the document to be ready
$(document).ready(function () {
	// Adding click event listener to 'updateAll' button
	$('#updateAll').click(function (event) {
		event.preventDefault(); // Preventing default action

		// Getting the background page
		chrome.runtime.getBackgroundPage(function (bgPage) {
			let analyticsService = new AnalyticsService(); // Creating an instance of AnalyticsService
			analyticsService.trackEvent('feed', 'user_update_all'); // Tracking the event
			bgPage.podcastManager.updatePodcast(''); // Updating the podcast
		});
	});
});