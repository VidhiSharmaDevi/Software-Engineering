class Button {
    constructor(label, x, y, width, height, img = null, imgHover = null, action = null, isSettingsButton = false, isAudioMenuButton = false) {
        this.label = label;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.img = img;
        this.imgHover = imgHover;
        this.action = action;
        this.isSettingsButton = isSettingsButton;
        this.isAudioMenuButton = isAudioMenuButton;
    }
  
    display() {
        push();
            let showHover = this.isHovered();
            if ((settingMenu && !this.isSettingsButton) || (audioSelectionMenu && !this.isAudioMenuButton)) {
                showHover = false;
            }   
            if (this.img && this.imgHover) {
                image(
                    showHover ? this.imgHover : this.img, 
                    this.x - this.width / 2, 
                    this.y - this.height / 2, 
                    this.width, 
                    this.height
                );
            } else {
                rectMode(CENTER);
                fill(showHover ? color(100, 150, 255) : color(200));
                rect(this.x, this.y, this.width, this.height, 10);
                fill(0);
                textSize(16);
                textAlign(CENTER, CENTER);
                text(this.label, this.x, this.y);
                cursor(showHover ? 'pointer' : 'default');
            }
        pop();
    }
    
  
    isHovered() {
        return (
            mouseX > this.x - this.width / 2 &&
            mouseX < this.x + this.width / 2 &&
            mouseY > this.y - this.height / 2 &&
            mouseY < this.y + this.height / 2
        );
    }
}  
