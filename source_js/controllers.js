var mp4Controllers = angular.module('mp4Controllers', []);

mp4Controllers.controller('UsersController', ['$scope', '$http', 'Users', 'Tasks', '$window', function($scope, $http, Users, Tasks, $window) {
  //get all users
  var query = {select: {"__v": 0, "dateCreated": 0, "pendingTasks": 0}}
  Users.get(query).success(function(jsonData, statusCode) {
    console.log('The request for users was successful', statusCode);
    $scope.message = jsonData.message;
    $scope.users = jsonData.data; 
  })
  .error(function(jsonData, statusCode) {
    console.log('get users failed', statusCode);
    alert(jsonData.message);
  });

  //delete a user
  $scope.deleteUser = function(id) {
    Users.delete(id).success(function(jsonData, statusCode) {
      console.log('The request for deleting user was successful', statusCode);
      console.log(jsonData.data);
      //delete that user from front end
      for(var i = 0; i < $scope.users.length; i++) {
        if ($scope.users[i]._id == id) {
          var tmpUser = $scope.users[i];
          $scope.users.splice(i, 1);
          break;
        }
      }

      //change the user's assigned task to unassigned; should change the implementation when I have my own backend
      Tasks.get({where: {"assignedUser": tmpUser._id,"completed": false}}).success(function(jsonData, statusCode) {
        console.log('The request for tasks that should be updated to unassigned was successful', statusCode);
        $scope.message = jsonData.message;
        $scope.updateTasks = jsonData.data;
        for(var i = 0; i < $scope.updateTasks.length; i++) {
          $scope.updateTasks[i].assignedUser = "";
          $scope.updateTasks[i].assignedUserName = "unassigned";
          Tasks.put($scope.updateTasks[i]).success(function(data) {
            console.log(data);
          })
          .error(function(jsonData, statusCode) {
            console.log('update task failed', statusCode);
            alert(jsonData.message);
          });
        } 
      })
      .error(function(jsonData, statusCode) {
        console.log('get tasks failed', statusCode);
        alert(jsonData.message);
      });

    })
    .error(function(jsonData, statusCode) {
      console.log('delete user failed', statusCode);
      alert(jsonData.message);
    });

  };
}]);

mp4Controllers.controller('AddUserController', ['$scope', '$http', 'Users', '$window', function($scope, $http, Users, $window) {
  $scope.name = "";
  $scope.email = "";
  $scope.addedName = "";
  //add a new user
  $scope.addUser = function(formValid) {
    if (formValid) {
      var user = {"name": $scope.name, "email": $scope.email};
      Users.post(user).success(function(jsonData, statusCode) {
        console.log('The request for adding a user was successful', statusCode);
        $scope.message = jsonData.message;
        $scope.addedName = $scope.name;
        $('#addUserFailed').hide();
        $('#addUserSuccess').show();
      })
      .error(function(jsonData, statusCode) {
        console.log('add user failed', statusCode);
        $scope.message = jsonData.message;
        $('#addUserSuccess').hide();
        $('#addUserFailed').show();
      });
    }
  };
}]);

