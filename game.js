const PLAYER_OFFSET_X = 40;
const PLAYER_OFFSET_Y = 80;
const PLAYER_WIDTH = 80;
const PLAYER_HEIGHT = 120;
const SPRITE_Y_OFFSET = 20;
const MAX_POWER = 1600;

let hitZoneWidth, hitZoneHeight, catchDistance, groundDistance, runnerProximity;
let pitcher, batter, ball, bases, fielders, runners = [];
let lineup, currentBatter = 0;
let score = { home: 0, away: 0 }, outs = 0, strikes = 0, inning = 1, topInning = true;
let ballMoving = false, ballHit = false, pitchAnimation = false, swingAttempt = false;
let settingMenu = false, inputEnabled = false;
let ballCaughtThisFrame = false;
let outPopupTime = 0;
let currentPerspective = "side";

let initialFielderPositions = [];
let accumulator = 0;
const fixedDt = 1/60;
let xPower;
let yPower;

let bgImage, batterGif;
let settingButton, returnButton;
let tempSwapPerspective;

let umpire;
let showStrikePopup = false;
let showRunPopup = false;
let showOutPopup = false;
let showHomerunPopup = false;
let showFoulPopup = false;
let popupTimer = 0;
let popupMessage = "";

let topDownCamera;

let audioSelectionMenu = false;
let audioButton;

// Difficulty
let generalDifficultyScale = 1;

function preload() {
    bgSideImage = loadImage('assets/newFieldSide.png');
    bgTopImage = loadImage('assets/flat_field1.png');
    batterIdle = loadImage('assets/temp_assets/sprites/batterBlueIdle.png');
    batterSwung = loadImage('assets/temp_assets/sprites/batterBlueSwing.png');
    fielderIdleGif = loadImage('assets/temp_assets/IDLE1.gif');
    runnerRunningGif = loadImage('assets/temp_assets/RRUNGIF.gif');
    fielderRunningGif = loadImage('assets/temp_assets/LRUNGIF.gif');
    runnerIdle = loadImage('assets/temp_assets/sprites/01_idle2.png');
    catcherImg = loadImage('assets/temp_assets/sprites/01_Catch.png');
    ballImg = loadImage('assets/Baseball1.png');

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

    assignEnitities();
    let transformedPitcher = sideToTopDown(pitcher.x, pitcher.y);
    topDownCamera = {
        worldAnchor: { x: transformedPitcher.x, y: transformedPitcher.y },
        screenAnchor: { x: width * 0.5, y: height * .75 },
        scaleX: .4,
        scaleY: 1
    };

    initialFielderPositions = fielders.map(fielder => ({ x: fielder.x, y: fielder.y }));

    lineup = [batter];
    resetBall();

    fielders.forEach(fielder => {
        fielder.state = "idle";
    });

    settingButton = new Button("Settings", width - 80, 40, 125, 40, null, null, () => settingsClick());
    returnButton = new Button("Menu", width - 80, 90, 125, 40, null, null, () => returnToMenu());
    tempSwapPerspective = new Button("Perspective", width - 80, 140, 125, 40, null, null, () => togglePerspective());
    audioButton = new Button("Audio", width - 80, 190, 125, 40, null, null, () => audioClick());

    Difficulty1 = new Button("make Normal", width - 80, 240, 125, 40, null, null, () => changeDifficulty(1));
    Difficulty2 = new Button("make Hard", width - 80, 290, 125, 40, null, null, () => changeDifficulty(2));
    Difficulty3 = new Button("make Impossible", width - 80, 340, 125, 40, null, null, () => changeDifficulty(3));
    createModal();
    createAudioMenu();
    inputEnabled = true;
}

