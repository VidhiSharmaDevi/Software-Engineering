let initialPopup;

function createInitialPopup() {
    const style = document.createElement("style")
    style.textContent= `
    .initialPopup {
        position: fixed;
        display: none;
        align-items: center;
        justify-content: center;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
    }
    .initialPopup-content {
        border: 1px solid black;
        background: url('assets/premenu.png');
        background-size: cover;
        padding: 30px 45px;
        border-radius: 8px;
        text-align: center;
        box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.2);
        width: 300px;
        max-width: 80%;
    }
    .closeButton {
        background:rgb(233, 201, 23);
        border: 1px solid black;
        padding: 10px 20px;
        font-size: 24px;
        cursor: pointer;
        border-radius: 5px;
        margin-top: 0px;
        font-weight: bold;
        color: black; 
        width: 100%;
    }
    .closeButton:hover {
        background-color:rgb(255, 225, 57);
        color: black;
    }
    .message{
        color: white;
        font-size: 48px;
        padding: 10px;
        }
    `;
    document.head.appendChild(style);

    //structure of popup
    initialPopup = document.createElement("div");
    initialPopup.classList.add("initialPopup");
    initialPopup.innerHTML = `
   <div class="initialPopup-content">
            <p class="message"><b>Welcome to Batterground!</b></p>
            <button class="closeButton" id="closeButton">Enter Ballpark</button>
    </div>
`;

document.body.appendChild(initialPopup);

closeButton = initialPopup.querySelector("#closeButton");
 //events- on button click
closeButton.addEventListener("click", () => {
    buttonClick();
    hideInitialPopup();
});

}

function hideInitialPopup(){
    initialPopup.style.display = "none";
    gameState = "menu";  // Set game state to menu after popup closes
}

function showInitialPopup(){
    initialPopup.style.display = "flex"; 
}