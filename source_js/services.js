var mp4Services = angular.module('mp4Services', []);

mp4Services.factory('CommonData', function(){
    var data = "";
    return{
        getData : function(){
            return data;
        },
        setData : function(newData){
            data = newData;
        }
    }
});

mp4Services.factory('Users', function($http, $window) {
    return {
        get : function(query) {
            var baseUrl = $window.sessionStorage.baseurl;
            if (query === undefined) {
                return $http.get(baseUrl + '/api/users');
            }
            else if (typeof(query) === "string") {
                return $http.get(baseUrl + '/api/users/' + query);
            }
            else {
                return $http.get(baseUrl + '/api/users', {params: query});
            }
        },
        post : function(user) {
            var baseUrl = $window.sessionStorage.baseurl;
            return $http.post(baseUrl + '/api/users', user);
        },
        put : function(user) {
            var baseUrl = $window.sessionStorage.baseurl;
            return $http.put(baseUrl + '/api/users/' + user._id, user);
        },
        delete : function(id) {
            var baseUrl = $window.sessionStorage.baseurl;
            return $http.delete(baseUrl + '/api/users/' + id);
        }
    }
});

mp4Services.factory('Tasks', function($http, $window) {
    return {
        get : function(query) {
            var baseUrl = $window.sessionStorage.baseurl;
            if (query === undefined) {
                return $http.get(baseUrl+'/api/tasks');
            }
            else if (typeof(query) === "string") {
                return $http.get(baseUrl + '/api/tasks/' + query);
            }
            else {
                return $http.get(baseUrl + '/api/tasks', {params: query});
            }
        },
        post : function(task) {
            var baseUrl = $window.sessionStorage.baseurl;
            return $http.post(baseUrl + '/api/tasks', task);
        },
        put : function(task) {
            var baseUrl = $window.sessionStorage.baseurl;
            return $http.put(baseUrl + '/api/tasks/' + task._id, task);
        },
        delete : function(id) {
            var baseUrl = $window.sessionStorage.baseurl;
            return $http.delete(baseUrl + '/api/tasks/' + id);
        }
    }
});