myApp.controller('optionsController', ['$scope', '$window', 'messageService', function($scope, $window, messageService) {
	$scope.loaded = false;
	$scope.options = {};
	$scope.options.autoUpdate = true;
	$scope.options.autoUpdateEvery = 60;
	$scope.options.integrateWithScreenShader = true;
	$scope.options.analytics = true;
	$scope.options.s = true;

	$scope.lightningOptions = {};


	$scope.save = function() {
		messageService.for('optionsManager').sendMessage('saveOptions', $scope.options);
		messageService.for('lightningService').sendMessage('saveOptions', $scope.lightningOptions);
	};

	$scope.testLNDConnection = function() {
		messageService.for('lightningService').sendMessage('getBalance', null, (response) => {
			let textMessage = 
			  response.result ? 
			  'Connection to your LND node successful, your channels balance is ' + response.result.balanceInSats + ' satoshis': 
			  'Error trying to connect to your LND node' + (response.data && response.data.error ? ': ' + response.data.error : '');
			
			$window.alert(textMessage);
		});
	}

	$scope.testLNPayConnection = function() {
		messageService.for('lightningService').sendMessage('getBalance', {options: $scope.lightningOptions}, (response) => {
			let textMessage = 
			  response.result ? 
			  'Connection to your LNPay wallet successful, your balance is ' + response.result.balanceInSats + ' satoshis': 
			  'Error trying to connect to your LNPay wallet: ' + response.error.message;
			
			$window.alert(textMessage);
		});
	}

	function readOptions() {
		messageService.for('optionsManager').sendMessage('getOptions', {}, function(options) {
			$scope.$apply(function() {
				$scope.options = options;
			});
		});

		messageService.for('lightningService').sendMessage('getOptions', {}, (lightningOptions) => {
			$scope.$apply(() => $scope.lightningOptions = lightningOptions);
		});
	}

	readOptions();
}]);
