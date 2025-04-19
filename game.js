const PLAYER_OFFSET_X = 40;
const PLAYER_OFFSET_Y = 80;
const PLAYER_WIDTH = 80;
const PLAYER_HEIGHT = 120;
const SPRITE_Y_OFFSET = 20;
const MAX_POWER = 1600;
const MAX_LEVEL = 3;

let lastSelectedLevel = localStorage.getItem("lastSelectedLevel");
if (lastSelectedLevel !== null) lastSelectedLevel = parseInt(lastSelectedLevel);
else { lastSelectedLevel = 1; }

let hitZoneWidth, hitZoneHeight, catchDistance, groundDistance, runnerProximity;
let pitcher, batter, ball, bases, fielders, runners = [];
let lineup, currentBatter = 0;
let score = { home: 0, away: 0 }, outs = 0, strikes = 0, inning = 1, topInning = true;
let ballMoving = false, ballHit = false, pitchAnimation = false, swingAttempt = false;
let settingMenu = false;
let ballCaughtThisFrame = false;
let outPopupTime = 0;
let currentPerspective = "side";
let pitchCanChange = topInning;
let batterIterator = 0;
let playerSideBatting = true;

let initialFielderPositions = [];
let accumulator = 0;
const fixedDt = 1/60;
let xPower;
let yPower;

let bgImage, batterGif;
let settingButton;

let umpire;
let showStrikePopup = false;
let showRunPopup = false;
let showOutPopup = false;
let showHomerunPopup = false;
let showFoulPopup = false;
let showTiePopup = false;
let popupTimer = 0;
let popupMessage = "";

let topDownCamera;

let audioSelectionMenu = false;
let audioButton;
gameState = "game";
// Difficulty
let generalDifficultyScale = 1;

function preload() {
    switch (lastSelectedLevel) {
        case 1:
            bgSideImage = loadImage('assets/final_design/batterfield.png');
            break;
        case 2:
            bgSideImage = loadImage('assets/final_design/batterfield.png');
            break;
        case 3:
            bgSideImage = loadImage('assets/final_design/batterfield.png');
            break;
        default:
            bgSideImage = loadImage('assets/final_design/batterfield.png');
            break;
    }
    bgTopImage = loadImage('assets/flat_field1.png');

    blueBatterIdle = loadImage('assets/temp_assets/sprites/batterBlueIdle.png');
    redBatterIdle = blueBatterIdle;
    playerBatterIdle = loadImage('assets/final_design/BlueTeam/BlueBatIdle.gif');

    blueBatterSwung = loadImage('assets/temp_assets/sprites/batterBlueSwing.png');
    redBatterSwung = blueBatterSwung;
    playerBatterSwung = loadImage('assets/final_design/BlueTeam/BlueBatSwing.png');

    playerIdleGif = loadImage('assets/final_design/RedTeam/RedFieldIdle.gif');
    batterGif = loadImage('assets/temp_assets/BATTER.gif');
    fielderIdleGif = loadImage('assets/final_design/RedTeam/RedFieldIdle.gif');
    runnerRunningGif = loadImage('assets/temp_assets/RRUNGIF.gif');
    fielderRunningGif = loadImage('assets/temp_assets/LRUNGIF.gif');
    runnerIdle = loadImage('assets/temp_assets/sprites/01_idle2.png');
    catcherImg = loadImage('assets/final_design/RedTeam/RedCatcher.png');
    ballImg = loadImage('assets/Baseball1.png');
    targetImage = loadImage('assets/final_design/Target2.png');
    directionImage = loadImage('assets/final_design/DirectArrow.png');
    settingButtonImage = loadImage('assets/final_design/game_setting2.png');

    currSong = loadSound('sounds/gamesong.mp3');
    soundEffects["buttonSound"] = loadSound('sounds/buttonClick.mp3');
    soundEffects["hitBall"] = loadSound('sounds/baseballBatHitBall.mp3'); 
    audio1 = loadSound('sounds/gamesong.mp3');
    audio2 = loadSound('sounds/audio2.mp3');
    audio3 = loadSound('sounds/audio3.mp3');
    audio4 = loadSound('sounds/audio4.mp3');
    audio5 = loadSound('sounds/audio5.mp3');
}



