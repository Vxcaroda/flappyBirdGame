// Define global variables
const startButton = document.getElementById("start-button");
var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
var highScoreList = document.getElementById("high-score-list");
var lastPipeX = 0;
var minPipeGap = 300;
var pipes = [];
var score = 0;
var gameOver = false;
var birdImg = new Image();
canvas.width = 1000;
canvas.height = 760;
birdImg.src = "bird.png";
var backgroundImg = new Image();
backgroundImg.src = "background_space.jpg";
var highScores = [];
var coins = [];
var coinInterval = 3000; // Generate a new coin every 3 seconds on average
var coinLastGenerated = 0;
var scrollSpeed = 2;
var lives = 1;
var gapHeight = 200;
gravity = 0.2;
scoreMultiplier = 1;
let coinEffect= "None";

// Define functions
var bird = {
  x: 400,
  y: 150,
  speedY: 0,
  size: 50,
};

function drawBird() {
  var angle = (Math.atan2(bird.speedY, 10) * 180) / Math.PI;
  ctx.save();
  ctx.translate(bird.x + bird.size / 2, bird.y + bird.size / 2);
  ctx.rotate((angle * Math.PI) / 180);
  ctx.drawImage(birdImg, -bird.size / 2, -bird.size / 2, bird.size, bird.size);
  ctx.restore();
}

function drawLives() {
  ctx.fillStyle = "white";
  ctx.font = "30px Arial";
  ctx.fillText("Lives: " + lives, 10, 50);
}

function drawPowerup() {
  ctx.fillStyle = "Orange";
  ctx.font = "30px Arial";
  ctx.fillText("Current Powerup: " + coinEffect.toUpperCase(), 10, 75);
}