mp4Controllers.controller('UserProfileController', ['$scope', '$http', 'Users', 'Tasks', '$window', '$routeParams', function($scope, $http, Users, Tasks, $window, $routeParams) {
  $scope.userid = $routeParams.userid;
  //get single user's info
  Users.get($scope.userid).success(function(jsonData, statusCode) {
    console.log('The request for user was successful', statusCode);
    $scope.message = jsonData.message;
    $scope.user = jsonData.data; 
    //get his pending tasks; should change the implementation later
    Tasks.get({where: {"assignedUserName": $scope.user.name, "completed": false}}).success(function(jsonData, statusCode) {
      console.log('The request for pendingTasks was successful', statusCode);
      $scope.message = jsonData.message;
      $scope.pendingTasks = jsonData.data; 
    })
    .error(function(jsonData, statusCode) {
      console.log('get pendingTasks failed', statusCode);
      alert(jsonData.message);
    });
  })
  .error(function(jsonData, statusCode) {
    console.log('get user failed', statusCode);
    alert(jsonData.message);
  });
  //get his completed tasks
  $scope.showCompTasks = function() {
    Tasks.get({where: {"assignedUserName": $scope.user.name, "completed": true}}).success(function(jsonData, statusCode) {
      console.log('The request for completed tasks was successful', statusCode);
      $scope.message = jsonData.message;
      $scope.completedTasks = jsonData.data; 
    })
    .error(function(jsonData, statusCode) {
      console.log('get completed tasks failed', statusCode);
      alert(jsonData.message);
    });
  }
  //mark a task as completed
  $scope.completeTask = function(id) {
    //find the the task from pendingTasks list
    for(var i = 0; i < $scope.pendingTasks.length; i++) {
      if ($scope.pendingTasks[i]._id == id) {
        var taskDone = $scope.pendingTasks[i];
        $scope.pendingTasks.splice(i, 1);
        taskDone.completed = true;
        //add it to completed tasks list if it was retrieved
        if ($scope.completedTasks !== undefined) {
          $scope.completedTasks.push(taskDone);
        }
        //update the pendingTasks of the user
        var index = $scope.user.pendingTasks.indexOf(id);
        if (index > -1) {
          $scope.user.pendingTasks.splice(index, 1);
          //update the user in backend
          Users.put($scope.user).success(function(jsonData, statusCode) {
            console.log('The request for updating the users pendingTasks was successful', statusCode);
          })
          .error(function(jsonData, statusCode) {
            console.log('update users pendingTasks failed', statusCode);
            alert(jsonData.message);
          });
        }
        //update the task in backend
        Tasks.put(taskDone).success(function(jsonData, statusCode) {
          console.log('The task was marked as completed', statusCode);
        })
        .error(function(jsonData, statusCode) {
          console.log('mark task completed failed', statusCode);
          alert(jsonData.message);
        });
        break;
      }
    }
  }
}]);

mp4Controllers.controller('TasksController', ['$scope', '$http', 'Tasks', 'Users', '$window', function($scope, $http, Tasks, Users, $window) {
  $scope.taskPage = 0;
  $scope.select = {taskStatus: "pending", sortBy: "dateCreated", reverse: "false"};
  //get tasks according to filter conditions
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
    //get desired tasks
    Tasks.get(query).success(function(jsonData, statusCode) {
      console.log('The request for tasks was successful', statusCode);
      $scope.message = jsonData.message;
      $scope.tasks = jsonData.data; 
    })
    .error(function(jsonData, statusCode) {
      console.log('get tasks failed', statusCode);
      alert(jsonData.message);
    });
  }
  //load tasks initially
  $scope.getTasks($scope.taskPage);
  //previous button
  $scope.loadPre = function() {
    $scope.taskPage -= 10;
    $scope.getTasks($scope.taskPage);
  }
  //next button
  $scope.loadNext = function() {
    $scope.taskPage += 10;
    $scope.getTasks($scope.taskPage);
  }
  //update tasks whenever filter condition changes
  $scope.loadfiltered = function() {
    $scope.taskPage =0;
    $scope.getTasks($scope.taskPage);
  }
  //delete a task
  $scope.deleteTask = function(id) {
    //get the task before delete in order to find the assignedUser
    Tasks.get(id).success(function(jsonData, statusCode) {
      console.log('The request for getting the task was successful', statusCode);
      $scope.task = jsonData.data;
    })
    .error(function(jsonData, statusCode) {
      console.log('get task before deletion failed', statusCode);
      alert(jsonData.message);
    });   
    Tasks.delete(id).success(function(jsonData, statusCode) {
      console.log('The request for deleting the task was successful', statusCode);
      //reload tasks
      $scope.getTasks($scope.taskPage);
      //update the assignedUser
      if ($scope.task.assignedUser !== "") {
        Users.get($scope.task.assignedUser).success(function(jsonData, statusCode) {
          console.log('The request for getting the assignedUser of the task was successful', statusCode);
          $scope.user = jsonData.data;
          var index = $scope.user.pendingTasks.indexOf(id);
          if (index > -1) {
            $scope.user.pendingTasks.splice(index, 1);
            //update assignedUser's pendingTasks
            Users.put($scope.user).success(function(jsonData, statusCode) {
              console.log('The pendingTasks of assignedUser is updated', statusCode);
            })
            .error(function(jsonData, statusCode) {
              console.log('update users pendingTasks failed', statusCode);
              alert(jsonData.message);
            });
          }
        })
        .error(function(jsonData, statusCode) {
          console.log('get the assignedUser of the task failed', statusCode);
          alert(jsonData.message);
        });
      }
    })
    .error(function(jsonData, statusCode) {
      console.log('delete task failed', statusCode);
      alert(jsonData.message);
    });
  };

}]);

