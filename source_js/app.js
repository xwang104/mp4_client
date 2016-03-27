var app = angular.module('mp4', ['ngRoute', 'mp4Controllers', 'mp4Services', '720kb.datepicker']);

app.config(['$routeProvider', function($routeProvider) {
  $routeProvider.
  when('/users', {
    templateUrl: 'partials/users.html',
    controller: 'UsersController'
  }).
  when('/adduser', {
    templateUrl: 'partials/addUser.html',
    controller: 'AddUserController'
  }).
  when('/userProfile/:userid', {
    templateUrl: 'partials/userProfile.html',
    controller: 'UserProfileController'
  }).
  when('/tasks', {
    templateUrl: 'partials/tasks.html',
    controller: 'TasksController'
  }).
  when('/addtask', {
    templateUrl: 'partials/addTask.html',
    controller: 'AddTaskController'
  }).
  when('/taskDetail/:taskid', {
    templateUrl: 'partials/taskDetail.html',
    controller: 'TaskDetailController'
  }).
  when('/editTask/:taskid', {
    templateUrl: 'partials/editTask.html',
    controller: 'EditTaskController'
  }).
  when('/settings', {
    templateUrl: 'partials/settings.html',
    controller: 'SettingsController'
  }).
  otherwise({
    redirectTo: '/settings'
  });
}]);

app.run(function($rootScope) {
    $rootScope.$on('$viewContentLoaded', function () {
        $(document).foundation();
    });
});
