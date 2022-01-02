export class KeyboardListener{
    constructor(){
        this.keyCodes = {13: 'enter', 
            37:'left',38:'up',39:'right',40:'down',

            65:'a',83:'s',68:'d',87:'w',

            32:'space'}
        window.addEventListener("keydown",this.keyPressed.bind(this))
        window.addEventListener("keyup",this.keyReleased.bind(this))

        for(let keyCode in this.keyCodes){
            this[this.keyCodes[keyCode]] = false;
        }
    }
    keyPressed(event){
        this[event.key] = true;
    }
    keyReleased(event){
        this[event.key] = false;
    }
}