mp4Controllers.controller('AddTaskController', ['$scope', '$http', 'Tasks', "Users", '$window', function($scope, $http, Tasks, Users, $window) {
  $scope.name = "";
  $scope.description = "";
  $scope.deadline = "";
  $scope.data = {
    selectedOption: {"_id": "", "name": "unassigned"}
  }
  $scope.addedTaskName = "";
  //get all users as options for select assignedUser
  var query = {select: {"__v": 0, "dateCreated": 0, "pendingTasks": 0, "email": 0}}
  Users.get(query).success(function(jsonData, statusCode) {
    console.log('The request for users was successful', statusCode);
    $scope.message = jsonData.message;
    $scope.users = jsonData.data; 
    $scope.data.availableOptions= $scope.users;
  })
  .error(function(jsonData, statusCode) {
    console.log('get users failed', statusCode);
    alert(jsonData.message);
  });
  //add a new task
  $scope.addTask = function(formValid) {
    if (formValid) {
      var task = {"name": $scope.name, "description": $scope.description, "deadline": $scope.deadline, "assignedUser": $scope.data.selectedOption._id, "assignedUserName": $scope.data.selectedOption.name};
      Tasks.post(task).success(function(jsonData, statusCode) {
        console.log('The request for adding a new task was successful', statusCode);
        //get all info of the new task
        task = jsonData.data;
        //for front end message
        $scope.message = jsonData.message
        $scope.addedTaskName = $scope.name;
        $('#addTaskFailed').hide();
        $('#addTaskSuccess').show();
        //update user's pendingTasks list
        if (task.assignedUser !== "") {
          Users.get(task.assignedUser).success(function(jsonData, statusCode) {
            console.log('The request for assignedUser was successful', statusCode);
            $scope.message = jsonData.message;
            $scope.assignedUser = jsonData.data; 
            $scope.assignedUser.pendingTasks.push(task._id);
            Users.put($scope.assignedUser).success(function(jsonData, statusCode) {
              console.log('The pendingTasks of assignedUser is updated', statusCode);
            })
            .error(function(jsonData, statusCode) {
              console.log('update users pendingTasks failed', statusCode);
              alert(jsonData.message);
            });
          })
          .error(function(jsonData, statusCode) {
            console.log('get the assignedUser of the task failed', statusCode);
            alert(jsonData.message);
          });
        }
      })
      .error(function(jsonData, statusCode) {
        console.log('add new task failed', statusCode);
        $scope.message = jsonData.message
        $('#addTaskSuccess').hide();
        $('#addTaskFailed').show();
      });
    }
  };
}]);

mp4Controllers.controller('TaskDetailController', ['$scope', '$http', 'Tasks', '$window', '$routeParams', function($scope, $http, Tasks, $window, $routeParams) {
  $scope.taskid = $routeParams.taskid;
  //get single task's info
  Tasks.get($scope.taskid).success(function(jsonData, statusCode) {
    console.log('The request for task was successful', statusCode);
    $scope.message = jsonData.message;
    $scope.task = jsonData.data; 
  })
  .error(function(jsonData, statusCode) {
    console.log('get task failed', statusCode);
    alert(jsonData.message);
  });
}]);