function draw() {
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
    } else {
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

    if(hitPowerSlider || hitDirectionSlider) {
        updateHitSkillBar(dt);
        drawSkillCheckBar(dt);
    }

    // Draw the HUD
    push();
    drawScoreboard();
    settingButton.display();
    returnButton.display();
    tempSwapPerspective.display();
    if (DEBUG){
        audioButton.display();
        Difficulty1.display();
        Difficulty2.display();
        Difficulty3.display();
    }
    pop();

    push();
    drawPopup();
    pop();
    
    // Game logic
    while (accumulator >= fixedDt) {
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
            ball.y += ball.speedY * fixedDt;
            // Swing before ball in hit zone
            if (ball.y >= batter.y && abs(ball.x - batter.x) < hitZoneWidth && !swingAttempt) {
                swingAttempt = true;
                playerStrike();
            }
        }
        // hit ball movement
        if (ballMoving && !ball.throwing) {
            if (ballHit && ball.homeRun) {
                let unsafeRunners = runners.filter(runner => runner.running);
                if (unsafeRunners.length === 0) resetBatter();
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
            if (!homeRunHit && !ball.foul) {
                checkFielderCatch();
            }
        }

        // throwing ball movement
        if (ball.throwing) {
            ball.x += ball.speedX * fixedDt;
            ball.y += ball.speedY * fixedDt;
           
            // determine runner to try and get out
            let targetFielder = ball.targetFielder;
            // let advancingRunner = ball.advancingRunner;
            // let targetRunner = getNearestUnsafeRunner(targetFielder);
            // // let chosenRunner = targetRunner || advancingRunner;
            // let chosenRunner = targetRunner;

            // if (!advancingRunner) {
            //     advancingRunner = targetRunner;
            // }
            // if (!chosenRunner) {
            //     console.error("No valid runner found! Stopping play.");
            //     ball.throwing = false;
            //     resetBatter();
            //     return;
            // }

            // Fielder caught ball in attempt to out a runner
            if (targetFielder && dist(ball.x, ball.y, targetFielder.x, targetFielder.y) < targetFielder.catchRadius) {
                //if (DEBUG) console.log(`Fielder for holding/running runner of base ${chosenRunner.base}, catches the ball`);
                // ball.throwing = false;

                // if (targetFielder.isInfielder) {
                //     let runnerAtFielderBase = runners.find(runner => runner.base === chosenRunner.base);
                //     let baseVal = chosenRunner.base;

                //     let backtrackFielder = getFielderForBase(baseVal);

                //     if (runnerAtFielderBase && !runnerAtFielderBase.safe) {
                //         if (runnerAtFielderBase.backtracking && backtrackFielder === targetFielder) {
                //             outs++;
                //             ball.throwing = false;
                //             ball.caught = true;
                //             resetBatter();
                //             if (DEBUG) console.log("outs to", outs);
                //             runners = runners.filter(r => r !== runnerAtFielderBase);
                //             if (outs >= 3) {
                //                 nextInning();
                //                 return;
                //             }
                //             return;
                //         }
                //     }
                // }

                // if (outs >= 3) {
                //     nextInning();
                //     return;
                // }
                handleCatch(targetFielder);

                // let targetRunner = getNearestUnsafeRunner(targetFielder);
                // if (targetRunner) {
                //     if (DEBUG) console.log(`Throwing to next unsafe runner to base ${targetRunner.base + 1}`);
                //     handleGroundThrow(targetFielder);
                // } else {
                //     resetBatter();
                // }
            }
        }
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
        homeRun: false,
        foul: false,
        foulSince: null
    };
    ballMoving = false;
    ballHit = false;
    swingAttempt = false;
    runners.forEach(runner => {
        runner.safe = false;
    });
    hitSkillCheckComplete = false; 
    hitDirectionSlider = false; 
    hitPowerSlider = false;
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
        let img = runner.running ? runnerRunningGif : runnerIdle;
        drawScaledPlayer(runner, img);
    });

    drawScaledPlayer(pitcher, fielderIdleGif);

    if (batter) {
        if (swingAttempt) drawScaledPlayer(batter, batterSwung);
        else drawScaledPlayer(batter, batterIdle);
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


// Draw the umpire on the field
function drawUmpire() {
    push();
    rectMode(CENTER);

    // ** Skin Tone (Light Brown) **
    let skinColor = color(210, 150, 100);

    // ** Clothing Colors **
    let shirtColor = color(20, 20, 20); // Black shirt
    let pantsColor = color(100, 100, 100); // Gray pants
    let shoeColor = color(0, 0, 0); // Black shoes
    let hatColor = color(50, 50, 200); // Blue hat

    // ** Body (Shirt) **
    fill(shirtColor);
    rect(umpire.x, umpire.y, 30, 50, 5); // Shirt

    // ** Pants **
    fill(pantsColor);
    rect(umpire.x, umpire.y + 30, 25, 30); // Pants

    // ** Shoes **
    fill(shoeColor);
    rect(umpire.x - 8, umpire.y + 50, 10, 5, 2); // Left shoe
    rect(umpire.x + 8, umpire.y + 50, 10, 5, 2); // Right shoe

    // ** Head (Skin Tone) **
    fill(skinColor);
    rect(umpire.x, umpire.y - 40, 30, 30, 10); // Head shape

    // ** Eyes **
    fill(0);
    ellipse(umpire.x - 6, umpire.y - 42, 4, 4); // Left eye
    ellipse(umpire.x + 6, umpire.y - 42, 4, 4); // Right eye

    // ** Nose **
    fill(180, 120, 90);
    triangle(umpire.x - 2, umpire.y - 38, umpire.x + 2, umpire.y - 38, umpire.x, umpire.y - 32);

    // ** Mouth (Neutral expression) **
    fill(255, 0, 0);
    arc(umpire.x, umpire.y - 30, 8, 5, 0, PI, CHORD); // Mouth shape

    // ** Hat (Blue) **
    fill(hatColor);
    rect(umpire.x, umpire.y - 50, 32, 10, 3); // Brim
    rect(umpire.x, umpire.y - 55, 20, 10, 3); // Top

    // ** Arms (Shirt Color) **
    stroke(0);
    strokeWeight(3);
    fill(shirtColor);
    if (umpire.armRaised) {
        line(umpire.x, umpire.y - 20, umpire.x - 20, umpire.y - 60); // Raised left arm
    } else {
        line(umpire.x, umpire.y - 20, umpire.x - 20, umpire.y); // Normal left arm
    }
    line(umpire.x, umpire.y - 20, umpire.x + 20, umpire.y); // Right arm

    pop();
}

// Handle umpire strike call when a strike occurs
function handleStrikeCall() {
    umpire.armRaised = true;
    umpire.armTimer = millis();
    popupMessage = "STRIKE!";
    showStrikePopup = true;
    popupTimer = millis();
    if (DEBUG) console.log("Umpire arm raised!");
    setTimeout(() => {
        umpire.armRaised = false;
        setTimeout(() => {
            umpire.armReset = true;
        }, 500); // Allow arm to reset after half a second
    }, 1000); // Lower the arm after 1 second
}

// Logic handling in-play event popups
function drawPopup() {
    if (showStrikePopup || showHomerunPopup || showOutPopup || showRunPopup || showFoulPopup) {
        inputEnabled = false;

        push();
        textSize(50);
        fill(255, 0, 0);
        textAlign(CENTER, CENTER);
        text(popupMessage, width / 2, height / 4);
        pop();
        
        // Hide the popup after 1.5 seconds
        if (millis() - popupTimer > 1500) {
            inputEnabled = true;
            showStrikePopup = false;
            showRunPopup = false;
            showHomerunPopup = false;
            showOutPopup = false;
            showFoulPopup = false;
        }
    }
}

// Set field up for next inning
function nextInning() {
    inputEnabled = false;
    outs = 0;
    runners = [];
    resetFieldersPosition()
    if (!topInning) inning++;
    topInning = !topInning;

    showOutPopup = true;
    popupMessage = "3 Outs!\nSwitching Sides"
    popupTimer = millis();
    resetBatter();
    runners = [];

    setTimeout(() => {
        showOutPopup = false;
        inputEnabled = true;
    }, 1500);
}

// Handle response to user key input
function keyPressed() {
    // Start pitch/skill-check input/swing bat
    if (key === ' ') {
        if(topInning) {
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
    homeRunHit = false;
    //if (DEBUG) console.log(ball.initialSpeedY);
    resetBall();
    resetFieldersPosition();
}

function assignEnitities() {
    bases = [
        { x: width * 0.5,   y: height * 0.88 },  // Home plate
        { x: width * 0.83,  y: height * 0.58 },  // 1st base
        { x: width * 0.5,   y: height * 0.4 },   // 2nd base
        { x: width * 0.17,  y: height * 0.58 }   // 3rd base
    ];

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
        homeRun: false
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
      armTimer: 0
    };

    catcherPlayer = { x: width * 0.5, y: height * 0.95, state: "idle", isCatcher: true };

    // Fielders positioned at default
    fielders = generateFielders();
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
        if (returnButton.isHovered()) {
            buttonClick();
            setTimeout(() => returnButton.action(), 200);
        }
        if (tempSwapPerspective.isHovered()) {
            buttonClick();
            setTimeout(() => tempSwapPerspective.action(), 200);
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
    }
    if (!currSong.isPlaying()) {
        currSong.loop();
    }
}

// Handle change of perspective
function togglePerspective() {
    currentPerspective = currentPerspective === "side" ? "topDown" : "side";
}
// Handle opening settings
function settingsClick() {
    settingMenu = true;
    showSettings();
}
// Sound effect for clicking buttons
function buttonClick() {
    playSoundEffect("buttonSound");
}
// Handle returning to menu page
function returnToMenu() {
    localStorage.setItem("gameState", "menu");
    window.location.href = "index.html";
}

function audioClick(){
    audioSelectionMenu = true;
    showAudioMenu();
    console.log("Button clicked!");  // To check if the button event runs
    console.log("audioMenu:", audioMenu);  // To check if audioMenu exists
}