function setup() {
    createCanvas(windowWidth, windowHeight);

    hitZoneWidth = windowWidth * 0.03;
    hitZoneHeight = hitZoneWidth;
    catchDistance = windowWidth * 0.015;
    groundDistance = windowWidth * 0.005;
    runnerProximity = windowWidth * 0.01;
    strikeCatchThreshold = windowWidth * 0.01;
    xPower = windowWidth / 200;
    yPower = windowHeight / 200;

    canvas.getContext('2d', { willReadFrequently: true });

    loadVolumeSetting();
    if (!currSong.isPlaying()) {
        currSong.play();
        currSong.loop();
    }

    assignEntities();

    let transformedPitcher = sideToTopDown(pitcher.x, pitcher.y);
    topDownCamera = {
        worldAnchor: { x: transformedPitcher.x, y: transformedPitcher.y },
        screenAnchor: { x: width * 0.5, y: height * .75 },
        scaleX: .4,
        scaleY: 1
    };

    lineup = [batter];
    resetBall();

    fielders.forEach(fielder => {
        fielder.state = "idle";
    });

    let buttonSize = min(width * 0.1, height * 0.1);
    const widthGap = width * 0.07;  
    const heightGap = height * 0.1; 
    let settingsButtonX = width - widthGap / 2;
    let settingsButtonY = heightGap / 2;
    
    settingButton = new Button("Settings", settingsButtonX, settingsButtonY, buttonSize, buttonSize, settingButtonImage, settingButtonImage, () => settingsClick());
    audioButton = new Button("Audio", settingsButtonX * .995, settingsButtonY * 5, buttonSize * 1.4, buttonSize * .45, null, null, () => audioClick());
    Difficulty1 = new Button("make Normal", settingsButtonX * .995, settingsButtonY * 6, buttonSize * 1.4, buttonSize * .45, null, null, () => changeDifficulty(1));
    Difficulty2 = new Button("make Hard", settingsButtonX * .995, settingsButtonY * 7, buttonSize * 1.4, buttonSize * .45, null, null, () => changeDifficulty(2));
    Difficulty3 = new Button("make Impossible", settingsButtonX * .995, settingsButtonY * 8, buttonSize * 1.4, buttonSize * .45, null, null, () => changeDifficulty(3));
    loseDemo = new Button("Lose Demo", settingsButtonX * .995, settingsButtonY * 10, buttonSize * 1.4, buttonSize * .45, null, null, () => loseClick());
    winDemo = new Button("Win Demo", settingsButtonX * .995, settingsButtonY * 11, buttonSize * 1.4, buttonSize * .45, null, null, () => winClick());

    createModal();
    createAudioMenu();
    createWinPopup();
    createLosePopup();
    createDonePopup();
}

