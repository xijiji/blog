var cluster = require('cluster');
var numCPUs = require('os').cpus().length;

if(cluster.isMaster){
  console.log('[master] ' + "start master...");

  for(var i = 0; i < numCPUs; i++){
    cluster.fork();
  }

  cluster.on('listening', function(worker, address){
    console.log('[master] ' + 'listening: worker' + worker.id + ',pid:' + worker.process.pid + ', Address:' + address.address + ":" + address.port);
  });
}else if(cluster.isWorker){
  console.log('[worker] ' + "start worker ..." + cluster.worker.id);
  require('./app.js');
}