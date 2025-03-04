let map;
let button;

    function preload() {
      map = loadImage('assets/map.png');
    }

    function setup(){
        createCanvas(windowWidth, windowHeight);
        levelButton();
        secretLevel();
        backButton();

    }

    function draw(){
        background(0);
        image(map, 0, 0, windowWidth, windowHeight);
    }

    function backButton(){
        button = createButton('back');
        button.style('border-radius', '100%',);
        button.style('width', '50px');
        button.style('height', '50px');
        button.style('font-weight', 'bold');
        button.position(windowWidth /100 , windowHeight - windowHeight /10 );
        button.mousePressed(back);
    }

    function levelButton(){ //i know I can make a 'new Button' and better function management , but  ill do that later
        
        button = createButton('level 1');
        button.style('border-radius', '100%',);
        button.style('width', '50px');
        button.style('height', '50px');
        button.style('font-weight', 'bold');
        button.position(windowWidth / 2 + 200, windowHeight /2 - 200 );
        button.mousePressed(city);
    }

    function secretLevel(){
        button = createButton('?');
        button.style('border-radius', '100%',);
        button.style('width', '50px');
        button.style('height', '50px');
        button.style('font-weight', 'bold');
        button.position(windowWidth / 2 - 600 , windowHeight /2 - 265 );
        button.mousePressed(dawgs);
    }

    function city() {
        window.location.href = "game.html";
    }

    function back() {
        window.location.href = "create-character.html";
    }
    function dawgs() {
        window.open('https://www.youtube.com/watch?v=RQmEERvqq70&ab_channel=Generuu')
    }