function draw() {
    cursor('default');
    updateUmpire();
    ballCaughtThisFrame = false;
    let dt = deltaTime / 1000;
    dt = min(dt, 0.05);
    accumulator += dt;

    push();
    if (currentPerspective === "topDown") {
        image(bgTopImage, 0, 0, width, height);
        drawTopDownField();
        drawTopDownPlayers();
    } 
    else {
        // batter-view
        image(bgSideImage, 0, 0, width, height);
        drawField();
        drawPlayers();
        // draw hitzone
        if (batter) {
            stroke(255, 0, 0);
            strokeWeight(2);
            noFill();
            rectMode(CENTER);
            rect(batter.x, batter.y - hitZoneHeight / 2, hitZoneWidth, hitZoneHeight);
        }
    }
    
    pop();

    // pitch skill-ckeck
    if (pitchSkillCheckActive) {
        drawPitcherSkillCheckBar(dt);
    }

    if(hitPowerSlider) {
        updateHitSkillBar(dt);
        drawPowerSkillCheckBar(dt);
    }
    else if(hitDirectionSlider) {
        updateHitSkillBar(dt);
        drawDirectionSkillBar(dt);
    }

    // Draw the HUD
    push();
    drawScoreboard();
    settingButton.display();
    if (DEBUG){
        audioButton.display();
        Difficulty1.display();
        Difficulty2.display();
        Difficulty3.display();
        loseDemo.display();
        winDemo.display();
    }
    pop();

    push();
    drawPopup();
    pop();

    push();
    if (!ballMoving && !topInning && pitchCanChange) {
        drawPitchSelectionBox();
    } else if (topInning) {
        displayRunHint();
    }
    pop();
    
    // Game logic
    while (accumulator >= fixedDt) {
        // ball goes off screen
        if (ball.y > height) {
            resetBall();
        }
        // pitch animation
        if (pitchAnimation) {
            pitcher.armAngle += 0.1 * 60 * fixedDt;
            if (pitcher.armAngle > PI / 2) {
                pitchAnimation = false;
                ballMoving = true;
            }
        }
        // pitch ball movement
        if (ballMoving && !ballHit && !ball.throwing) {
            switch(ball.pitchType) {
                case 'curveball':
                    let progress = constrain((ball.y - ball.startY) / ball.totalDistance, 0, 1);
                    ball.x = ball.originalX + ball.curveAmplitude * sin(progress * PI);
                    break;
                default:
                    break;
            }
            ball.y += ball.speedY * fixedDt;
            // bot hits ball in hit zone
            if (botHitScheduled && ball.y >= batter.y - hitZoneHeight * 0.5) {
                botHitBall();
                botHitScheduled = false;
            }
            // Swing before ball in hit zone
            if (ball.y >= batter.y && abs(ball.x - batter.x) < hitZoneWidth && !swingAttempt) {
                swingAttempt = true;
                playerStrike();
            }
        }
        // hit ball movement
        if (ballMoving && !ball.throwing) {
            if (ballHit && ball.homeRun) {
                runners.forEach(runner => {
                    runner.running = true;
                    runner.safe = false;
                });
                if (runners.length === 0) {
                    resetBatter();
                }
            } 
            else if(ballHit && !ball.homeRun) {
                // calculate normalizedPower value based on power used to hit the ball 
                let normalizedPower = constrain(abs(ball.initialSpeedY) / MAX_POWER, 0, 1);
                let maxDistance = windowWidth * 0.6;
                let t_flight = maxDistance / abs(ball.speedX);

                let t = (ball.speedX * t_flight) / maxDistance;
                let targetY = lerp(windowHeight * 0.42, windowHeight * 0.3, constrain(t, 0, 1))
                if (t > 1) {
                    targetY = windowHeight * 0.3 - (t - 1) * (windowHeight * 0.1); 
                }

                // based on normalizedPower determine target area
                let minTargetY = lerp(windowHeight * 0.2, windowHeight * 0.05, normalizedPower);
                let maxTargetY = lerp(windowHeight * 0.3, windowHeight * 0.15, normalizedPower);
                targetY = constrain(targetY, minTargetY, maxTargetY);
                
                // required gravity value to allow for ball to land normally
                let requiredG = (2 * (targetY - ball.y - ball.initialSpeedY * t_flight)) / (t_flight * t_flight);
                requiredG = constrain(requiredG, windowHeight * 1.0, windowHeight * 1.8); 

                // When the ball is hit too hard straight, but not enough for home run
                let gravityScale = 1.6;
                let xCheck = -3.67 < powerXSaveVal < 3.67;
                let powerYCheckVal = abs(ball.initialSpeedY) / MAX_POWER;
                if (xCheck && powerYCheckVal > .93) gravityScale = 1.65;
                requiredG *= gravityScale;

                ball.x += ball.speedX * fixedDt;
                ball.y += ball.speedY * fixedDt;
                // Home Run height reached
                if (!ball.foul && ball.y < 0 && homeRunHit) {
                    handleHomerun();
                    ball.homeRun = true;
                    showHomerunPopup = true;
                    popupMessage = "HOME RUN!"
                    popupTimer = millis();
                }
                // apply gravity when ball is going up
                if (ball.speedY < 0) {
                    ball.speedY += requiredG * fixedDt;
                } 
                else { // ball going down
                    // ball has not reached target, keep applying gravity
                    if (ball.y < targetY) {
                        ball.speedY += requiredG * fixedDt;

                    // bounce to recover ball in target range (bounce effect)
                    } else {
                        ball.y = lerp(ball.y, targetY, 0.01);
                        ball.speedY *= 0.5;

                        if (abs(ball.speedY) < 5 || abs(ball.y - targetY) < catchDistance) {
                            ball.inAir = false;
                        }
                    }
                }
                if (ball.foul && millis() - ball.foulSince > 1500) {
                    ball.foul = false;
                    resetBall();
                    return;
                }

                ball.speedX *= 0.98;
                if (abs(ball.speedX) < 0.3 && abs(ball.speedY) < 0.3) {
                    ball.speedX = 0;
                    ball.speedY = 0;
                }
                if(!ball.foul) moveFieldersTowardsBall(fixedDt);
            }
            if (!homeRunHit && !ball.foul && !ball.isChasing) {
                checkFielderCatch();
            }
        }

        // throwing ball movement
        if (ball.throwing) {
            ball.x += ball.speedX * fixedDt;
            ball.y += ball.speedY * fixedDt;
           
            // determine runner to try and get out
            let targetFielder = ball.targetFielder;

            // Fielder caught ball in attempt to out a runner
            if (targetFielder && (dist(ball.x, ball.y, targetFielder.x, targetFielder.y) < targetFielder.catchRadius) && !ball.isChasing) {
                handleCatch(targetFielder);
            }
        }
        moveInfieldersToBase(fixedDt);
        moveInfieldersToRunner(fixedDt);
        moveRunners(fixedDt);
        accumulator -= fixedDt;
    }
}

// Resets everything during an inning
function resetBall() {
    ball = {
        x: pitcher.x,
        y: pitcher.y - height*.05,
        speedY: 430,
        speedX: 0,
        throwing: false,
        inAir: false,
        advancingRunner: null,
        strikePitch: false,
        initialSpeedY: 0,
        crossedGround: false,
        isChasing: false,
        homeRun: false,
        foul: false,
        foulSince: null,
        pitchType: 'fastball'
    };
    ballMoving = false;
    ballHit = false;
    swingAttempt = false;
    pitchCanChange = !topInning;
    runners.forEach(runner => {
        runner.safe = false;
    });
    hitSkillCheckComplete = false; 
    hitDirectionSlider = false; 
    hitPowerSlider = false;
    sliderSpeed = 400;
}