mp4Controllers.controller('EditTaskController', ['$scope', '$http', 'Tasks', "Users", '$window', '$routeParams', function($scope, $http, Tasks, Users, $window, $routeParams) {
  $scope.taskid = $routeParams.taskid;
  $scope.data = {};
  $scope.editTaskName = "";
  //get the task's info
  Tasks.get($scope.taskid).success(function(jsonData, statusCode) {
    console.log('The request for task was successful', statusCode);
    $scope.message = jsonData.message;
    $scope.task = jsonData.data;
    $scope.data.selectedOption = {"_id": $scope.task.assignedUser, "name": $scope.task.assignedUserName}
  })
  .error(function(jsonData, statusCode) {
    console.log('get task failed', statusCode);
    alert(jsonData.message);
  });
  //get all users as options for select assignedUser
  var query = {select: {"__v": 0, "dateCreated": 0, "pendingTasks": 0, "email": 0}}
  Users.get(query).success(function(jsonData, statusCode) {
    console.log('The request for users was successful', statusCode);
    $scope.message = jsonData.message;
    $scope.users = jsonData.data; 
    $scope.data.availableOptions = $scope.users;
  });
  //edit task

  $scope.rmFromPendingTasks = function(oldUser, taskid) {
    Users.get(oldUser).success(function(jsonData, statusCode) {
      console.log('get oldUser success', statusCode);
      $scope.oldAssignedUser = jsonData.data;
      var index = $scope.oldAssignedUser.pendingTasks.indexOf(taskid);
      if (index > -1) {
        $scope.oldAssignedUser.pendingTasks.splice(index, 1);
        //update old user
        Users.put($scope.oldAssignedUser).success(function(jsonData, statusCode) {
          console.log('update oldUser success', statusCode);
        })
        .error(function(jsonData, statusCode) {
          console.log('update users pendingTasks failed', statusCode);
          alert(jsonData.message);
        });
      }
    })
    .error(function(jsonData, statusCode) {
      console.log('get user failed', statusCode);
      alert(jsonData.message);
    });
  };

  $scope.addToPendingTasks = function(newUser, taskid) {
    Users.get(newUser).success(function(jsonData, statusCode) {
      console.log('get newUser success', statusCode);
      $scope.newAssignedUser = jsonData.data;
      var index = $scope.newAssignedUser.pendingTasks.indexOf($scope.task._id);
      if (index === -1) {
        $scope.newAssignedUser.pendingTasks.push(taskid);
        //update new user
        Users.put($scope.newAssignedUser).success(function(jsonData, statusCode) {
          console.log('update newUser success', statusCode);
        })
        .error(function(jsonData, statusCode) {
          console.log('update users pendingTasks failed', statusCode);
          alert(jsonData.message);
        });
      }
    })
    .error(function(jsonData, statusCode) {
      console.log('get user failed', statusCode);
      alert(jsonData.message);
    });
  };

  $scope.editTask = function(formValid) {
    if (formValid) {
      var newStatus = $scope.task.completed;
      var oldUser = $scope.task.assignedUser;
      var newUser = $scope.data.selectedOption._id;
      $scope.task.assignedUser = $scope.data.selectedOption._id;
      $scope.task.assignedUserName = $scope.data.selectedOption.name;
      Tasks.put($scope.task).success(function(data) {
        console.log(data);
        $scope.editTaskName = $scope.task.name;
        $('#editTaskFailed').hide();
        $('#editTaskSuccess').show();
        //update user's pendingTask list
        if (newStatus === false) {
          $scope.rmFromPendingTasks(oldUser, $scope.task._id);
          $scope.addToPendingTasks(newUser, $scope.task._id);
        }
        else if (newStatus === true) {
          $scope.rmFromPendingTasks(newUser, $scope.task._id);
          $scope.rmFromPendingTasks(oldUser, $scope.task._id);          
        }        
      })
      .error(function(jsonData, statusCode) {
        console.log('edit task was failed', statusCode);
        $scope.message = jsonData.message;
        $('#editTaskSuccess').hide();
        $('#editTaskFailed').show();
      });
    }
  };
}]);


mp4Controllers.controller('SettingsController', ['$scope' , '$window' , function($scope, $window) {
  $scope.url = $window.sessionStorage.baseurl;

  $scope.setUrl = function(){
    $window.sessionStorage.baseurl = $scope.url;
    $scope.displayText = "URL set";

  };

}]);
