import $ from 'jquery';
import podStationBackgrounAppModule from '../../src/background/ng/backgroundApp';
import { ajaxGetFeed, ajaxGetFeedFromFile, syncGetFeedContent } from '../reuse/ajax.mock';
import analyticsServiceMockFn from '../reuse/analyticsService.mock';
import browserStorageMockFn from '../reuse/browser.mock';
import fixAngularInjector from '../reuse/fixAngularInjector';
import FEEDS from './feeds/feedsConstants';

describe('podcastManager',  function() {

	beforeEach(angular.mock.module(podStationBackgrounAppModule.name));

	beforeEach(angular.mock.module(function($provide) {
		$provide.factory('browser', browserStorageMockFn);

		// Dummies
		$provide.factory('analyticsService', analyticsServiceMockFn);
	}));

	var browserService;
	var messageService;
	var podcastManager;
	var podcastDataService;
	var dateService;
	var $rootScope;
	var ajaxSpy;

	beforeEach(angular.mock.inject(function($injector) {
		fixAngularInjector($injector);
		
		ajaxSpy = spyOn($, 'ajax').and.callFake(ajaxGetFeed);

		$rootScope = $injector.get('$rootScope');
		browserService = $injector.get('browser');
		messageService = $injector.get('messageService');
		messageService.reset();
		podcastDataService = $injector.get('podcastDataService');
		dateService = $injector.get('dateService');
		podcastManager = $injector.get('podcastManager');
		podcastManager.reset();
	}))

	describe('addPodcast', function() {
		it('should store the added podcast', function() {
			podcastManager.addPodcast(FEEDS.WITH_GUID.URL);

			$rootScope.$apply();

			expect(browserService.storage.sync._getFullStorage()).toEqual({
				'syncPodcastList': [{
					url: FEEDS.WITH_GUID.URL,
					i: 1
				}]
			});

			expect(browserService.storage.local._getFullStorage()).toEqual(JSON.parse(syncGetFeedContent('feed-with-guid.json').response));
		});
	});

	describe('setEpisodeProgress', function() {
		it('should store information for an episode with guid', function() {
			var now = new Date();
			spyOn(dateService, 'now').and.returnValue(now);

			podcastManager.addPodcast(FEEDS.WITH_GUID.URL);

			const episodeId = podcastDataService.episodeId(FEEDS.WITH_GUID.EP2);

			podcastManager.setEpisodeProgress(episodeId, 120);

			$rootScope.$apply();

			expect(browserService.storage.sync._getFullStorage()['P1']).toEqual({
				'e': [{
					'i': FEEDS.WITH_GUID.EP2.guid,
					't': 120,
					'l': JSON.parse(JSON.stringify(now))
				}]
			});
		});

		it('should clean up when setting it to zero', function() {
			var now = new Date();
			spyOn(dateService, 'now').and.returnValue(now);

			podcastManager.addPodcast(FEEDS.WITH_GUID.URL);

			const episodeId1 = podcastDataService.episodeId(FEEDS.WITH_GUID.EP1);
			const episodeId2 = podcastDataService.episodeId(FEEDS.WITH_GUID.EP2);

			podcastManager.setEpisodeProgress(episodeId1, 60);
			podcastManager.setEpisodeProgress(episodeId2, 120);

			$rootScope.$apply();

			podcastManager.setEpisodeProgress(episodeId1, 0);

			$rootScope.$apply();

			expect(browserService.storage.sync._getFullStorage()['P1']).toEqual({
				'e': [{
					'i': FEEDS.WITH_GUID.EP2.guid,
					't': 120,
					'l': JSON.parse(JSON.stringify(now))
				}]
			});
		});

		it('should store information for an episode without guid, but with title', function() {
			var now = new Date();
			spyOn(dateService, 'now').and.returnValue(now);

			podcastManager.addPodcast(FEEDS.WITHOUT_GUID.URL);

			const episodeId = podcastDataService.episodeId(FEEDS.WITHOUT_GUID.EP2);

			podcastManager.setEpisodeProgress(episodeId, 120);

			$rootScope.$apply();

			expect(browserService.storage.sync._getFullStorage()['P1']).toEqual({
				'e': [{
					'i': FEEDS.WITHOUT_GUID.EP2.title,
					's': 't',
					't': 120,
					'l': JSON.parse(JSON.stringify(now))
				}]
			});
		});
	});

	describe('deletePodcast', function() {
		it('should delete from storage and manager', function() {
			podcastManager.addPodcast(FEEDS.WITH_GUID.URL);
			podcastManager.addPodcast(FEEDS.WITHOUT_GUID.URL);
	
			$rootScope.$apply();

			const episodeId = podcastDataService.episodeId(FEEDS.WITHOUT_GUID.EP2);

			podcastManager.setEpisodeProgress(episodeId, 120);

			$rootScope.$apply();

			podcastManager.deletePodcast(FEEDS.WITHOUT_GUID.URL);

			$rootScope.$apply();
	
			expect(browserService.storage.sync._getFullStorage()).toEqual({
				'syncPodcastList': [{
					url: FEEDS.WITH_GUID.URL,
					i: 1
				}]
			});

			expect(browserService.storage.local._getFullStorage()).toEqual(JSON.parse(syncGetFeedContent('feed-with-guid.json').response));

			expect(podcastManager.podcastList.length).toEqual(1);
		});
	});

	describe('getEpisodesInProgress', function() {
		it('should respond with all episodes in progress when one podcast have one ep in progress', function() {
			var now = new Date();
			spyOn(dateService, 'now').and.returnValue(now);

			podcastManager.addPodcast(FEEDS.WITH_GUID.URL);
			podcastManager.addPodcast(FEEDS.WITHOUT_GUID.URL);

			const episodeId1 = podcastDataService.episodeId(FEEDS.WITH_GUID.EP2);
			const episodeId2 = podcastDataService.episodeId(FEEDS.WITHOUT_GUID.EP2);

			podcastManager.setEpisodeProgress(episodeId1, 60);

			$rootScope.$apply();

			var episodesInProgress;
			
			podcastManager.getEpisodesInProgress().then(function(result) {
				episodesInProgress = result;
			});

			$rootScope.$apply();
			
			// I'm not sure yet on the contract I want to fullfil besides the
			// currentTime
			expect(episodesInProgress.map(function(item) { return item.episodeUserData.currentTime })).toEqual([
				60
			]);
		});

		it('should respond with all episodes in progress when all podcasts have one ep in progress', function() {
			var now = new Date();
			spyOn(dateService, 'now').and.returnValue(now);

			podcastManager.addPodcast(FEEDS.WITH_GUID.URL);
			podcastManager.addPodcast(FEEDS.WITHOUT_GUID.URL);

			const episodeId1 = podcastDataService.episodeId(FEEDS.WITH_GUID.EP2);
			const episodeId2 = podcastDataService.episodeId(FEEDS.WITHOUT_GUID.EP2);

			podcastManager.setEpisodeProgress(episodeId1, 60);
			podcastManager.setEpisodeProgress(episodeId2, 120);

			$rootScope.$apply();

			var episodesInProgress;
			
			podcastManager.getEpisodesInProgress().then(function(result) {
				episodesInProgress = result;
			});

			$rootScope.$apply();
			
			// I don't care about the order, so I'm sorting
			// before checking the result
			episodesInProgress.sort(function(a, b) {
				return a.episodeUserData.currentTime - b.episodeUserData.currentTime;
			});

			// I'm not sure yet on the contract I want to fullfil besides the
			// currentTime
			expect(episodesInProgress.map(function(item) { return item.episodeUserData.currentTime })).toEqual([
				60,
				120
			]);
		});

		it('should ignore episodes that do not exist anymore', function() {
			var now = new Date();

			spyOn(dateService, 'now').and.returnValue(now);

			ajaxSpy.and.callFake(ajaxGetFeedFromFile(FEEDS.WITH_GUID.FILE));
			
			podcastManager.addPodcast(FEEDS.WITH_GUID.URL);

			const episodeId1 = podcastDataService.episodeId(FEEDS.WITH_GUID.EP1);
			const episodeId2 = podcastDataService.episodeId(FEEDS.WITH_GUID.EP2);

			podcastManager.setEpisodeProgress(episodeId1, 60);
			podcastManager.setEpisodeProgress(episodeId2, 120);

			$rootScope.$apply();

			ajaxSpy.and.callFake(ajaxGetFeedFromFile(FEEDS.WITH_GUID.FILE_WITHOUT_1ST_EP));

			podcastManager.updatePodcast();

			var episodesInProgress;
			
			podcastManager.getEpisodesInProgress().then(function(result) {
				episodesInProgress = result;
			});

			$rootScope.$apply();
			
			// I don't care about the order, so I'm sorting
			// before checking the result
			episodesInProgress.sort(function(a, b) {
				return a.episodeUserData.currentTime - b.episodeUserData.currentTime;
			});

			// I'm not sure yet on the contract I want to fullfil besides the
			// currentTime
			expect(episodesInProgress.map(function(item) { return item.episodeUserData.currentTime })).toEqual([
				120
			]);
		});
	});

	describe('checkIsSubscribed', () => {
		it('should return true for the feeds that are subscribed', () => {
			podcastManager.addPodcast(FEEDS.WITHOUT_GUID.URL);
			$rootScope.$apply();

			const message = {
				feeds: [
					FEEDS.WITHOUT_GUID.URL,
					'https://some.other.feed',
				]
			}

			var actualResponse;

			messageService.for('podcastManager').sendMessage('checkIsSubscribed', message, (response) => {
				actualResponse = response;
			});

			const expectedResponse = {};
			expectedResponse[FEEDS.WITHOUT_GUID.URL] = true;
			expectedResponse['https://some.other.feed'] = false;

			expect(actualResponse).toEqual(expectedResponse);
		});
	})
	
	describe('getOpml', () => {
		it('should return a opml with feeds', () => {
			podcastManager.addPodcast(FEEDS.WITHOUT_GUID.URL);
			podcastManager.addPodcast(FEEDS.WITH_GUID.URL);
			podcastManager.addPodcast(FEEDS.WITH_ESCAPED_CHARS.URL);
			$rootScope.$apply();

			const opml = podcastManager.getOpml();
			const expectedOpml = syncGetFeedContent('feeds.opml').response;

			expect(xmlCleanUp(opml)).toBe(xmlCleanUp(expectedOpml));

			function xmlCleanUp(str) {
				return str.replace(new RegExp('(\t|\r|\n)', 'g'), '');
			}
		});
	});
});