// Scales side view entities to top down visual
function sideToTopDown(worldX, worldY) {
    let centerX = width / 2;
    let dx = worldX - centerX;
    //  vertical shift
    let perspectiveFactor = 0.08;
    
    let newY = worldY + Math.abs(dx) * perspectiveFactor;
    return { x: worldX, y: newY };
}
// Returns coordinates for top down position (players)
function perspectiveToTopDown(worldX, worldY, offsetUpY = 0) {
    let adjusted = sideToTopDown(worldX, worldY);
    
    return {
        x: (adjusted.x - topDownCamera.worldAnchor.x) * topDownCamera.scaleX + topDownCamera.screenAnchor.x,
        y: (adjusted.y - topDownCamera.worldAnchor.y) * topDownCamera.scaleY + topDownCamera.screenAnchor.y - offsetUpY
    };
}
// Returns coordinates for top down position (ball - not thrown)
function perspectiveToTopDownBall(worldX, worldY, offsetUpY = 0, anchor = pitcher, useSlowFactor = true) {
    let adjusted = sideToTopDown(worldX, worldY);
    let anchorTopDown = sideToTopDown(anchor.x, anchor.y);
    
    let ballTopDownSlowFactor = 1;
    if (useSlowFactor) { ballTopDownSlowFactor = 0.7; }
    adjusted.y = anchorTopDown.y + (adjusted.y - anchorTopDown.y) * ballTopDownSlowFactor;

    return {
        x: (adjusted.x - topDownCamera.worldAnchor.x) * topDownCamera.scaleX + topDownCamera.screenAnchor.x,
        y: (adjusted.y - topDownCamera.worldAnchor.y) * topDownCamera.scaleY + topDownCamera.screenAnchor.y - offsetUpY
    };
}
// Returns coordinates for top down position (ball - thrown)
function perspectiveToTopDownForThrownBall(worldX, worldY, extraYOffset = 0, thrower, target) {
    let totalDistance = dist(thrower.x, thrower.y, target.x, target.y);
    let currentDistance = dist(thrower.x, thrower.y, worldX, worldY);
    let t = constrain(currentDistance / totalDistance, 0, 1);

    let throwerTD = sideToTopDown(thrower.x, thrower.y);
    let targetTD = sideToTopDown(target.x, target.y);

    throwerTD.y -= extraYOffset;
    targetTD.y -= extraYOffset;

    let interpolatedTD = {
        x: lerp(throwerTD.x, targetTD.x, t),
        y: lerp(throwerTD.y, targetTD.y, t)
    };

    return {
        x: (interpolatedTD.x - topDownCamera.worldAnchor.x) * topDownCamera.scaleX + topDownCamera.screenAnchor.x,
        y: (interpolatedTD.y - topDownCamera.worldAnchor.y) * topDownCamera.scaleY + topDownCamera.screenAnchor.y
    }
}

// Draw function for the top down bases and other field objects
function drawTopDownField() {
    stroke(255);
    strokeWeight(2);
    noFill();

    let verticalOffset = height * 0.14;
    fill(255);
    noStroke();
    for (let base of bases) {
        let topDownBase = perspectiveToTopDown(base.x, base.y, verticalOffset);
        ellipse(topDownBase.x, topDownBase.y, 10, 10);
    }
}

// Draw function for the top down player entities
function drawTopDownPlayers() {
    let verticalOffset = height * 0.14;
    let ballOffset = !ballHit ? 0 : verticalOffset;
    let pitcherOffsetY = -0.075 * height;
    let pitcherPos = perspectiveToTopDown(pitcher.x, pitcher.y);
    pitcherPos.y += pitcherOffsetY;
    fill('red');
    ellipse(pitcherPos.x, pitcherPos.y, 15, 15);
    
    if (ball.throwing && ball.throwingFielder && ball.targetFielder) {
        // thrower as the anchor and targetFielder as the target
        let ballPos = perspectiveToTopDownForThrownBall(
            ball.x, 
            ball.y, 
            ballOffset,
            ball.throwingFielder,
            ball.targetFielder
        );
        fill('white');
        ellipse(ballPos.x, ballPos.y, 10, 10);
    } else {
        if (!ballHit) ballOffset -= pitcherOffsetY + .04 * height;
        let useSlowFactor = !ballHit;
        let ballPos = perspectiveToTopDownBall(ball.x, ball.y, ballOffset, pitcher, useSlowFactor);
        fill('white');
        ellipse(ballPos.x, ballPos.y, 10, 10);
    }

    // Draw batter (if needed)
    if (batter) {
        let batterPos = perspectiveToTopDown(batter.x, batter.y, verticalOffset);
        fill('orange');
        ellipse(batterPos.x, batterPos.y, 15, 15);
    }
    
    // Draw catcher
    let catcherPos = perspectiveToTopDown(catcherPlayer.x, catcherPlayer.y, verticalOffset);
    fill('blue');
    ellipse(catcherPos.x, catcherPos.y, 15, 15);
    
    // Draw fielders
    fill('purple');
    fielders.forEach(fielder => {
        let fielderPos = perspectiveToTopDown(fielder.x, fielder.y, verticalOffset);
        ellipse(fielderPos.x, fielderPos.y, 15, 15);
    });
    
    // Draw runners
    fill('yellow');
    runners.forEach(runner => {
        let runnerPos = perspectiveToTopDown(runner.x, runner.y, verticalOffset);
        ellipse(runnerPos.x, runnerPos.y, 15, 15);
    });
}

