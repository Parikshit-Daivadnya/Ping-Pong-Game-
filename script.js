const canvas = document.getElementById("pongCanvas");
const ctx = canvas.getContext("2d");

// Game constants
const PADDLE_WIDTH = 10,
  PADDLE_HEIGHT = 100,
  BALL_SIZE = 15;
const PADDLE_MARGIN = 20;
const PLAYER_SPEED = 6;
const AI_SPEED = 4;

// Game objects
let playerY = (canvas.height - PADDLE_HEIGHT) / 2;
let aiY = (canvas.height - PADDLE_HEIGHT) / 2;
let ballX = canvas.width / 2 - BALL_SIZE / 2;
let ballY = canvas.height / 2 - BALL_SIZE / 2;
let ballSpeedX = 5 * (Math.random() > 0.5 ? 1 : -1);
let ballSpeedY = 4 * (Math.random() > 0.5 ? 1 : -1);

let playerScore = 0,
  aiScore = 0;

// Handle mouse movement for player paddle
canvas.addEventListener("mousemove", function (evt) {
  const rect = canvas.getBoundingClientRect();
  const mouseY = evt.clientY - rect.top;
  playerY = mouseY - PADDLE_HEIGHT / 2;
  // Clamp within canvas
  if (playerY < 0) playerY = 0;
  if (playerY + PADDLE_HEIGHT > canvas.height)
    playerY = canvas.height - PADDLE_HEIGHT;
});

// Draw everything
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Middle dashed line
  ctx.setLineDash([10, 15]);
  ctx.strokeStyle = "#fff";
  ctx.beginPath();
  ctx.moveTo(canvas.width / 2, 0);
  ctx.lineTo(canvas.width / 2, canvas.height);
  ctx.stroke();
  ctx.setLineDash([]);

  // Player paddle (left)
  ctx.fillStyle = "#00ff99";
  ctx.fillRect(PADDLE_MARGIN, playerY, PADDLE_WIDTH, PADDLE_HEIGHT);

  // AI paddle (right)
  ctx.fillStyle = "#ff0055";
  ctx.fillRect(
    canvas.width - PADDLE_MARGIN - PADDLE_WIDTH,
    aiY,
    PADDLE_WIDTH,
    PADDLE_HEIGHT
  );

  // Ball
  ctx.fillStyle = "#fff";
  ctx.fillRect(ballX, ballY, BALL_SIZE, BALL_SIZE);

  // Scores
  ctx.font = "32px Arial";
  ctx.fillText(playerScore, canvas.width / 2 - 60, 40);
  ctx.fillText(aiScore, canvas.width / 2 + 40, 40);
}

// Update game state
function update() {
  // Move ball
  ballX += ballSpeedX;
  ballY += ballSpeedY;

  // Top and bottom wall collision
  if (ballY < 0) {
    ballY = 0;
    ballSpeedY *= -1;
  }
  if (ballY + BALL_SIZE > canvas.height) {
    ballY = canvas.height - BALL_SIZE;
    ballSpeedY *= -1;
  }

  // Player paddle collision
  if (
    ballX <= PADDLE_MARGIN + PADDLE_WIDTH &&
    ballY + BALL_SIZE > playerY &&
    ballY < playerY + PADDLE_HEIGHT
  ) {
    ballX = PADDLE_MARGIN + PADDLE_WIDTH;
    ballSpeedX *= -1;
    // Add a bit of "english" based on where it hits the paddle
    let collidePoint = ballY + BALL_SIZE / 2 - (playerY + PADDLE_HEIGHT / 2);
    collidePoint /= PADDLE_HEIGHT / 2;
    let angleRad = (Math.PI / 4) * collidePoint;
    let speed = Math.sqrt(ballSpeedX ** 2 + ballSpeedY ** 2);
    ballSpeedX = speed * Math.cos(angleRad);
    ballSpeedY = speed * Math.sin(angleRad);
    if (ballSpeedX < 0) ballSpeedX *= -1;
  }

  // AI paddle collision
  if (
    ballX + BALL_SIZE >= canvas.width - PADDLE_MARGIN - PADDLE_WIDTH &&
    ballY + BALL_SIZE > aiY &&
    ballY < aiY + PADDLE_HEIGHT
  ) {
    ballX = canvas.width - PADDLE_MARGIN - PADDLE_WIDTH - BALL_SIZE;
    ballSpeedX *= -1;
    let collidePoint = ballY + BALL_SIZE / 2 - (aiY + PADDLE_HEIGHT / 2);
    collidePoint /= PADDLE_HEIGHT / 2;
    let angleRad = (Math.PI / 4) * collidePoint;
    let speed = Math.sqrt(ballSpeedX ** 2 + ballSpeedY ** 2);
    ballSpeedX = -speed * Math.cos(angleRad);
    ballSpeedY = speed * Math.sin(angleRad);
    if (ballSpeedX > 0) ballSpeedX *= -1;
  }

  // Score: Ball goes off left or right side
  if (ballX < 0) {
    aiScore++;
    resetBall();
  }
  if (ballX + BALL_SIZE > canvas.width) {
    playerScore++;
    resetBall();
  }

  // Move AI paddle
  let aiCenter = aiY + PADDLE_HEIGHT / 2;
  if (aiCenter < ballY + BALL_SIZE / 2 - 10) aiY += AI_SPEED;
  else if (aiCenter > ballY + BALL_SIZE / 2 + 10) aiY -= AI_SPEED;

  // Clamp AI paddle within canvas
  if (aiY < 0) aiY = 0;
  if (aiY + PADDLE_HEIGHT > canvas.height) aiY = canvas.height - PADDLE_HEIGHT;
}

// Reset ball after a score
function resetBall() {
  ballX = canvas.width / 2 - BALL_SIZE / 2;
  ballY = canvas.height / 2 - BALL_SIZE / 2;
  // Randomize direction
  let angle = (Math.random() * Math.PI) / 2 - Math.PI / 4; // -45 to +45 deg
  let direction = Math.random() > 0.5 ? 1 : -1;
  let speed = 5;
  ballSpeedX = direction * speed * Math.cos(angle);
  ballSpeedY = speed * Math.sin(angle);
}

// Main game loop
function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

gameLoop();
