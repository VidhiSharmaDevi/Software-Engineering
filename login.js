let bgImage;
let messageDiv;
let registerButton = createButton("I don't have an account");
registerButton.position(width / 2 - 100, height / 2 + 180); // Added more space between buttons
registerButton.mousePressed(() => toggleRegisterForm(loginButton, registerButton));

function preload() {
    bgImage = loadImage('assets/roughititlescreen.png');
    titleIcon = loadImage('assets/OREDTitle.png');
    currSong = loadSound('sounds/mainScreenSound.mp3');
}

function setup() {
    createCanvas(windowWidth, windowHeight);
    createLoginForm();
    loadVolumeSetting();
}

function draw() {
    background(bgImage);
    textSize(64);
    textAlign(CENTER, CENTER);
    image(titleIcon, (width / 2) - 320, -20, 640, 320);
}

function createLoginForm() {
    let usernameInput = createInput();
    usernameInput.position(width / 2 - 125, height / 2 - 40);
    usernameInput.size(250);
    usernameInput.attribute('placeholder', 'Username');
    usernameInput.style('padding', '10px');
    usernameInput.style('font-size', '16px');
    usernameInput.style('border-radius', '10px');
    usernameInput.style('border', '2px solid #ccc');

    let passwordInput = createInput('', 'password');
    passwordInput.position(width / 2 - 125, height / 2 + 40); // Increased space between inputs
    passwordInput.size(250);
    passwordInput.attribute('placeholder', 'Password');
    passwordInput.style('padding', '10px');
    passwordInput.style('font-size', '16px');
    passwordInput.style('border-radius', '10px');
    passwordInput.style('border', '2px solid #ccc');

    let loginButton = createButton('Login');
    loginButton.position(width / 2 - 100, height / 2 + 100); // Increased space between button and password input
    loginButton.size(200, 40);
    loginButton.style('font-size', '18px');
    loginButton.style('padding', '10px');
    loginButton.style('border-radius', '10px');
    loginButton.mousePressed(() => login(usernameInput.value(), passwordInput.value()));

    let registerButton = createButton("I don't have an account");
    registerButton.position(width / 2 - 100, height / 2 + 180); // Increased space between buttons
    registerButton.size(200, 40);
    registerButton.style('font-size', '16px');
    registerButton.style('padding', '10px');
    registerButton.style('border-radius', '10px');
    registerButton.mousePressed(() => toggleRegisterForm(loginButton, registerButton));

    // Create the message div for feedback
    messageDiv = createDiv();
    messageDiv.position(width / 2 - 125, height / 2 + 240); // Adjusted space for the error message
    messageDiv.size(250, 70);
    messageDiv.style('color', 'red');
    messageDiv.style('text-align', 'center');
    messageDiv.style('font-size', '20px'); // Increased font size for the error message
    messageDiv.style('font-weight', 'bold');
    messageDiv.style('padding', '10px');
    messageDiv.style('border-radius', '10px');

    // Add header for Login
    let header = createDiv("LOG IN");
    header.position(width / 2 - 50, height / 2 - 120);
    header.style('font-size', '32px');
    header.style('font-weight', 'bold');
    header.style('color', 'black');
}

function login(username, password) {
    fetch("http://10.22.9.100:3000/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ username, password })
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                localStorage.setItem("token", data.token);
                messageDiv.html("Login successful! Redirecting...");
                setTimeout(() => {
                    window.location.href = "index.html";
                }, 2000);
            } else {
                messageDiv.html(data.error);
            }
        })
        .catch(error => console.error("Error:", error));
}


function toggleRegisterForm() {
    // Clear the login form elements
    removeElements(); // Removes all UI elements (including login fields & header)

    clear();
    background(bgImage);
    textSize(64);
    textAlign(CENTER, CENTER);
    image(titleIcon, (width / 2) - 320, -20, 640, 320);

    // Add header for Register
    let header = createDiv("REGISTER");
    header.position(width / 2 - 75, height / 2 - 180);
    header.style('font-size', '32px');
    header.style('font-weight', 'bold');
    header.style('color', 'black');

    // Add input fields for registration
    let nameInput = createInput();
    nameInput.position(width / 2 - 105, height / 2 - 110);
    nameInput.size(200);
    nameInput.attribute('placeholder', 'Name');
    styleInput(nameInput);

    let surnameInput = createInput();
    surnameInput.position(width / 2 - 105, height / 2 - 40);
    surnameInput.size(200);
    surnameInput.attribute('placeholder', 'Surname');
    styleInput(surnameInput);

    let emailInput = createInput();
    emailInput.position(width / 2 - 105, height / 2 + 30);
    emailInput.size(200);
    emailInput.attribute('placeholder', 'Email');
    styleInput(emailInput);

    let passwordInput = createInput('', 'password');
    passwordInput.position(width / 2 - 105, height / 2 + 100);
    passwordInput.size(200);
    passwordInput.attribute('placeholder', 'Password');
    styleInput(passwordInput);

    let confirmPasswordInput = createInput('', 'password');
    confirmPasswordInput.position(width / 2 - 105, height / 2 + 160);
    confirmPasswordInput.size(200);
    confirmPasswordInput.attribute('placeholder', 'Confirm Password');
    styleInput(confirmPasswordInput);

    // Register button
    let saveButton = createButton('Save');
    saveButton.position(width / 2 - 85, height / 2 + 230);
    styleButton(saveButton);
    saveButton.mousePressed(() => registerUser(nameInput.value(), surnameInput.value(), emailInput.value(), passwordInput.value(), confirmPasswordInput.value()));

    // Back button to return to login
    let backButton = createButton('Back to Login');
    backButton.position(width / 2 - 85, height / 2 + 270);
    styleButton(backButton);
    backButton.mousePressed(() => location.reload());

    // Create message div for alerts
    messageDiv = createDiv();
    messageDiv.position(width / 2 - 125, height / 2 + 300);
    messageDiv.size(250, 70);
    messageDiv.style('color', 'red');
    messageDiv.style('text-align', 'center');
    messageDiv.style('font-size', '16px'); // Slightly smaller alerts for better readability
    messageDiv.style('font-weight', 'bold');
    messageDiv.style('padding', '10px');
    messageDiv.style('border-radius', '10px');
}

// Helper function to style input fields
function styleInput(input) {
    input.style('padding', '10px');
    input.style('font-size', '14px');
    input.style('border-radius', '8px');
    input.style('border', '2px solid #ccc');
}

// Helper function to style buttons
function styleButton(button) {
    button.size(180, 35);
    button.style('font-size', '16px');
    button.style('padding', '8px');
    button.style('border-radius', '8px');
}


// Function to handle returning to the login page
function backToLoginPage() {
    location.reload(); // Reload to reset and go back to the login page
}

function registerUser(name, surname, email, password, confirmPassword) {
    if (!name || !surname || !email || !password || !confirmPassword) {
        messageDiv.html("Please fill in all fields.");
        return;
    }

    if (password !== confirmPassword) {
        messageDiv.html("Passwords do not match.");
        return;
    }

    fetch("http://10.22.9.100:3000/register", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ username: name, password })
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                localStorage.setItem("token", data.token);
                messageDiv.html("Login successful! Redirecting...");
                setTimeout(() => {
                    window.location.href = "index.html"; // Redirect to the game page
                }, 2000);
            } else {
                messageDiv.html(data.error);
            }

        })
        .catch(error => console.error("Error:", error));
}


function saveProgress(username, progress) {
    localStorage.setItem(username, progress);
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

function mousePressed() {
    if (!currSong.isPlaying()) {
        currSong.loop();
    }
}