// Draw funtion for the side view field objects
function drawField() {
    if (DEBUG) {
        fill(255);
        bases.forEach(base => {
            rect(base.x - 10, base.y - 10, 20, 20);
        });

        stroke(255);
        noFill();
        beginShape();
        bases.forEach(base => vertex(base.x, base.y));
        vertex(bases[0].x, bases[0].y);
        endShape();
    }
}

// Scale the size based on y value of the canvas (players)
function getScaleFactor(y) {
    return map(y, height * 0.4, height * 0.9, .9, 2);
}
// Scale the size based on y value of the canvas (Ball)
function getBallScaleFactor(y) {
    return map(y, height * 0.4, height * 0.9, 0.0125, 0.02);
}
// Draw scaled player image
function drawScaledPlayer(entity, img, yOverride = null) {
    // custom y-value to override entities
    const yPos = (yOverride !== null) ? yOverride : entity.y;
    let scaleFactor = getScaleFactor(yPos);
    let scaledWidth = PLAYER_WIDTH * scaleFactor;
    let scaledHeight = PLAYER_HEIGHT * scaleFactor;
    if (entity !== batter) {
        image(img, entity.x - scaledWidth / 2, yPos + SPRITE_Y_OFFSET - scaledHeight, scaledWidth, scaledHeight);
        return;
    }
    image(img, entity.x - scaledWidth / 2 - width * .05, yPos + SPRITE_Y_OFFSET - scaledHeight, scaledWidth, scaledHeight);
}

// Draw function for side view player entities
function drawPlayers() {
    drawUmpire();
    
    fielders.forEach(fielder => {
        let img = (fielder.state === "running") ? fielderRunningGif : fielderIdleGif;
        drawScaledPlayer(fielder, img, fielder.y);
    });

    runners.forEach(runner => {
        let img;
        if (runner.player) img = runner.running ? runnerRunningGif : playerIdleGif;
        else img = runner.running ? runnerRunningGif : runnerIdle;
        drawScaledPlayer(runner, img);
    });

    let pitcherImg;
    if (playerSideBatting) pitcherImg = fielderIdleGif;
    else pitcherImg = playerIdleGif;
    drawScaledPlayer(pitcher, pitcherImg);

    if (batter) {
        let batterImage = getBatterImage(batter, swingAttempt, batterIterator);
        drawScaledPlayer(batter, batterImage);
    }

    drawScaledPlayer(catcherPlayer, catcherImg, catcherPlayer.y + height * .025);

    if (ball.homeRun) return;
    let ballScale = getBallScaleFactor(ball.y);
    let ballWidth = ballImg.width * ballScale;
    let ballHeight = ballImg.height * ballScale;
    image(ballImg, ball.x - ballWidth / 2, ball.y - ballHeight / 2, ballWidth, ballHeight);
}

function drawScoreboard() {
    fill(0);
    rect(20, 20, 190, 90);
    fill(255);
    textSize(14);
    text(`Inning: ${inning} ${topInning ? '▲' : '▼'}`, 30, 40);
    text(`Score - Home: ${score.home}  Away: ${score.away}`, 30, 60);
    text(`Outs: ${outs}`, 30, 80);
    text(`Strikes: ${strikes}`, 30, 100);
}

function resizeUmpire(oldWidth, oldHeight) {
    umpire.relativeX = umpire.x / oldWidth;
    umpire.relativeY = umpire.y / oldHeight;
    umpire.x = umpire.relativeX * width;
    umpire.y = umpire.relativeY * height;
}

