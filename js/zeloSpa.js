//angular.module('zeloApp', ['ngMaterial']);
angular.module('myApp', ['ngMaterial', 'ngMessages', 'cl.paging']).controller('ProductController', ['$scope', '$mdMedia', 'APIService', '$q', '$mdDialog', '$window', '$rootScope', function($scope, $mdMedia, APIService, $q, $mdDialog, $window, $rootScope) {
	var self = this;

    //binding at window for dev work
	$window.ProductController = this;
	$scope.$mdMedia = $mdMedia;
	self.deferred = undefined;
	self.flickerRecentPics = [];
	self.currentPage = 0;
	$scope.status = '  ';
	self.customFullscreen = true;
	self.paging = {};
	//initializing
	self.init = (page) => {
	    self.deferred = $q.defer();
		//flicker service call
		APIService.flickerBox.getRecentPhotos(page).success(function(data) {
			self.deferred.resolve(data);
		}).error(function(data) {
			//console.log(data);
			self.deferred.rejeect(data);
		})
		//promise resolve
		self.deferred.promise.then(function(data) {
			//console.log(data);
			self.flickerRecentPics = data.photos.photo;
			self.paging = {
				total: data.photos.pages,
				current: data.photos.page,
				onPageChanged: self.loadPages,
			}
		})
	}
	self.init();

	self.loadPages = () => {
		$rootScope.currentPage = self.paging.current;
		//console.log(self.paging.current);
		self.init(self.paging.current);
	}
	self.showAdvanced = (ev, it) => {
        if(it){
            $mdDialog.show({
                    controller: function DialogController($scope, $mdDialog) {
                        $scope.modalData = it;
                        $scope.close = () => {$mdDialog.hide();}
                    },
                    templateUrl: 'dialog1.tmpl.html',
                    parent: angular.element(document.body),
                    targetEvent: ev,
                    clickOutsideToClose: true,
                    fullscreen: self.customFullscreen,
                })
        }
		
	}

}]).service("APIService", ['$http', '$q', '$window', '$rootScope', function($http, $q, $window, $rootScope) {
	var self = this;
	$window.APIService = this;
	self.perPage = 100;
    //c4ee68610c67e6e43e256017618db2c0 flicker api-key
    //0b586f88fabc0835 -- secret
	self.api_key = "c4ee68610c67e6e43e256017618db2c0";
	self.base_url = "https://api.flickr.com/services/rest/";
	var obj = {
		api_key: self.api_key,
		per_page: self.perPage,
		format: 'json',
		nojsoncallback: 1,
		page: ($rootScope.currentPage != null && $rootScope.currentPage > 0) ? $rootScope.currentPage: 1,
		extras: 'owner_name,date_upload,date_taken',
		method: 'flickr.photos.getRecent'
	};

	self.flickerBox = {
		"getRecentPhotos": function(page) {
			return $http({
				method: 'GET',
				url: self.base_url,
				params: (function() {
				    //console.log( obj, page ) ;
				    if(page) obj.page = page; // +1;
				    return obj;
				})()
			}).success(function(data) {
				//console.log(data);
			}).error(function(data) {
				//console.log(data);
			})

		},
	}
	//can call more api for flicker library future use.
}]).filter('ellipsise', function() {
	return function(s, limitLength) {
		limitLength = limitLength || 25;
		if (s && s.length > limitLength) {
			return s.substring(0, limitLength) + '...';
		} else {
			return s;
		}
	}
});