function drawBackground() {
  var pattern = ctx.createPattern(backgroundImg, "repeat-x");
  ctx.fillStyle = pattern;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function moveBird() {
  bird.y += bird.speedY;
  bird.speedY += gravity;

  // Limit the maximum speed of the bird
  if (bird.speedY > 10) {
    bird.speedY = 10;
  }
}

function drawScore() {
  ctx.fillStyle = "white";
  ctx.font = "30px Arial";
  ctx.fillText("Score: " + (score * scoreMultiplier) / 2, 10, 25);
}

function updateLeaderboard() {
  highScoreList.innerHTML = "";
  for (var i = 0; i < highScores.length; i++) {
    var highScore = highScores[i];
    var li = document.createElement("li");
    li.textContent = highScore;
    highScoreList.appendChild(li);
  }
}

startButton.addEventListener("click", () => {
  if (gameOver) {
    // Reset the game state
    bird.y = 100;
    bird.speedY = 0;
    pipes = [];
    score = 0;
    lives = 1;
    coinEffect = "None";
    gameOver = false;
  }
  start();
  startButton.style.display = "none"; // Hide the start button
  setInterval(createPipe, 2000); // Create a new pipe every 2 seconds (2000 milliseconds)
});

function generateCoin() {
  var coinWidth = 20;
  var coinHeight = 20;
  var coinX = canvas.width;
  var coinY = Math.floor(Math.random() * (canvas.height - coinHeight));
  var randomNum = Math.floor(Math.random() * 10); // Generate a random number between 0 and 9

  // Assign a random effect to the coin based on the random number
  if (randomNum === 0) {
    coinEffect = "extraLife";
    console.log("extra life");
  } else if (randomNum <= 4) {
    coinEffect = "doublePoints";
    console.log("2x points");
  } else {
    coinEffect = "slowGravity";
    console.log("low grav active");
    console.log(gravity);
  }

  // Add the new coin to the coins array
  coins.push({
    x: coinX,
    y: coinY,
    width: coinWidth,
    height: coinHeight,
    effect: coinEffect,
  });
}

function updateCoins() {
  var currentTime = Date.now();
  if (currentTime - coinLastGenerated > coinInterval) {
    generateCoin();
    coinLastGenerated = currentTime;
  }

  for (var i = 0; i < coins.length; i++) {
    // Draw the coin
    ctx.fillStyle = "yellow";
    ctx.fillRect(coins[i].x, coins[i].y, coins[i].width, coins[i].height);

    // Check for collision with the bird
    if (
      bird.x < coins[i].x + coins[i].width &&
      bird.x + bird.size > coins[i].x &&
      bird.y < coins[i].y + coins[i].height &&
      bird.y + bird.size > coins[i].y
    ) {
      // Handle the coin effect
      if (coins[i].effect === "extraLife") {
        lives++;
      } 
      else if (coins[i].effect === "doublePoints") {
        scoreMultiplier = 2;
        setTimeout(function () {
          scoreMultiplier = 1;
        }, 10000); // Reset score multiplier after 5 seconds
      } 
      else if (coins[i].effect === "slowGravity") {
        gravity = 0.15;
        bird.speedY = -2;
        console.log(gravity)
        
        setTimeout(function () 
        {
          gravity = 0.2;
        }, 5000); // Reset gravity after 5 seconds
      }

      // Remove the coin from the coins array
      coins.splice(i, 1);
    } else {
      // Move the coin to the left
      coins[i].x -= scrollSpeed;
    }
  }
}

function createPipe() {
  var minHeight = 50;
  var maxHeight = canvas.height - gapHeight - minHeight;
  var topHeight = Math.floor(
    Math.random() * (maxHeight - minHeight + 1) + minHeight
  );
  var topPipe = {
    x: canvas.width,
    y: 0,
    width: 50,
    height: topHeight,
    passed: false,
  };
  var bottomHeight = canvas.height - gapHeight - topHeight;
  var bottomPipe = {
    x: canvas.width,
    y: topHeight + gapHeight,
    width: 50,
    height: bottomHeight,
    passed: false,
  };

  if (
    pipes.length === 0 ||
    canvas.width - pipes[pipes.length - 1].x >= minPipeGap
  ) {
    pipes.push(topPipe);
    pipes.push(bottomPipe);
  }
}

function drawPipes() {
  for (var i = 0; i < pipes.length; i++) {
    ctx.fillStyle = "green";
    ctx.fillRect(pipes[i].x, pipes[i].y, pipes[i].width, pipes[i].height);
    // Add a small horizontal rectangle to each pipe
    var horizontalRectWidth = 80;
    var horizontalRectHeight = 10;
    var horizontalRectX =
      pipes[i].x - horizontalRectWidth / 2 + pipes[i].width / 2;
    var upperHorizontalRectY = pipes[i].y + pipes[i].height;
    var lowerHorizontalRectY = pipes[i].y - horizontalRectHeight;
    ctx.fillRect(
      horizontalRectX,
      upperHorizontalRectY,
      horizontalRectWidth,
      horizontalRectHeight
    );
    ctx.fillRect(
      horizontalRectX,
      lowerHorizontalRectY,
      horizontalRectWidth,
      horizontalRectHeight
    );
  }
}

function movePipes() {
  for (var i = 0; i < pipes.length; i++) {
    pipes[i].x -= 2;
    if (pipes[i].x + pipes[i].width < bird.x && !pipes[i].passed) {
      pipes[i].passed = true;
      score++;
    }
  }
}

function checkCollision() {
  if (bird.y + bird.size > canvas.height) {
    storeScore();
    gameOver = true;
    
  }
  for (var i = 0; i < pipes.length; i++) {
    if (
      bird.x + bird.size > pipes[i].x &&
      bird.x < pipes[i].x + pipes[i].width &&
      ((bird.y < pipes[i].y + pipes[i].height && pipes[i].y === 0) ||
        (bird.y + bird.size > pipes[i].y && pipes[i].y !== 0))
    ) {
      storeScore();
      gameOver = true;
      
    }
  }
}

function storeScore() {
  if (!gameOver) return;
  highScores.push(score / 2); // Divide by 2 because we count each pair of pipes
  highScores.sort((a, b) => b - a); // Sort the scores in descending order
  highScores = highScores.slice(0, 5); // Keep only the top 5 scores
  updateLeaderboard(); // Update the leaderboard with the new scores
}

function gameLoop() {
  if (!gameOver) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBackground(); // Add this line to draw the background
    drawBird();
    moveBird();
    updateCoins();
    createPipe();
    drawPipes();
    movePipes();
    checkCollision();
    drawScore();
    drawLives();
    drawPowerup();
    requestAnimationFrame(gameLoop);
  } else {
    startButton.style.display = "block"; // Show the start button
    ctx.fillStyle = "red";
    ctx.font = "30px Arial";
    ctx.fillText("Game Over!", 100, canvas.height / 2 - 15);
  }
}

function start() {
  canvas.focus();
  // Start the game loop
  gameLoop();
  // Handle key presses
  document.addEventListener("keydown", function (event) {
    if (event.code === "Space" || event.code === "ArrowUp") {
      bird.speedY = -6;
      console.log("---> keydown");
    }
  });
}
