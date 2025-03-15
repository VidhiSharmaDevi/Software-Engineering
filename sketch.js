let buttons = [];
let loadButtons = [];
let gameState = "menu";
let isLoad1 = "false";
let settingMenu = false;
let bgImage, titleIcon;
let settingsImg, settingsImgHover, creditsImg, creditsImgHover;

function preload() {
  bgImage = loadImage('assets/roughititlescreen4.png'); 
  titleIcon = loadImage('assets/OREDTitle.png');
  settingsImg = loadImage('assets/OSettings_1.png');
  settingsImgHover = loadImage('assets/OSettings_2.png');
  creditsImg = loadImage('assets/OCredits_1.png');
  creditsImgHover = loadImage('assets/OCredits_2.png');
  currSong = loadSound('sounds/mainScreenSound.mp3');
  soundEffects["buttonSound"] = loadSound('sounds/buttonClick.mp3');
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  textAlign(CENTER, CENTER);
  textSize(32);

  isLoad1 = localStorage.getItem("isLoad1");

  let storedState = localStorage.getItem("gameState");
  if (storedState) {
    gameState = storedState;
    localStorage.removeItem("gameState");
  }

  buttons.push(new Button("Start Game", width / 2, 300, 300, 80, null, null, () => gameState = "loadGame"));
  buttons.push(new Button("Settings", width - 100, height - 100, 120, 120, settingsImg, settingsImgHover, () => settingMenu = true));
  buttons.push(new Button("Credits", width - 250, height - 100, 120, 120, creditsImg, creditsImgHover, () => loadCredits()));
  resetButton = new Button("Reset Game Save", width / 2, 420, 300, 75, null, null, () => deleteSave());
  createModal();
}

function draw() {
  background(20);
  
  switch (gameState) {
    case "preMenu":
      //TODO
      break;
    case "menu":
      drawMainMenu();
      break;
    case "loadGame":
      drawLoadScreen();
      break;
    default:
  }
  
  if (settingMenu) {
    showSettings();
  }
}

function drawMainMenu() {
  background(bgImage);
  fill(255, 215, 0);
  textSize(60);
  textStyle(BOLD);
  image(titleIcon, (width / 2) - 320, -20, 640, 320);

  textStyle(NORMAL);
  for (let btn of buttons) {
    btn.display();
  }
}

function drawLoadScreen() {
  fill(255, 215, 0);
  textSize(60);
  textStyle(BOLD);
  text("Load Game", width / 2, height * .1);

  loadButtons = [
      new Button("Game 1", width / 2, 300, 300, 75, null, null, () => loadGame()),
      //new Button("Game 2", width / 2, 330, 300, 75, null, null, () => loadGame()),
      new Button("Back", 175, height - 50, 200, 50, null, null, () => goBack()),
      new Button("Login Test", 500, height - 50, 100, 50, null, null, () => loadlogin())
  ];

  for (let btn of loadButtons) {
      btn.display();
  }
  if (isLoad1 === "true") {
    resetButton.display();
  }
}

function mousePressed() {
  if (settingMenu) {return;}

  let activeButtons = (gameState === "menu") ? buttons : loadButtons;
  for (let btn of activeButtons) {
    if (btn.isHovered() && btn.action) {
      buttonClick();
      setTimeout(() => btn.action(), 200);
    }
  }
  if (resetButton.isHovered() && localStorage.getItem("isLoad1") !== "false") {
    buttonClick();
    setTimeout(() => resetButton.action(), 200);
  }
  if(!currSong.isPlaying()) { 
    currSong.loop();
  }
}

function goBack() {
  gameState = "menu";
}

function buttonClick() {
  playSoundEffect("buttonSound");
}

function loadCharacterSelect() {
  window.location.href = "create-character.html";
}
function loadGame() {
  if (isLoad1 === "true") {
    window.location.href = "game.html";
  } else {
    loadCharacterSelect();
  }
}
function loadlogin() {
  window.location.href = "login.html";
}
function loadCredits() {
  window.location.href = "credits.html";
}
function deleteSave() {
  localStorage.setItem("isLoad1", false);
  isLoad1 = localStorage.getItem("isLoad1");
}

function keyPressed() {
  if (keyCode === ESCAPE) {
    goBack();
  }
}
