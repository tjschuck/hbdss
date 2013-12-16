var animate = window.requestAnimationFrame ||
  window.webkitRequestAnimationFrame ||
  window.mozRequestAnimationFrame ||
  function(callback) { window.setTimeout(callback, 1000/60) };

var canvas = document.createElement('canvas');
var width = 600;
var height = 600;
canvas.width = width;
canvas.height = height;
var context = canvas.getContext('2d');

var scott = new Scott();
var gameObjects = [scott];
var new_phone_timer = 0;

// images
var background;
var scott_left;
var scott_right;


var keysDown = {};

var step = function(timestamp) {
  var delta = timestamp - (this._lastTimestamp || timestamp);

  update(delta);
  render();

  this._lastTimestamp = timestamp;

  animate(step);
};

var update = function(delta) {
  new_phone_timer += delta;

  if (new_phone_timer > 500) {
    new_phone_timer = 0;
    if (random_between(1, 8) == 1) {
      gameObjects.push(new Android());
    } else {
      gameObjects.push(new iPhone());
    }
  }

  for (i = 0; i < gameObjects.length; i++) {
    gameObjects[i].update();
  }
};

var render = function() {
  context.drawImage(background, 0, 0);

  for (i = 0; i < gameObjects.length; i++) {
    gameObjects[i].render();
  }
};

var random_between = function (min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}




function Scott() {
  this.width = 50;
  this.height = 50;
  this.x = 200;
  this.y = height - this.height;
  this.x_speed = 0;
  this.y_speed = 0;
}

Scott.prototype.overlapping = function(device) {
  var phone = device.phone;

  var scott_left = this.x;
  var scott_right = this.x + this.width;
  var scott_top = this.y;
  var scott_bottom = this.y + this.height;

  var phone_left = phone.x;
  var phone_right = phone.x + phone.width;
  var phone_top = phone.y;
  var phone_bottom = phone.y + phone.height;

  if (scott_top > phone_bottom) { return false; }
  if (scott_bottom < phone_top) { return false; }
  if (scott_left > phone_right) { return false; }
  if (scott_right < phone_left) { return false; }

  if (phone_left > scott_left && phone_left < scott_right) { return true; }
  if (phone_right > scott_left && phone_right < scott_right) { return true; }
  if (phone_top > scott_top && phone_top < scott_bottom) { return true; }
  if (phone_bottom > scott_top && phone_bottom < scott_bottom) { return true; }

  return false;
};

Scott.prototype.render = function() {
  context.fillStyle = "#0000FF";
  context.fillRect(this.x, this.y, this.width, this.height);
};

Scott.prototype.move = function(x, y) {
  this.x += x;
  this.y += y;
  this.x_speed = x;
  this.y_speed = y;
  if (this.x < 0) {
    this.x = 0;
    this.x_speed = 0;
  } else if (this.x + this.width > width) {
    this.x = width - this.width;
    this.x_speed = 0;
  }

  if (this.y > height - this.height) {
    this.y = height - this.height;
  };
};

Scott.prototype.update = function() {
  for (var key in keysDown) {
    var value = Number(key);
    if (value == 37) {
      this.move(-4, 0);
    } else if (value == 39) {
      this.move(4, 0);
    } else {
      this.move(0, 0);
    }
  }
};




function Phone() {
  this.width = 50;
  this.height = 100;
  this.x = random_between(0, width - this.width);
  this.y = 0 - height;
  this.y_speed = random_between(1, 8);
}

Phone.prototype.render = function(image) {
  context.drawImage(this.image, this.x, this.y, this.width, this.height);
};

Phone.prototype.move = function() {
  this.y += this.y_speed;
  if (this.y > height) {
    this.destroy();
  }
};

Phone.prototype.update = function() {
  this.move();
};

Phone.prototype.destroy = function() {
  this.x = width * 2;
  this.y = height * 2;
  this.y_speed = 0;
}


function iPhone() {
  this.phone = new Phone();
  this.phone.image = document.getElementById("iphone");
}

iPhone.prototype.render = function() {
  this.phone.render();
};

iPhone.prototype.update = function() {
  this.phone.update();
  if (scott.overlapping(this)) {
    this.phone.destroy();
    scott.move(0, 25);
  };
};


function Android() {
  this.phone = new Phone();
  this.phone.image = document.getElementById("android");
}

Android.prototype.render = function() {
  this.phone.render();
};

Android.prototype.update = function() {
  this.phone.update();
  if (scott.overlapping(this)) {
    this.phone.destroy();
    scott.move(0, -50);
  };
};





window.onload = function() {
  background = document.getElementById("ice-cliff");
  scott_right = document.getElementById("scott-right-sprite");
  scott_left = document.getElementById("scott-left-sprite");
  document.body.appendChild(canvas);
  animate(step);
};

window.addEventListener("keydown", function (event) {
  keysDown[event.keyCode] = true;
});

window.addEventListener("keyup", function (event) {
  delete keysDown[event.keyCode];
});

