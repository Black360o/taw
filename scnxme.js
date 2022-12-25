<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Maintenance</title>
    <noscript>
      <meta http-equiv="refresh" content="1">
    </noscript>
    <style>
      * {
        box-sizing: border-box;
      }

      body {
        background-color: white;
        font-family: "Benton Sans", "Helvetica Neue", helvetica, arial, sans-serif;
      }

      main {
        padding: 1rem;
      }

      p {
        max-width: 500px
      }

      .note{
        font-size: small;
        color: #9B9B9B;
      }

      .content{
        margin: 50px;
        position: fixed;
      }

      #loader:after {
        overflow: hidden;
        display: inline-block;
        vertical-align: bottom;
        animation: ellipsis steps(4,end) 1000ms infinite;
        content: "\2026";
        width: 0px;
      }

      @keyframes ellipsis {
        to {
          width: 1.25em
        }
      }

      canvas#background {
        position: fixed;
        height: 100%;
        width: 100%;
        top: 0;
        left: 0;
        z-index: -1;
      }
    </style>
  </head>

  <body>
    <main>
      <div class="content">
        <p class="status">
          <span id="message">Waking up</span>
          <span id="loader"></span>
        </p>
        <p class="note">
          To keep Glitch fast for everyone, inactive projects go to sleep and wake up on request.
        </p>
      </div>
    </main>
    <canvas id="background">

<script src="bowser.min.js"></script>

<script>
// drawing

var canvas, context, canvasImage;

var cursorPosition = {
  x: undefined,
  y: undefined,
};
var color = '#e5e5e5';
var size = 30;

function randomColor() {
  var colors = [
    '#fcd1c4',
    '#abfcec',
    '#a3d9e1',
    '#fbbfff',
    '#a9ef8f',
    '#fff0b2',
    '#fff0b2',
  ];
  color = colors[Math.floor(Math.random() * colors.length)];
}

function throttle(ms, fn) {
  var lastCallTime;
  return function () {
    var now = Date.now();
    if (!lastCallTime || now - lastCallTime > ms) {
      lastCallTime = now;
      fn.apply(this, arguments);
    }
  }
}

function drawCircle(event) {
  context.beginPath();
  context.arc(cursorPosition.x, cursorPosition.y, size, 0, 2 * Math.PI);
  context.closePath();
  context.fillStyle = color;
  context.fill();
  canvasImage = context.getImageData(0, 0, window.innerWidth, window.innerHeight);
}

window.onload = function () {
  randomColor();
  canvas = document.getElementById('background');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  context = canvas.getContext('2d');

  window.onresize = throttle(100, function () {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    context.clearRect(0,0, window.innerWidth, window.innerHeight);
    canvasImage && context.putImageData(canvasImage, 0, 0);
  });

  window.onmousemove = throttle(10, function (event) {
    cursorPosition = {
      x: event.clientX,
      y: event.clientY,
    };
    drawCircle(event);
  });

  window.ontouchmove = throttle(10, function (event) {
    cursorPosition = {
      x: event.touches[0].clientX,
      y: event.touches[0].clientY,
    };
    drawCircle(event);
  });
}
</script>

<script>
// container status updates
setTimeout(function () {
  function reloadAfterDelay(delay) {
    delay = delay || 1000;
    return setTimeout(function () {
      window.location.reload(true);
    }, delay);
  }
  try {
    var isValidBrowser = bowser.check({
      ios: "7",
      msie: "10",
      android: "4.4",
      chrome: "16",
      firefox: "11",
    });

    if (!isValidBrowser) {
      throw new Error("Jump to refresh");
    }

    var initialReloadHandler = reloadAfterDelay(5000);

    var ws = new WebSocket("wss://" + document.location.hostname + "/___glitch_loading_status___");
    ws.onmessage = updateContainerStatus;
    ws.onerror = reloadAfterDelay;
    ws.onopen = function () {
      clearTimeout(initialReloadHandler);
      setInterval(function () {
        ws.send("keepalive");
      }, 15000);
    };
    ws.onclose = function () {
      reloadAfterDelay(1000);
    };

    function updateContainerStatus(event) {
      try {
        var data = JSON.parse(event.data);
        var message = document.getElementById('message')
        var text = "";
        switch (data.text) {
          case "initialize":
            text = "Waking up";
            break;
          case "install":
            text = "Preparing";
            break;
          case "restart":
            text = "Starting";
            break;
          case "listening":
            text = "Ready";
            break;
          default:
            return;
        }
        message.innerHTML = text;
        document.title = text + " ･ﾟ✧";

        if (data.text === 'listening') {
          window.location.reload(true);
        }
      } catch (e) {
        reloadAfterDelay();
      }
    }
  } catch (e) {
    reloadAfterDelay();
  }
}, 0);
</script>
  </canvas></body>
</html>
