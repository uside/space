var server = require('http').createServer(),
  io = require('socket.io').listen(server),
  entities = require('./entities.js'),
  geometry = require('./geometry.js');

// computing loop
setInterval(function() {
  // console.log(entities.entities);
  entities.entities.forEach(function(entity) {
    if (entity.mainScene) {
      if (entity instanceof entities.Ship) {
        if (entity.engine && entity.shell) {
          if (entity.left) {
            entity.angle -= 0.1;
          }

          if (entity.right) {
            entity.angle += 0.1;
          }

          if (entity.up) {
            var angle = entity.angle % (2 * Math.PI);

            var deltas = geometry.polarToRect(3, angle);

            entity.x += deltas[0];
            entity.y -= deltas[1];
          }
        }
      }
    }
  });

  io.sockets.emit('sync', entities.entities);
}, 20);

io.sockets.on('connection', function(socket) {
  var ship = new entities.Ship();
  ship.init();

  ship.scale = 0.5;

  setInterval(function() {
    socket.emit('base unit', ship.id);
  }, 1000);

  // create body for ship
  var body = new entities.Shell();
  body.init();

  body.weight = 300;
  body.price = 3;

  ship.shell = body;

  // create engine for ship
  var engine = new entities.Engine();
  engine.init();

  engine.weight = 30;
  engine.price = 3;
  engine.acceleration = 1;
  engine.speed = 5;

  ship.engine = engine;

  socket.on('up:enabled', function() {
    console.log(ship);
    ship.up = true;
  });

  socket.on('up:disabled', function() {
    ship.up = false;
  });

  socket.on('left:enabled', function() {
    ship.left = true;
  });

  socket.on('left:disabled', function() {
    ship.left = false;
  });

  socket.on('right:enabled', function() {
    ship.right = true;
  });

  socket.on('right:disabled', function() {
    ship.right = false;
  });

  socket.on('disconnect', function() {
    console.log('disconnected');

    ship.destroy();
  });
});

server.listen(4000);
