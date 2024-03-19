const grpc = require('grpc');
// you have to compile protobuf to js or any other language
const protoLoader = require('@grpc/proto-loader');
// you can also use async
const packageDef = protoLoader.loadSync('todo.proto', {});
const grpcObject = grpc.loadPackageDefinition(packageDef);

// and finally todo package
const todoPackage = grpcObject.todoPackage;

const server = new grpc.Server();
// you can bind it to localhost
// grpc is build on top of http2 which is by default secure , but grpc allows to create insecure channel , you can also try ssl
server.bind('0.0.0.0:4000', grpc.ServerCredentials.createInsecure());

// now this server have no idea about your service
// you have to add service and second parameter is json object for mapping of your function
server.addService(todoPackage.Todo.service, {
  createTodo,
  readTodos,
  readTodosStream,
});
server.start();
const todos = [];
// callback is the function that client will be listening to
function createTodo(call, callback) {
  //   console.log(call);
  const todoItem = {
    id: todos.length + 1,
    text: call.request.text,
  };
  todos.push(todoItem);
  callback(null, todoItem);
}

function readTodos(_, callback) {
  console.log(todos);
  callback(null, {
    items: todos,
  });
}

function readTodosStream(call, callback) {
  todos.forEach((t) => call.write(t));
  call.end();
}
