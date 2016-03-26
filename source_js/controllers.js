var mp4Controllers = angular.module('mp4Controllers', []);

mp4Controllers.controller('UsersController', ['$scope', '$http', 'Users', '$window', function($scope, $http, Users, $window) {
  var query = {select: {"__v": 0, "dateCreated": 0, "pendingTasks": 0}}
  Users.get(query).success(function(jsonData, statusCode) {
    console.log('The request for users was successful', statusCode);
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
  $scope.addedName = "";
  $scope.addUser = function(formValid) {
    if (formValid) {
      var user = JSON.stringify({"name": $scope.name, "email": $scope.email});
      Users.post(user).success(function(data) {
        console.log(data);
        $scope.addedName = $scope.name;
        $('#addUserFailed').hide();
        $('#addUserSuccess').show();
      })
      .error(function(data) {
        console.log(data);
        $('#addUserSuccess').hide();
        $('#addUserFailed').show();
      });
    }
  };
}]);

mp4Controllers.controller('UserProfileController', ['$scope', '$http', 'Users', 'Tasks', '$window', '$routeParams', function($scope, $http, Users, Tasks, $window, $routeParams) {
  $scope.userid = $routeParams.userid;
  Users.get($scope.userid).success(function(jsonData, statusCode) {
    console.log('The request for user was successful', statusCode);
    $scope.message = jsonData.message;
    $scope.user = jsonData.data; 
    Tasks.get({where: {"assignedUserName": $scope.user.name, "completed": false}}).success(function(jsonData, statusCode) {
      console.log('The request for pendingTasks was successful', statusCode);
      $scope.message = jsonData.message;
      $scope.pendingTasks = jsonData.data; 
    });
  });

  $scope.showCompTasks = function() {
    Tasks.get({where: {"assignedUserName": $scope.user.name, "completed": true}}).success(function(jsonData, statusCode) {
      console.log('The request for pendingTasks was successful', statusCode);
      $scope.message = jsonData.message;
      $scope.completedTasks = jsonData.data; 
    });
  }

  $scope.completeTask = function(id) {
    for(var i = 0; i < $scope.pendingTasks.length; i++) {
      if ($scope.pendingTasks[i]._id == id) {
        var taskDone = $scope.pendingTasks[i];
        $scope.pendingTasks.splice(i, 1);
        $scope.completedTasks.push(taskDone);
        taskDone.completed = true;
        Tasks.put(taskDone).success(function(data) {
          console.log(data);
        });
        break;
      }
    }
  }
}]);

mp4Controllers.controller('TasksController', ['$scope', '$http', 'Tasks', '$window', function($scope, $http, Tasks, $window) {
  $scope.taskPage = 0;
  $scope.select = {taskStatus: "pending", sortBy: "dateCreated", reverse: "false"};
  $scope.getTasks = function(start) {
    var query = {skip: start, limit: 10, select:{"description": 0, "deadline": 0, "completed": 0, "assignedUser": 0, "dateCreated": 0, "__v": 0}};
    if ($scope.select.taskStatus === "pending") {
      query.where = {"completed": false};
    }
    else if ($scope.select.taskStatus === "completed") {
      query.where = {"completed": true};
    }
    query.sort = {};
    if ($scope.select.reverse === "false") {
      query.sort[$scope.select.sortBy] = 1
    }
    else {
      query.sort[$scope.select.sortBy] = -1
    }
    Tasks.get(query).success(function(jsonData, statusCode) {
      console.log('The request for tasks was successful', statusCode);
      $scope.message = jsonData.message;
      $scope.tasks = jsonData.data; 
    });
  }

  $scope.getTasks($scope.taskPage);

  $scope.loadPre = function() {
    $scope.taskPage -= 10;
    $scope.getTasks($scope.taskPage);
  }

  $scope.loadNext = function() {
    $scope.taskPage += 10;
    $scope.getTasks($scope.taskPage);
  }

  $scope.loadfiltered = function() {
    $scope.taskPage =0;
    $scope.getTasks($scope.taskPage);
  }

  $scope.deleteTask = function(id) {
    Tasks.delete(id).success(function(data) {
      console.log(data);
      for(var i = 0; i < $scope.tasks.length; i++) {
        if ($scope.tasks[i]._id == id) {
          $scope.tasks.splice(i, 1);
          break;
        }
      }
    })
  };


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
