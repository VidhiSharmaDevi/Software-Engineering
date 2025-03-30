let map;
let buttons= [];
let levelOneImg, levelTwoImg, levelThreeImg, secretLevelImg;
let settingMenu = false;
let audioSelectionMenu = false;

    function preload() {
      map = loadImage('assets/map.png');
      soundEffects["buttonSound"] = loadSound('sounds/buttonClick.mp3');
      levelOneImg = loadImage('assets/level1.png');
      levelTwoImg = loadImage('assets/level2.png');
      levelThreeImg = loadImage('assets/level3.png');
      secretLevelImg = loadImage('assets/secretlevel.png');
      levelOneHover = loadImage('assets/level1Hover.png');
      levelTwoHover= loadImage('assets/level2Hover.png');
      levelThreeHover= loadImage('assets/level3Hover.png');
      secretLevelHover = loadImage('assets/secretlevelhover.png');
    }

    function setup(){
        createCanvas(windowWidth, windowHeight);
        buttons.push(new Button("", windowWidth / 2 + 150, windowHeight /2 - 150 , 80, 100, levelOneImg, levelOneHover, cityOne));
        buttons.push(new Button("", windowWidth / 2 - 200, windowHeight /2 - 150, 80, 100, levelTwoImg, levelTwoHover, cityTwo));
        buttons.push(new Button("", windowWidth / 2 - 150, windowHeight /2 + 150 , 80, 100, levelThreeImg, levelThreeHover, cityThree));
        buttons.push(new Button("", windowWidth / 2 - 450 , windowHeight /2 - 190 , 80, 100, secretLevelImg, secretLevelHover, dawgs));
        loadVolumeSetting();
        
    }

    function draw(){
        background(0);
        image(map, 0, 0, windowWidth, windowHeight);
        for (let btn of buttons) {
            btn.display();
        }

    }
    

    // function levelOneButton(){ //i know I can make a 'new Button' and better function management , but  ill do that later
        
    //     let button = createButton('level 1');
    //     button.style('border-radius', '100%',);
    //     button.style('width', '50px');
    //     button.style('height', '50px');
    //     button.style('font-weight', 'bold');
    //     button.position(windowWidth / 2 + 200, windowHeight /2 - 200 );
    //     button.mousePressed(cityOne);
    //     btnArr.push(button);
    // }
    // function levelTwoButton(){ 
        
    //     let button = createButton('level 2');
    //     button.style('border-radius', '100%',);
    //     button.style('width', '50px');
    //     button.style('height', '50px');
    //     button.style('font-weight', 'bold');
    //     button.position(windowWidth / 2 - 250, windowHeight /2 - 200 );
    //     button.mousePressed(cityTwo);
    //     btnArr.push(button);
    // }

    // function levelThreeButton(){ 
        
    //     let button = createButton('level 3');
    //     button.style('border-radius', '100%',);
    //     button.style('width', '50px');
    //     button.style('height', '50px');
    //     button.style('font-weight', 'bold');
    //     button.position(windowWidth / 2 - 150, windowHeight /2 + 150 );
    //     button.mousePressed(cityThree);
    //     btnArr.push(button);
    // }
    // function secretLevel(){
    //     let button = createButton('?');
    //     button.style('border-radius', '100%',);
    //     button.style('width', '50px');
    //     button.style('height', '50px');
    //     button.style('font-weight', 'bold');
    //     button.position(windowWidth / 2 - 600 , windowHeight /2 - 265 );
    //     button.mousePressed(dawgs);
    //     btnArr.push(button);
    // }

    function cityOne() {
        window.location.href = "game.html";
    }
    function cityTwo() {
        window.location.href = "game.html";
    }
    function cityThree() {
        window.location.href = "game.html";
    }

    function dawgs() {
        window.open('https://www.youtube.com/watch?v=RQmEERvqq70&ab_channel=Generuu')
    }

    function buttonClick() {
        playSoundEffect("buttonSound");
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
            currSong.amp(isMuted ? 0 : currVolume);
        }
        Object.values(soundEffects).forEach((sound) => {
            sound.amp(isMuted ? 0 : currEffectsVolume);
        });
    }
    function mousePressed() {
        for(let btn of buttons){
            if (btn.isHovered() && btn.action) {
                buttonClick();
                setTimeout(() => btn.action(), 200);
            }
        }
        }
    