function drawUmpire() {
    push();
    rectMode(CENTER);
  
    translate(umpire.x, umpire.y);
  
    // Rotation for spinning
    if (umpire.spinning) {
        rotate(radians(umpire.spinAngle));
        umpire.spinAngle += 10; // Speed of spin
    
        if (umpire.spinAngle >= 360) {
            umpire.spinning = false;
            umpire.spinAngle = 0;
        }
    }
  
    // ** Skin Tone (Light Brown) **
    let skinColor = color(210, 150, 100);
  
    // ** Clothing Colors **
    let shirtColor = color(20, 20, 20); // Black shirt
    let pantsColor = color(100, 100, 100); // Gray pants
    let shoeColor = color(0, 0, 0); // Black shoes
    let hatColor = color(50, 50, 200); // Blue hat
  
    // ** Body (Shirt) **
    fill(shirtColor);
    rect(0, 0, 30, 50, 5); // Shirt
  
    // ** Pants **
    fill(pantsColor);
    rect(0, 30, 25, 30); // Pants
  
    // ** Shoes **
    fill(shoeColor);
    rect(-8, 50, 10, 5, 2); // Left shoe
    rect(8, 50, 10, 5, 2); // Right shoe
  
    // ** Head (Skin Tone) **
    fill(skinColor);
    rect(0, -40, 30, 30, 10); // Head
  
    // ** Eyes **
    fill(0);
    ellipse(-6, -42, 4, 4); // Left eye
    ellipse(6, -42, 4, 4); // Right eye
  
    // ** Nose **
    fill(180, 120, 90);
    triangle(-2, -38, 2, -38, 0, -32);
  
    // ** Mouth **
    fill(255, 0, 0);
    arc(0, -30, 8, 5, 0, PI, CHORD);
  
    // ** Hat **
    fill(hatColor);
    rect(0, -50, 32, 10, 3); // Brim
    rect(0, -55, 20, 10, 3); // Top
  
    // ** Arms **
    stroke(0);
    strokeWeight(3);
    fill(shirtColor);
    if (umpire.armRaisedLeft && umpire.armRaisedRight) {
        line(-20, -20, -60, -60); // Left
        line(20, -20, 60, -60);   // Right
    } else if (umpire.armRaisedLeft) {
        line(0, -20, -20, -60);   // Left arm raised
        line(0, -20, 20, 0);      // Right arm normal
    } else if (umpire.armRaisedRight) {
        line(-20, 0, -60, -20);   // Left arm normal
        line(20, -20, 60, -60);   // Right arm raised
    } else {
        line(0, -20, -20, 0);     // Left
        line(0, -20, 20, 0);      // Right
    }
  
    pop();
  }  

// Handle umpire strike call when a strike occurs
function handleStrikeCall() {
    umpire.armRaisedLeft = true;
    umpire.armTimer = millis();
    popupMessage = "STRIKE!";
    showStrikePopup = true;
    popupTimer = millis();
    setTimeout(() => {
        umpire.armRaisedLeft = false;
        setTimeout(() => {
            umpire.armResetLeft = true;
        }, 500); // Allow arm to reset after half a second
    }, 1000); // Lower the arm after 1 second
}

function handleHomerun() {
    umpire.armRaisedRight = true;
    umpire.armRaisedLeft = true;
    umpire.armTimer = millis();
    showHomerunPopup = true;
    popupTimer = millis();
    setTimeout(() => {
        umpire.armRaisedRight = false;
        umpire.armRaisedLeft = false;
        setTimeout(() => {
            umpire.armReset = true;
        }, 500);
    }, 1000);
    setTimeout(() => {
        umpire.spinning = true;
        umpire.spinAngle = 0;
    }, 500);
}

function handleFoul() {
    umpire.armRaisedRight = true;
    umpire.armTimer = millis();
    popupMessage = "FOUL BALL";
    showFoulPopup = true;
    popupTimer = millis();
    setTimeout(() => {
        umpire.armRaisedRight = false;
        setTimeout(() => {
            umpire.armReset = true;
        }, 500);
    }, 1000);
}

function handleTie(){
    popupMessage = "TIE! EXTRA INNING";
    showFoulPopup = true;
    popupTimer = millis();
}

// Logic handling in-play event popups
function drawPopup() {
    // so that the player can still control runners while the run scored is up
    if (showRunPopup && topInning) {
        push();
        textSize(50);
        fill(255, 0, 0);
        textAlign(CENTER, CENTER);
        text(popupMessage, width / 2, height / 4);
        pop();

        if (millis() - popupTimer > 1500) {
            showRunPopup = false;
        }
    } else if (showStrikePopup || showHomerunPopup || showOutPopup || showFoulPopup || showTiePopup || (showRunPopup && !topInning)) {
        popupDisableInput = true;
        updateEnabledInput();
        push();
        textSize(50);
        fill(255, 0, 0);
        textAlign(CENTER, CENTER);
        text(popupMessage, width / 2, height / 4);
        pop();

        if (millis() - popupTimer > 1500) {
            popupDisableInput = false;
            updateEnabledInput();
            showStrikePopup = false;
            showHomerunPopup = false;
            showRunPopup = false;
            showOutPopup = false;
            showFoulPopup = false;
            showTiePopup = false;
        }
    }
}

