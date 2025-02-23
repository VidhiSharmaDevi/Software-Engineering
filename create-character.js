let buttons = [], confirmButton;
let bgImage, characterImage;
let menuSong, buttonSound;
let currVolume = 0.5;
let backgroundSound;


function preload() {
    bgImage = loadImage('assets/roughititlescreen.png');
    characterImage = loadImage('assets/tempCharacter.png');
    buttonSound = loadSound('sounds/buttonClick.mp3');
    backgroundSound = loadSound('sounds/stadiumSound.mp3');
}

function setup() {
    createCanvas(windowWidth, windowHeight);
    textAlign(CENTER, CENTER);
    rectMode(CENTER);
    textSize(32);

    loadVolumeSetting();
    if (!backgroundSound.isPlaying()){
        backgroundSound.play()
            }
    localStorage.setItem("characterTag", null);

    buttons.push(new Button("Back", 175, height - 50, 200, 50, null, null, () => goBack()));
    buttons.push(new Button("Character 1", width/2 - 230, height/2 - 275, 200, 50, null, null, () => selectedCharacter("Character 1")));
    buttons.push(new Button("Character 2", width/2,       height/2 - 275, 200, 50, null, null, () => selectedCharacter("Character 2")));
    buttons.push(new Button("Character 3", width/2 + 230, height/2 - 275, 200, 50, null, null, () => selectedCharacter("Character 3")));
    confirmButton = new Button("Confirm Character", width-175, height - 50, 200, 50, null, null, () => confirmCharacter());
   
}


function draw() {
    background(bgImage);
    fill(255, 215, 0);
    textSize(64);
    textStyle(BOLD);
    fill('black');
    text("Select Character", width/2, 100);

    fill('grey');
    rect(width/2, height/2 + 50, 400, 550, 20);

    textSize(32);
    fill('black');
    if (localStorage.getItem("characterTag") === "null") {
        text("Select a Preset", width/2, height/2 - 200);
    } else if (localStorage.getItem("characterTag") === "Character 1") {
        text("Character 1", width/2, height/2 - 200);
        image(characterImage, width/2 - 200, height/2 - 175, 400, 400);
    } else if (localStorage.getItem("characterTag") === "Character 2") {
        text("Character 2", width/2, height/2 - 200);
        image(characterImage, width/2 - 200, height/2 - 175, 400, 400);
    } else if (localStorage.getItem("characterTag") === "Character 3") {
        text("Character 3", width/2, height/2 - 200);
        image(characterImage, width/2 - 200, height/2 - 175, 400, 400);
    }

    for (let btn of buttons) {
        btn.display();
    }
    if (localStorage.getItem("characterTag") !== "null") {
        confirmButton.display();
    }
}

function mousePressed() {
    for (let btn of buttons) {
        if (btn.isHovered() && btn.action) {
            buttonClick();
            setTimeout(() => btn.action(), 200);
        }
    }
    if (confirmButton.isHovered() && localStorage.getItem("characterTag") !== "null") {
        buttonClick();
        setTimeout(() => confirmButton.action(), 200);
    }
}

function selectedCharacter(characterTag) {
    localStorage.setItem("characterTag", characterTag);
    console.log("selected character ", characterTag);
}

function confirmCharacter() {
    let characterTag = localStorage.getItem("characterTag");
    localStorage.setItem("confirmedPreset", characterTag);
    localStorage.setItem("isLoad1", "true");
    localStorage.setItem("characterTag", null);
    window.location.href = "game.html";
}

function buttonClick() {
    loadVolumeSetting();
    buttonSound.play();
}

function loadVolumeSetting() {
    const savedVolume = localStorage.getItem("volume");
    const savedMute = localStorage.getItem("isMuted");
  
    if (savedVolume !== null) {
        currVolume = parseFloat(savedVolume);
    }
    if (savedMute !== null) {
        let isMuted = savedMute === "true";
    if(backgroundSound || buttonSound){
        backgroundSound.setVolume(isMuted ? 0 : currVolume);
        buttonSound.setVolume(isMuted ? 0 : currVolume);
    }
    }
}

function goBack() {
    localStorage.setItem("gameState", "loadGame");
    window.location.href = "index.html";
}