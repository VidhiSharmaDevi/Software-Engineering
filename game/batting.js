let homeRunHit = false;
let powerXSaveVal;
let hitDirectionSlider = false;
let hitPowerSlider = false;
let hitSkillCheckComplete = false;
let hitSliderX = 0;
let powerSliderFinalX = 0;
let directionSliderFinalX = 0;
let powerSliderSpeed = 300;
let directionSliderSpeed = 400; // will be modified
let powerBarX, powerBarY;
let directionBarX, directionBarY;
let directionValue = 0.0;
let powerMultiplier = 1.0;
let powerZoneLevel = "low";
let targetImage;
let directionImage;

function playerHit() {
    ballHit = true;
    ball.inAir = true;
    playSoundEffect("hitBall");

    let sliderPos = powerBarX + powerSliderFinalX;
    let perfectZoneCenter = powerBarX + (barWidth / 2);
    let diff = abs(sliderPos - perfectZoneCenter);
    let isPerfectPower = diff <= perfectZoneWidth / 2;

    let basePower = powerMultiplier;
    let homeRunChance = Math.random();

    const angle = directionValue;
    const ballVector = p5.Vector.fromAngle(angle).mult(basePower);
    ballVector.y *= -yPower;
    ballVector.x *= xPower;

    ball.speedX = ballVector.x * 60;
    ball.speedY = ballVector.y * 60;
    ball.initialSpeedY = ball.speedY;
    powerXSaveVal = ballVector.x;

    const hitAngle = degrees(directionValue);
    let isFoul = checkFoulByAngle(hitAngle);
    //console.log("HOME RUN CHANCE: ", homeRunChance);

    // 50% chance to get homerun when landing on the middle
    if(isPerfectPower && !isFoul && homeRunChance < 0.5) { 
        basePower = 8.0;
        homeRunHit = true;
    }

    ball.speedY = (-yPower * basePower * 60);
    ball.initialSpeedY = ball.speedY;

    if(isFoul) {
        handleFoul();
        ball.foulSince = millis();
        if(strikes < 2) strikes++; // only get a strike when less than 2 strikes
        ball.foul = true;
        return;
    }

    console.log("angle:", angle.toFixed(2));
    console.log("ballVector.x:", ballVector.x.toFixed(2), "ballVector.y:", ballVector.y.toFixed(2));
    console.log("ball.speedX:", ball.speedX.toFixed(2), "ball.speedY:", ball.speedY.toFixed(2));

    batter.running = true;
    runners.forEach(runner => {
        if (bases[runner.base - 1].occupied) {
            runner.running = true;
            bases[runner.base].occupied = false;
        }
    });
    // Set the runner to be the user's character
    if (batterIterator === 0) batter.player = true;
    setTimeout(() => {
        batter.x = batter.x - width * .05;
        batter.relativeX = batter.x / width;
        batter.relativeY = batter.y / height;
        runners.push(batter);
        bases[0].occupied = false;
        ball.advancingRunner = batter;
        batter = null;
        batterIterator = (batterIterator + 1) % 9; // iterate batter position when user is batting
    }, 75);
}

function playerStrike() {
    ball.strikePitch = true;
    strikes++;
    handleStrikeCall();
    if (DEBUG) console.log("Swing missed! Strike " + strikes);
}

function userBatting() {
    if (ball.y >= batter.y - hitZoneHeight && ball.y <= batter.y && abs(ball.x - batter.x) < hitZoneWidth * 0.5) {
        // Successful swing/hit.
        playerHit()
    } else {
        playerStrike();
    }
    swingAttempt = true;
}


function startDirectionSlider() {
    hitSliderX = random(0, barWidth);
    directionBarX = width / 2 - barWidth / 2;
    directionBarY = height - 100;
    hitDirectionSlider = true;
    hitPowerSlider = false;
}


function startPowerSlider() {
    hitSliderX = random(0, barWidth);
    powerSliderSpeed = 300;
    if(DEBUG) powerSliderSpeed = 100; // for demo and debugging

    powerBarX = width / 2 - barWidth / 2;
    powerBarY = height - 100;
    hitPowerSlider = true;
    hitDirectionSlider = false;
}


function startHitSkillCheck() {
    hitSkillCheckComplete = false;
    startPowerSlider();
}


function finishHitSkillCheck() {
    hitSkillCheckComplete = true;
    if(topInning) {
        botPitch();
    }
    else {
        userPitch();
    }
}


function evaluatePowerMultiplier() {
    let sliderPos = powerBarX + hitSliderX;
    let perfectZoneCenter = powerBarX + (barWidth / 2);
    let diff = abs(sliderPos - perfectZoneCenter);
    
    let multiplier;
    if (diff <= perfectZoneWidth / 2) {
        powerZoneLevel = "high";
        multiplier = 5; // perfect power
    } else if (diff <= goodZoneWidth / 2) {
        powerZoneLevel = "medium";
        multiplier = 4.2; // good power
    } else {
        powerZoneLevel = "low";
        multiplier = 3.5; 
    }
    return multiplier;
}


function evaluateDirectionValue() {
    const bounds = getInPlayBounds();
    const normalized = hitSliderX / barWidth;
    const angleDeg = bounds.minAngle + normalized * (bounds.maxAngle - bounds.minAngle);
    directionValue = radians(angleDeg);
    return directionValue;
}


