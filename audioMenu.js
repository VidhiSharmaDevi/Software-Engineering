let audioMenu;
let exitButton;
let audio1Button;
let audio2Button;
let audio3Button;
let audio4Button;
let audio5Button;


function createAudioMenu(){
const style = document.createElement("style")
style.textContent= `
.audioMenu {
 position: fixed;
        display: none;
        align-items: center;
        justify-content: center;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
}
.audioMenu-content {
        border: 1px solid #000000;
        background: #FFFFFF;
        padding: 20px;
        border-radius: 8px;
        text-align: center;
        box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.2);
        width: 300px;
        max-width: 80%;
   
}
.audioMenu-button {
        background: #DCDCDC;
        border: 1px solid #000000;
        padding: 10px 20px;
        font-size: 16px;
        cursor: pointer;
        border-radius: 5px;
        margin-top: 5px;
        font-weight: bold;
        color: #000000; 

    }
.audioMenu-button:hover {
        background-color: #6495FF;
        color: #000000;
    }    
.exit-button {
        cursor: pointer;
        color: #000000;
        font-size: 20px;
        float: right;
    }   
 .audio-button {
        display: flex;
        flex-direction: column; 
        align-items: center; 
        gap: 10px; 
        width: 100%; 
}
p{ /* centers title */
    font-size: 20px;
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
    width: 100%;
} 
`;
document.head.appendChild(style);

//structure of the audio menu 
audioMenu = document.createElement("div");
audioMenu.classList.add("audioMenu");
audioMenu.innerHTML = `
<div class = "audioMenu-content">
<span class= "exit-button">&times;</span>
<p><b>Audio Selection</b></p>
<div class= "audio-button">
<button id="audio1" class = "audioMenu-button"> Audio 1 </button>
<button id="audio2" class = "audioMenu-button"> Audio 2 </button>
<button id="audio3" class = "audioMenu-button"> Audio 3 </button>
<button id="audio4" class = "audioMenu-button"> Audio 4 </button>
<button id="audio5" class = "audioMenu-button"> Audio 5 </button>
</div></div>
`;
document.body.appendChild(audioMenu);


//get audioMenu elements 
exitButton = audioMenu.querySelector(".exit-button");
audio1Button = audioMenu.querySelector("#audio1");
audio2Button = audioMenu.querySelector("#audio2");
audio3Button = audioMenu.querySelector("#audio3");
audio4Button = audioMenu.querySelector("#audio4");
audio5Button = audioMenu.querySelector("#audio5");


//events- on button click
exitButton.addEventListener("click", () => {
    hideAudioMenu();
    buttonClick();
});
audio1Button.addEventListener("click", (event) => {
    buttonClick();
    updateAudio(event);
});
audio2Button.addEventListener("click", (event) => {
    buttonClick();
    updateAudio(event);
});
audio3Button.addEventListener("click", (event) => {
    buttonClick();
    updateAudio(event);
});
audio4Button.addEventListener("click", (event) => {
    buttonClick();
    updateAudio(event);
});
audio5Button.addEventListener("click", (event) => {
    buttonClick();
    updateAudio(event);
   
});
}
function showAudioMenu() {
    audioMenu.style.display = "flex";
}

function hideAudioMenu(){
    audioSelectionMenu = false;
    audioMenu.style.display = "none";
}

function updateAudio(event){
        let action = event.target.id;
        if (currSong) {
            currSong.stop();  // Pause the current song
     switch (action){
        case "audio1":
            currSong = audio1;
            break;
        case "audio2":
            currSong = audio2;
            break;
        case "audio3":
            currSong = audio3;
            break;
        case "audio4":
            currSong = audio4;
            break;
        case "audio5":
            currSong = audio5;
            break;
        default:
            console.log("Unknown selection");
            return;
    }
    if (currSong) {
        currSong.play();
        currSong.loop();
}
}
}