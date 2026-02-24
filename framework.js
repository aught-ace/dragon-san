'use strict';

// 画面クラス
const Screen = class {
    #canvas = null;
    #context = null;

    constructor (canvas = null) {
        this.#canvas = canvas;
        this.#context = canvas.getContext('2d'); 
    }

    clear () {
        this.#context.clearRect(0, 0, this.#canvas.width, this.#canvas.height);
    }

    // 画像描画メソッド
    draw (image = null, sx, sy, sw, sh, dx = 0, dy = 0, alpha = 1, operation = 'source-over', xReverse = false, yReverse = false) {
        if(image == undefined) return;
        if(!image.isLoaded) return;

        // 反転の状態を保存
        this.#context.save();

        let dw = sw;
        let dh = sh;

        // 左右反転
        if(xReverse) {
            this.#context.scale(-1, 1);
            dx = -dx;
            dw = -dw;
        }
        // 上下反転
        if(yReverse) {
            this.#context.scale(1, -1);
            dy = -dy;
            dh = -dh;
        }

        this.#context.globalAlpha = alpha; // 不透明度
        this.#context.globalCompositeOperation = operation; // 合成の仕方

        this.#context.drawImage(
            image.element,
            sx * image.cw,
            sy * image.ch,
            sw * image.cw,
            sh * image.ch,
            dx,
            dy,
            dw * image.cw,
            dh * image.ch
        );
        
        this.#context.restore();
    }

    fill (color, x, y, w, h) {
        this.#context.fillStyle = color;
        this.#context.fillRect(x, y, w, h);
    }

    get context() {
        return this.#context;
    }
}

// 画像クラス
const Image = class {
    #image = null;
    #isLoaded = false;
    #cw = 8;
    #ch = 8;

    constructor (source = null, cw = 8, ch = 8) {
        this.#image = document.createElement('img');
        this.#image.addEventListener('load', (e) => {
            this.#isLoaded = true;
        });
        this.#image.src = source;
        this.#cw = cw;
        this.#ch = ch;
    }

    // ゲッター
    get cw () {
        return this.#cw;
    }
    get ch () {
        return this.#ch;
    }

    // 読み込み済みかどうかを得る
    get isLoaded () {
        return this.#isLoaded;
    }

    // 要素を得る
    get element () {
        return this.#image;
    }
}


let audioContext = null;
let oscNode;
let gainNode;
const audioStart = async() =>
{
    if(audioContext != null) return

    audioContext = new AudioContext()

    if (audioContext.state === "suspended") await audioContext.resume()

    oscNode = new OscillatorNode(audioContext)
    oscNode.type = 'sine'
    oscNode.frequency.value = 55

    gainNode = new GainNode(audioContext)
    gainNode.gain.value = 0

    oscNode.connect(gainNode).connect(audioContext.destination)
    oscNode.start(0)
    
    sound(55, 0.02, 220)
}

const sound = (start, second, end) =>
{
    const now = audioContext.currentTime;

    gainNode.gain.setValueAtTime(0, now);
    oscNode.frequency.setValueAtTime(start, now);
    gainNode.gain.linearRampToValueAtTime(0.5, now + 0.001)
    oscNode.frequency.linearRampToValueAtTime(end, now + second)
    gainNode.gain.linearRampToValueAtTime(0, now + second)
}