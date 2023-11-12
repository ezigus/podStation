/**
 * feedFinder.js
 * 
 * This script is used to find RSS feeds in a webpage. It uses jQuery for DOM manipulation 
 * and Chrome's runtime API for message passing between different parts of a Chrome extension.
 * 
 * The script works by scanning the webpage for link elements with rel='alternate' and type='application/rss+xml'.
 * These are typically used to denote RSS feeds. When such a link is found, a message is sent to the background script
 * and the feed is added to an array. The script also listens for messages from the background script requesting the
 * found feeds, and responds with the array of feeds.
 */

// Importing jQuery
import $ from 'jquery';

// An array to store the found feeds
var feedList = [];

// A function to convert a relative URL to an absolute URL
function absolutePath(href) {
	var link = document.createElement("a");
	link.href = href;
	return (link.protocol + "//" + link.host + link.pathname + link.search + link.hash);
}

// When the document is ready
$(document).ready(function () {
	// For each link element with rel='alternate'
	$("link[rel='alternate']").each(function () {
		var link = $(this);

		// If the link is not of type 'application/rss+xml', skip it
		if (link.attr('type') !== 'application/rss+xml') {
			return true;
		}

		// Send a message to the background script that a feed was found
		chrome.runtime.sendMessage({
			action: 'feedFound',
		});

		// If the link has an href attribute
		if (link.attr('href')) {
			// Add the feed to the feedList
			feedList.push({
				title: link.attr('title') ? link.attr('title') : document.title,
				url: absolutePath(link.attr('href'))
			});
		}
	});
});

// Listen for messages from the background script
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
	// If the message action is 'getFeeds'
	if (message.action === 'getFeeds') {
		// Send the feedList as the response
		sendResponse(feedList);
	}
});