// Handle response to user key input
function keyPressed() {
    // pitch select/infielder select
    if(key == 'Escape') {
        settingsClick();
    }
    if ((key === '1' || key === '2' || key === '3') && inputEnabled) {
        if (topInning && ballHit) {
            switch(key) {
                case '1':
                    runBase(key);
                    break;
                case '2':
                    runBase(key);
                    break;
                case '3':
                    runBase(key);
                    break;
                default:
                    break;
            }
        } else if (!topInning && pitchCanChange) {
            switch(key) {
                case '1':
                    setPitchType('fastball');
                    break;
                case '2':
                    setPitchType('curveball');
                    break;
                case '3':
                    setPitchType('changeup');
                    break;
                default:
                    break;
            }
        }
    }
    // Start pitch/skill-check input/swing bat
    if (key === ' ') {
        if(topInning && inputEnabled) {
            if(!hitPowerSlider && !hitDirectionSlider && !hitSkillCheckComplete) {
                startHitSkillCheck();
            }
            else if (hitPowerSlider) {
                powerMultiplier = evaluatePowerMultiplier();
                powerSliderFinalX = hitSliderX;
                hitPowerSlider = false;
                
                setTimeout(() => { 
                    if (powerZoneLevel === "high") directionSliderSpeed = 700;
                    else if (powerZoneLevel === "medium") directionSliderSpeed = 500;
                    else directionSliderSpeed = 300;
                    if(DEBUG) directionSliderSpeed = 100; // for demo and debugging

                    startDirectionSlider();
                }, 300);

                return;
            } 
            else if (hitDirectionSlider) {
                directionValue = evaluateDirectionValue();
                directionSliderFinalX = hitSliderX;
                hitDirectionSlider = false;
                finishHitSkillCheck(); // pitch is triggered
            }
        }

        if (hitSkillCheckComplete && ballMoving && !ballHit && !swingAttempt && inputEnabled) {
            userBatting();
        }

        // If user is pitching
        if (!topInning && inputEnabled) {
            userPitch();
        }
    }
    if ((key === 'e' || key === 'E') && inputEnabled) {
        togglePerspective();
    }
}

// Reset umpire arm position after a short delay
function updateUmpire() {
    if (umpire.armRaised && millis() - umpire.armTimer > 1000) {
        umpire.armRaised = false;
    }
}
// Reset field for next batter
function resetBatter() {
    if (!batter) {
        batter = {
            x: width * 0.5,
            y: height * 0.90,
            running: false,
            speed: 300,
            base: 0,
            safe: false,
            backtracking: false
        };
        lineup[currentBatter % lineup.length] = batter;
        currentBatter++;
    }
    if(!ball.foul) {
        strikes = 0;
    }
    bases[0].occupied = true;
    homeRunHit = false;
    resetBall();
    resetFieldersPosition();
}

function assignEntities() {
    bases = [
        { x: width * 0.5,   y: height * 0.88 },  // Home plate
        { x: width * 0.83,  y: height * 0.58 },  // 1st base
        { x: width * 0.5,   y: height * 0.4 },   // 2nd base
        { x: width * 0.17,  y: height * 0.58 }   // 3rd base
    ];
    for (i = 0; i < 4; ++i) {
        bases[i].number = i;
    }
    setBasedRunners();

    pitcher = { x: width * 0.5, y: height * 0.575, armAngle: 0 };

    ball = {
        x: pitcher.x,
        y: pitcher.y - height*.05,
        speedY: 430,
        speedX: 0,
        throwing: false,
        inAir: false,
        advancingRunner: null,
        strikePitch: false,
        initialSpeedY: 0,
        crossedGround: false,
        isChasing: false,
        homeRun: false,
        pitchType: 'fastball'
    };

    batter = {
        x: width * 0.5,
        y: height * 0.90,
        running: false,
        speed: 300,
        base: 0,
        safe: false,
        backtracking: false
    };

    umpire = { 
      x: width * 0.20, 
      y: height * 0.70, 
      armRaised: false, 
      armTimer: 0,
      spinning: false,
      spinAngle: 0
    };

    catcherPlayer = { x: width * 0.5, y: height * 0.95, state: "idle", isCatcher: true };
    let scale = getScaleFactor(catcherPlayer.y);
    catcherPlayer.catchRadius = catchDistance * scale;

    // Fielders positioned at default
    fielders = generateFielders();
}

function nextInning() {
    popupDisableInput = true;
    playerSideBatting = !playerSideBatting;
    updateEnabledInput();
    batterIterator = 0;
    outs = 0;
    runners = [];
    resetFieldersPosition();
    popupMessage = "3 Outs!\nSwitching Sides"
    popupTimer = millis();
    if (!topInning) inning++;
    topInning = !topInning;

    showOutPopup = true;
    resetBatter();
    runners = [];
    setBasedRunners();

    setTimeout(() => {
        showOutPopup = false;
        popupDisableInput = false;
        updateEnabledInput();
    }, 1500);

    //game ends after 4 innings, adds extra inning if tied until someone wins
    if (topInning && inning > 4){
        if (score.home < score.away){
            if (lastSelectedLevel < MAX_LEVEL) {

                let unlockedLevel = localStorage.getItem("unlockedLevel");
                let thisLevel = localStorage.getItem("thisLevel");
                if(unlockedLevel === null) {
                    localStorage.setItem("unlockedLevel", '2');
                } else if (unlockedLevel === 2 && thisLevel === '2') {
                    localStorage.setItem("unlockedLevel", '3');
                }

                showWinPopup();
            } else {
                showDonePopup();
            }
        }
        else if (score.home > score.away){
            showLosePopup();
        }
        else{
            setTimeout(() => {
                handleTie();
            }, 1600);
        }
}
}
// Load volume settings from local storage
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

