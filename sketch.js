let buttons = [];
let loadButtons = [];
let gameState = "menu";
let isLoad1 = "false";
let settingMenu = false;
let audioSelectionMenu = false;
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
    loadVolumeSetting();

    let storedState = localStorage.getItem("gameState");
    if (storedState) {
        gameState = storedState;
        localStorage.removeItem("gameState");
    }

    startMenuButtons();
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
    background(0);

    let scaleFactor = Math.max(width / bgImage.width, height / bgImage.height);
    let drawWidth = bgImage.width * scaleFactor;
    let drawHeight = bgImage.height * scaleFactor;
    image(bgImage, (width - drawWidth) / 2, (height - drawHeight) / 2, drawWidth, drawHeight);
    
    let rawIconWidth  = width * 0.4;
    let baseIconWidth = constrain(rawIconWidth, 500, width); 
    let iconScale = baseIconWidth / titleIcon.width;
    let baseIconHeight = titleIcon.height * iconScale;
    image(titleIcon, (width - baseIconWidth) / 2, height * 0.01, baseIconWidth, baseIconHeight);

    fill(255, 215, 0);
    textSize(60);
    textStyle(BOLD);
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
    if (settingMenu) { return; }

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
    if (!currSong.isPlaying()) {
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

function startMenuButtons() {
    let baseStartWidth = width * 0.15;
    let baseStartHeight = baseStartWidth / 4;
    let minStartWidth = 120;
    let minStartHeight = 40;
    let startButtonWidth = Math.max(baseStartWidth, minStartWidth);
    let startButtonHeight = Math.max(baseStartHeight, minStartHeight);

    let buttonSize = min(width * 0.15, height * 0.15);
    let gap = buttonSize * 0.1;
    let marginRight = buttonSize * .2;
    let totalButtonsWidth = buttonSize * 2 + gap;
    let startX = width - totalButtonsWidth - marginRight;
    let buttonY = height - buttonSize - (buttonSize * 0.2);

    buttons.push(new Button("Start Game", width / 2, height * 0.75, startButtonWidth, startButtonHeight, null, null, () => gameState = "loadGame"));
    buttons.push(new Button("Settings", startX + buttonSize + gap + buttonSize / 2, buttonY + buttonSize / 2, buttonSize, buttonSize, settingsImg, settingsImgHover, () => settingMenu = true));
    buttons.push(new Button("Credits", startX + buttonSize / 2, buttonY + buttonSize / 2, buttonSize, buttonSize, creditsImg, creditsImgHover, () => loadCredits()));
}

function loadVolumeSetting() {
    const savedVolume = localStorage.getItem("volume");
    const savedMute = localStorage.getItem("isMuted");
    const savedEffectsVolume = localStorage.getItem("effectsVolume");

    if (savedVolume !== null) {
        currVolume = parseFloat(savedVolume);
    }
    if (savedEffectsVolume !== null) {
        currEffectsVolume = parseFloat(savedEffectsVolume);
    }
    isMuted = savedMute !== null ? (savedMute === "true") : false;

    if (currSong) {
        currSong.setVolume(isMuted ? 0 : currVolume);
    }
    Object.values(soundEffects).forEach((sound) => {
        sound.setVolume(isMuted ? 0 : currEffectsVolume);
    });
}

function keyPressed() {
    if (keyCode === ESCAPE) {
        goBack();
    }
}
