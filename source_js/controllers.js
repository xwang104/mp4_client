var mp4Controllers = angular.module('mp4Controllers', []);

mp4Controllers.controller('UsersController', ['$scope', '$http', 'Users', '$window', function($scope, $http, Users, $window) {
  Users.get().success(function(jsonData, statusCode) {
    console.log('The request was successful', statusCode);
    $scope.message = jsonData.message;
    $scope.users = jsonData.data; 
  });

  $scope.deleteUser = function(id) {
    Users.delete(id).success(function(data) {
      console.log(data);
      for(var i = 0; i < $scope.users.length; i++) {
        if ($scope.users[i]._id == id) {
          $scope.users.splice(i, 1);
          break;
        }
      }
    })
  };
}]);

mp4Controllers.controller('AddUserController', ['$scope', '$http', 'Users', '$window', function($scope, $http, Users, $window) {
  $scope.name = "";
  $scope.email = "";
  $scope.addUser = function() {
    var user = JSON.stringify({"name": $scope.name, "email": $scope.email});
    alert(user);
    Users.post(user).success(function(data) {
      console.log(data);
    });
  };
}]);

mp4Controllers.controller('TasksController', ['$scope', '$http', 'Tasks', '$window', function($scope, $http, Tasks, $window) {
  Tasks.get().success(function(jsonData, statusCode) {
    console.log('The request was successful', statusCode);
    $scope.message = jsonData.message;
    $scope.tasks = jsonData.data; 
  });
}]);

/*mp4Controllers.controller('FirstController', ['$scope', 'CommonData'  , function($scope, CommonData) {
  $scope.data = "";
   $scope.displayText = ""

  $scope.setData = function(){
    CommonData.setData($scope.data);
    $scope.displayText = "Data set"

  };

}]);

mp4Controllers.controller('SecondController', ['$scope', 'CommonData' , function($scope, CommonData) {
  $scope.data = "";

  $scope.getData = function(){
    $scope.data = CommonData.getData();

  };

}]);


mp4Controllers.controller('LlamaListController', ['$scope', '$http', 'Llamas', '$window' , function($scope, $http,  Llamas, $window) {

  Llamas.get().success(function(data){
    $scope.llamas = data;
  });


}]); */

mp4Controllers.controller('SettingsController', ['$scope' , '$window' , function($scope, $window) {
  $scope.url = $window.sessionStorage.baseurl;

  $scope.setUrl = function(){
    $window.sessionStorage.baseurl = $scope.url;
    $scope.displayText = "URL set";

  };

}]);