// Handle response to user mouse input
function mousePressed() {
    if (!settingMenu && !audioSelectionMenu) {
        if (settingButton.isHovered()) {
            buttonClick();
            setTimeout(() => settingButton.action(), 200);
        }
        if (audioButton.isHovered()) {
            if (DEBUG) {
                buttonClick();
                setTimeout(() => audioButton.action(), 200);
            }
        }
        // temp
        if (Difficulty1.isHovered()) {
            if (DEBUG) {
                buttonClick();
                setTimeout(() => Difficulty1.action(), 200);
            }
        }
        if (Difficulty2.isHovered()) {
            if (DEBUG) {
                buttonClick();
                setTimeout(() => Difficulty2.action(), 200);
            }
        }
        if (Difficulty3.isHovered()) {
            if (DEBUG) {
                buttonClick();
                setTimeout(() => Difficulty3.action(), 200);
            }
        }
        if (loseDemo.isHovered()) {
            if (DEBUG) {
                buttonClick();
                setTimeout(() => loseDemo.action(), 200);
            }
        }
        if (winDemo.isHovered()) {
            if (DEBUG) {
                buttonClick();
                setTimeout(() => winDemo.action(), 200);
            }
        }
    }
    if (!currSong.isPlaying()) {
        currSong.loop();
    }
}

// Handle change of perspective
function togglePerspective() {
    currentPerspective = currentPerspective === "side" ? "topDown" : "side";
}

function audioClick(){
    audioSelectionMenu = true;
    showAudioMenu();
}
function loseClick(){
    showLosePopup();
}
function winClick(){
    if (lastSelectedLevel === 3){
        showDonePopup();
    }
    else{
        let unlockedLevel = localStorage.getItem("unlockedLevel");
        let thisLevel = localStorage.getItem("thisLevel");

        if(unlockedLevel === null) {
            localStorage.setItem("unlockedLevel", '2');
        } else if (thisLevel === '2') {
            localStorage.setItem("unlockedLevel", '3');
        }
        showWinPopup();
    }
}
function startGameClick(){
    buttonClick();
}
if(lastSelectedLevel === 1){
    changeDifficulty(1);
}
if(lastSelectedLevel === 2){
    changeDifficulty(2);      
}
if(lastSelectedLevel === 3){
    changeDifficulty(3);
}

function updateLayoutValues() {
    if (bases && bases.length >= 4) {
        bases[0].x = width * 0.5;
        bases[0].y = height * 0.88;
        bases[1].x = width * 0.83;
        bases[1].y = height * 0.58;
        bases[2].x = width * 0.5;
        bases[2].y = height * 0.4;
        bases[3].x = width * 0.17;
        bases[3].y = height * 0.58;
    }
  
    if (pitcher) {
        pitcher.x = width * 0.5;
        pitcher.y = height * 0.575;
        pitcher.scaleFactor = getScaleFactor(pitcher.y);
    }
  
    if (batter) {
        batter.x = width * 0.5;
        batter.y = height * 0.90;
        batter.scaleFactor = getScaleFactor(batter.y);
    }
  
    if (catcherPlayer) {
        catcherPlayer.x = width * 0.5;
        catcherPlayer.y = height * 0.95;
        let scale = getScaleFactor(catcherPlayer.y);
        catcherPlayer.catchRadius = catchDistance * scale;
    }
  
    if (ball && !ballMoving) {
        ball.x = pitcher.x;
        ball.y = pitcher.y - height * 0.05;
    }
    
    if (topDownCamera && pitcher) {
        let transformedPitcher = sideToTopDown(pitcher.x, pitcher.y);
        topDownCamera.worldAnchor = { x: transformedPitcher.x, y: transformedPitcher.y };
        topDownCamera.screenAnchor = { x: width * 0.5, y: height * 0.75 };
    }
}

function updateRunners(oldWidth, oldHeight) {
    if (runners && runners.length > 0) {
        runners.forEach(runner => {
            runner.relativeX = runner.x / oldWidth;
            runner.relativeY = runner.y / oldHeight;
            runner.x = runner.relativeX * width;
            runner.y = runner.relativeY * height;
        });
    }
}

function updateFielders() {
    let newFielders = generateFielders();
  
    if (fielders && fielders.length === newFielders.length) {
        for (let i = 0; i < fielders.length; i++) {
            fielders[i].x = newFielders[i].x;
            fielders[i].y = newFielders[i].y;
            let newScale = getScaleFactor(fielders[i].y);
            fielders[i].catchRadius = catchDistance * newScale;
        }
    } else {
        fielders = newFielders;
    }
  }

function windowResized() {
    let oldWidth = width;
    let oldHeight = height;

    resizeCanvas(windowWidth, windowHeight);
    
    hitZoneWidth = windowWidth * 0.03;
    hitZoneHeight = hitZoneWidth;
    catchDistance = windowWidth * 0.015;
    groundDistance = windowWidth * 0.005;
    runnerProximity = windowWidth * 0.01;
    strikeCatchThreshold = windowWidth * 0.01;
    xPower = windowWidth / 200;
    yPower = windowHeight / 200;

    updateLayoutValues();
    updateFielders();
    updateRunners(oldWidth, oldHeight);
    resizeUmpire(oldWidth, oldHeight);

    resetGameButtonLocation();
}