function checkFoulByAngle(hitAngle) {
    const home = bases[0];
    const first = bases[1];
    const third = bases[3];

    const vFirst = createVector(first.x - home.x, first.y - home.y).normalize();
    const vThird = createVector(third.x - home.x, third.y - home.y).normalize();

    let angleToFirst = degrees(vFirst.heading()); 
    let angleToThird = degrees(vThird.heading());

    // make angles positive
    if (angleToFirst < 0) angleToFirst += 360; 
    if (angleToThird < 0) angleToThird += 360; 
    if (hitAngle < 0) hitAngle += 360;

    const leftLine = Math.min(angleToFirst, angleToThird);
    const rightLine = Math.max(angleToFirst, angleToThird);

    const isFoul = hitAngle < leftLine || hitAngle > rightLine;

    /*
    if (DEBUG) {
        console.log("hitAngle:", hitAngle.toFixed(2));
        console.log("angleToFirst:", angleToFirst.toFixed(2));
        console.log("angleToThird:", angleToThird.toFixed(2));
        console.log("isFoul:", isFoul);
    }
    */

    return isFoul;
}

// function to get the field bounds (between first and third is in play)
function getInPlayBounds() {
    const home = bases[0];
    const first = bases[1];
    const third = bases[3];

    const vFirst = createVector(first.x - home.x, first.y - home.y).normalize();
    const vThird = createVector(third.x - home.x, third.y - home.y).normalize();

    let angleToFirst = degrees(vFirst.heading());
    let angleToThird = degrees(vThird.heading());

    if (angleToFirst < 0) angleToFirst += 360;
    if (angleToThird < 0) angleToThird += 360;

    const foulMargin = 30; 
    const minAngle = Math.min(angleToFirst, angleToThird) - foulMargin;
    const maxAngle = Math.max(angleToFirst, angleToThird) + foulMargin;

    return {
        angleToFirst,
        angleToThird,
        minAngle: constrain(minAngle, 0, 360),
        maxAngle: constrain(maxAngle, 0, 360)
    };
}


function updateHitSkillBar(dt) {
    if(hitPowerSlider) {
        hitSliderX += powerSliderSpeed * dt;
        if (hitSliderX < 0 || hitSliderX > barWidth) {
            powerSliderSpeed *= -1;
            hitSliderX += powerSliderSpeed * dt;
        }
    } 
    else if (hitDirectionSlider) {
        hitSliderX += directionSliderSpeed * dt;
        if (hitSliderX < 0 || hitSliderX > barWidth) {
            directionSliderSpeed *= -1;
            hitSliderX += directionSliderSpeed * dt;
        }
    }
}


function drawPowerSkillCheckBar(dt) {
    fill(100);
    rect(powerBarX, powerBarY, barWidth, barHeight);
    
    let goodZoneX = powerBarX + (barWidth - goodZoneWidth) / 2;
    fill('yellow');
    rect(goodZoneX, powerBarY, goodZoneWidth, barHeight);

    let perfectZoneX = powerBarX + (barWidth - perfectZoneWidth) / 2;
    fill('green');
    rect(perfectZoneX, powerBarY, perfectZoneWidth, barHeight);
    
    fill('red');
    image(targetImage, powerBarX + hitSliderX - barHeight/2, powerBarY, barHeight, barHeight);
}


function drawDirectionSkillBar(dt) {
    fill(100);
    rect(directionBarX, directionBarY, barWidth, barHeight);

    const home = bases[0];
    const first = bases[1];
    const third = bases[3];

    const vFirst = createVector(first.x - home.x, first.y - home.y).normalize();
    const vThird = createVector(third.x - home.x, third.y - home.y).normalize();

    let angleToFirst = degrees(vFirst.heading());
    let angleToThird = degrees(vThird.heading());

    if (angleToFirst < 0) angleToFirst += 360;
    if (angleToThird < 0) angleToThird += 360;

    const foulMargin = 30; 

    const fairStart = Math.min(angleToFirst, angleToThird);
    const fairEnd = Math.max(angleToFirst, angleToThird);
    const minAngle = constrain(fairStart - foulMargin, 0, 360);
    const maxAngle = constrain(fairEnd + foulMargin, 0, 360);

    const totalAngle = maxAngle - minAngle;
    const fairZoneSize = fairEnd - fairStart;
    const foulZoneSize = (totalAngle - fairZoneSize) / 2;
    
    const xLeft = directionBarX + foulZoneSize / totalAngle * barWidth;
    const xRight = directionBarX + (foulZoneSize + fairZoneSize) / totalAngle * barWidth;

    // left foul zone
    fill(100);
    rect(directionBarX, directionBarY, xLeft - directionBarX, barHeight);

    // fair zone
    fill('green');
    rect(xLeft, directionBarY, xRight - xLeft, barHeight);

    // right foul zone
    fill(100);
    rect(xRight, directionBarY, directionBarX + barWidth - xRight, barHeight);

    fill('red');
    image(directionImage, directionBarX + hitSliderX - barHeight / 2, directionBarY, barHeight, barHeight);
}

function getBatterImage(batter, swingAttempt, batterIterator) {
    if (playerSideBatting) {
        if (batterIterator > 0) {
            return swingAttempt ? blueBatterSwung : blueBatterIdle;
        } else {
            return swingAttempt ? playerBatterSwung : playerBatterIdle;
        }
    } else {
        // return swingAttempt ? redBatterSwung : redBatterIdle;
        return swingAttempt ? blueBatterSwung : blueBatterIdle;
    }
}