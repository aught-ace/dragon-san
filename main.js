'use strict';

// 要素
const kemonoCanvas = document.querySelector('#kemono-canvas');
const dragonCanvas = document.querySelector('#dragon-canvas');
const messageDiv = document.querySelector('#message');
const startButton = document.querySelector('#start');

// 画面
const kemonoScreen = new Screen(kemonoCanvas);
const dragonScreen = new Screen(dragonCanvas);

// 画像
const kemonoImage = new Image('./kemono-san.png', 8, 8);
const dragonImage = new Image('./dragon-san.png', 128, 128);

// ケモノの変数
const kemono = {
    color: 0,
    hp: 1,
    level: 0,
    prevFrame: 0, // 前回のアニメーション
    animation: 0,
}
// ドラゴンの変数
const dragon = {
    color: 0,
    hp: 0,
    lickType: 0, // 舐め方
    speed: 1, // 速さ
    intensity: 1, // 強さ
    count: 1, // 回数
    prevFrame: 0, // 前回のアニメーション
    animation: 0, // アニメーション
    phase: 0, // 舐めるフェーズ
}

let isPlaying = false;
let currentStage = 0; // 現在のステージ

// ステージごとの色
const stageColor = [7, 2, 9, 4, 11, 6, 1, 8, 3, 10, 5, 0, 12, 13];
const taste = [
    'いちご',
    'バナナ',
    'メロン',
    'ブルーベリー',
    'ぶどう',
    'もも',
    'ブラックチョコレート',
    'ホワイトチョコレート',
];

// 舐めるパターン
const pattern = [
    [
        [1, 1],
        [1, 2],
        [1, 1],
        [1, 0],
    ],
    [
        [1, 1],
        [1, 2],
        [1, 1],
        [1, 0],
    ],
    [
        [1, 1],
        [2, 0],
        [1, 1],
        [0, 2],
    ],
    [
        [1, 1],
        [2, 0],
        [1, 1],
        [0, 2],
    ],
    [
        [1, 1],
        [2, 1],
        [1, 1],
        [0, 1],
    ],
    [
        [1, 1],
        [2, 1],
        [1, 1],
        [0, 1],
    ],
    [
        [1, 0],
    ],
    [
        [1, 1],
        [1, 0],
        [1, 1],
        [1, 2],
        [1, 1],
        [2, 0],
        [1, 1],
        [0, 2],
        [1, 1],
        [0, 1],
        [1, 1],
        [2, 1],
    ],
];

// 舐め方の名前
const lickName = [
    [
        '揉み込み',
        '揉み解し',
    ],
    [
        '潰し込み',
        '潰し解し',
    ],
    [
        '舐り込み',
        '舐り上げ',
    ],
    [
        '捏ね回し',
        '捏ね上げ',
    ],
    [
        '扱き込み',
        '扱き上げ',
    ],
    [
        '搾り込み',
        '搾り上げ',
    ],
    [
        '圧し舐め',
    ],
    [
        '暴れ舐め',
    ],
];

// シーン一覧
// stand: ケモノが立っている画面
// vs: 対戦アイコン
// start: 開始時のドラゴンの台詞
// closed: 口を閉めた時のドラゴンの台詞
// licking: 舐めている時のドラゴンの台詞
// licked: 舐め回し完了
// opened: 口を開けた時のケモノの台詞
// debu: 口を開けた時にケモノがデブとか言う
// ikari: 無言で口をぎゅっと締める
// oshioki: デブと言ったからお仕置きする
// kanryo: お仕置き完了
// gomennasai: デブと言ったことを謝る
// end: 終了時のドラゴンの台詞
// win: 勝利画面
// lose: 敗北画面
// giveup: ギブアップ
// lookup: 上を向く
// draining: レベルドレイン中
// empty: レベルを0にされた
// swallowed: 呑み込まれる
// gameover: 口を開けるといない
let scene = 'stand';

// 待ち時間
let wait = 256;

// ケモノの最初の台詞
const sceneMessage = {
    vs: [
        '僕、頑張る。',
        'まだまだ先へ行こう。',
        'さあ、次へ進もう。',
        'まだ先は長いよ。',
        'さあ、先へ進もう。',
        '僕なら次も耐えられるはず。',
        'ここからも頑張って耐えていこう。',
        '僕は行ける。',
        'きっと耐えられる。',
        '僕ならできる。',
        '僕はこの先も頑張れる。',
        'いよいよ終盤だ。頑張ろう。',
        'ここが正念場だ。頑張ろう。',
        '最後の戦いだ。僕、頑張る。',
    ],
    start: [
        'かわいいケモノくんは舐めてやろう。せいぜい頑張れよ。',
        '俺の気持ちい舌使いに耐えられるかな。さあ始めるぞ。',
        'ケモノくんは舌を使ってかわいがってやる。気持ちいいから耐えろよ。',
        'こんな所でギブアップしたら招致しないからな。さて、肉厚な舌で舐めてやるぞ。',
        'よくここまで来たな。舌でめちゃくちゃにしてやるよ。',
        '舐められるのは気持ちいいだろ。俺からもたっぷりかわいがってやるからな。',
        '今度の相手は俺だ。そろそろきついか。さあ、このボリューム舌で舐めるぞ。',
        '頑張って耐えるケモノくんには悪いが、思う存分舐め舐めしてやる。せいぜい耐えろ。',
        'かよわいケモノくんにはそろそろ厳しいかもな。気持ちよくても頑張れよ。',
        'ここまで来るときついだろ。それでも容赦せずこの肉厚舌で舐めるぞ。',
        'よくここまで来れたな。褒めてやる。でもギブアップしたら最初からやり直しだからな。',
        '次は幻のドラゴンが待っているぞ。それでもここでギブアップしたらおしまいだからな。',
        '幻のドラゴンである俺の地獄の舐め回しには耐えられないだろうな。仮に耐えきったら幻のドラゴンに会わせてやるよ。',
        'かわいいケモノくん、よく来たな。伝説のドラゴンの最高峰の舌にはきっと耐えられないだろう。じゃあ舐めるぞ。',
    ],
    opened: [
        'はぅぅ、まだやれる…。',
        'あぅ、我慢して耐えなきゃ…。',
        'やぅぅ、きついけど頑張らなきゃ…。',
        'あぅ、きついけど耐えてやる…。',
        'はぅぅ、きつくなってきたけど耐える…。',
        'うぅ、きつくなってきたけど我慢だ…。',
        'あぅぅ、かなりきつくなってきた…。',
        'はぁ、かなりきつくて大変…。',
        'はぁ、はぁ、もう限界…。',
        'はぁ、はぁ、もうだめ…。',
    ],
    licking: [
        '中。気持ちいだろ。',
        'をしてやる。きっと気持ちいぞ。',
        '中。気持ちよさそうだな。',
        'をしてやる。いいぞ、もっと悶えろ。',
        '中。HPがたっぷり出るはずだ。',
        'をしてやる。HPを存分に出せ。',
        '中。中のケモノが気持ちよさそう。',
        'をしてやる。気持ちよくてとろけるぞ。',
    ],
    licked: [
        'そろそろ休ませてやる。',
        'どうだったかな。',
        '気持ちよかったかな。',
        '休憩だ。気持ちよかったか。',
        '休憩だ。気持ちよかっただろ。',
        '休憩だ。頑張ったな。',
    ],
    debu: [
        'ドラゴンさんデブすぎて肉厚すぎる…。',
        'ドラゴンさんデブだからボリュームすごい…。',
        'ドラゴンさんデブすぎて舐められるの気持ちいい…。',
        'ドラゴンさんデブだからきつい…。',
    ],
    oshioki: [
        '中。ケモノくんにはきっと過酷だな。',
        'をしてやる。体がおかしくなりそうだろ。',
        '中。中のケモノには地獄だろうな。',
        'をしてやる。最高に気持ちいいだろ。',
    ],
    kanryo: [
        'お仕置き完了。',
        '処罰完了。',
        'すごく気持ちよかっただろ。',
        '最高の地獄だったろ。',
        '最高に過酷だったな。',
    ],
    gomennasai: [
        'あぅぅ、デブなんて言ってごめんなさい…。',
        'あぅぅ、きつかった…ごめんなさい…。',
        'あぅぅ、デブとか言ってごめんなさい…。',
        'あぅぅ、もうだめかと思った…ごめんなさい…。',
    ],
    end: [
        '終了だ、よく頑張ったな。おいしかったぞ。次に進んでいいぞ。',
        '終了だ、よく耐えたな。小さな体なのによくやった。次に進んでいいぞ。',
        '終了だ、よく頑張ったな。俺の舌も気持ちよかっただろ。次に進んでいいぞ。',
        '終了だ、よく耐えたな。おいしくてかわいいケモノくん。次に進んでいいぞ。',
        '終了だ、よく頑張ったな。最高だったぞ。次に進んでいいぞ。',
        '終了だ、よく耐えたな。かわいいケモノくんには過酷だった事だろう。次に進んでいいぞ。',
        '終了だ、よく頑張ったな。このステージも合格だ。次に進んでいいぞ。',
        '終了だ、よく耐えたな。とろけるほど気持ちよかっただろう。次に進んでいいぞ。',
        '終了だ、よく頑張ったな。今回もさぞきつかっただろう。次に進んでいいぞ。',
        '終了だ、よく耐えたな。かよわい体には応えただろう。次に進んでいいぞ。',
        '終了だ、よく頑張ったな。きつくてとろけそうだっただろう。次に進んでいいぞ。',
        '終了だ、よく耐えたな。すごくおいしかったぞ。次は幻のドラゴンだ。',
        '終了だ、よく頑張ったな。これに耐えられるとは思わなかったぞ。次は伝説のドラゴンだ。',
        '終了だ、よく耐えたな。それじゃあ最後のご褒美だ。',
    ],
    release: [
        'はぁ…はぁ…はぁ…。',
        'はぁ…はぁ…気持ちいい…。',
        'はぁ…はぁ…きつかった…。',
        'はぁ…はぁ…耐えきった…。',
        'はぁ…はぁ…頑張ったよ…。',
    ],
    win: [
        '僕の勝ちだ…。',
        '勝ち抜いたよ…。',
        'なんとか耐え抜いた…。',
        '頑張って耐えきった…。',
    ],
    giveup: [
        'だめええ、ギブアップ!!!',
        'もうだめ、ギブアップ!!!',
        'ギ、ギブアップ!!!',
        'ギブアップ、ギブアップ!!!',
        'ドラゴンさん、ギブアップ!!!',
        'ギブアップ、もうだめええ!!!',
        'もう、だめ、ギブアップ!!!',
    ],
    lookup: [
        '残念、地獄のレベルドレインだ。',
        '残念、レベルドレインの刑だ。',
        '残念、レベルを吸い取ってやる。',
        '残念、貯めたレベルを吸ってやる。',
        '残念、レベルドレインしてやる。',
        '残念、レベル吸い取りの刑だ。',
        '残念、貯まったレベルを全部吸ってやる。',
    ],
    swallowed: [
        'おなかの中で眠るがよい。じゃあな。',
        '今夜はおなかの中で眠れ。じゃあな。',
        'お前もおなかに落ちるがよい。じゃあな。',
    ],
};

// メッセージ表示
const col = (voice = 'dragon', color = 0) => {
    messageDiv.className = `${voice} color-${color}`;
};
const say = (message = '') => {
    messageDiv.textContent = message;
}

// ゲージ描画
const drawParam = (level, gauge) => {
    for(let l = 0; l < level; l++)
        kemonoScreen.draw(kemonoImage, 2, 2, 1, 1, Math.floor(l / 7) * 8, 112 - (l % 7) * 8);
    gauge = Math.max(gauge, 0);
    kemonoScreen.fill('#F99', 1, kemonoCanvas.height - 7, Math.floor(gauge * (kemonoCanvas.width - 2)), 6);
}

// ドラゴン描画
const drawDragon = (sx, sy) => {
    dragonScreen.draw(dragonImage, sx, sy, 1, 1);
};
// ケモ男子描画
const drawKemono = (sx, sy, sw, sh, dx, dy) => {
    kemonoScreen.draw(kemonoImage, sx, sy, sw, sh, dx, dy);
};
// 対戦アイコン描画
const drawVs = () => {
    kemonoScreen.draw(kemonoImage, 0, 4, 2, 2, 64 - 24, 56);
    kemonoScreen.draw(kemonoImage, 2, 0, 2, 1, 64 - 8, 60);
    dragonScreen.draw(kemonoImage, 2, 4, 2, 2, 64 + 8, 56);
};
// 勝利アイコン描画
const drawWin = () => {
    kemonoScreen.draw(kemonoImage, 0, 4, 2, 2, 64 - 8, 48);
    kemonoScreen.draw(kemonoImage, 2, 1, 2, 1, 64 - 8, 64);
};

// mからnまでの乱数
const randomRange = (m, n) => {
    return Math.floor(m + (n - m) * Math.random());
};

// 最初に実行する処理
kemono.color = randomRange(0, 12); // ケモノの色を決める
for(let i = 0; i < 12; i++) stageColor[i] = (stageColor[i] + kemono.color) % 12; // ドラゴンの色を回転する
dragon.color = stageColor[0]; // ドラゴンの色を設定
startButton.className = `color-${kemono.color}`;
kemonoCanvas.className = `color-${kemono.color}`;
dragonCanvas.className = `color-${dragon.color}`;
col('kemono', kemono.color)

// 描画
const draw = () => {
    kemonoScreen.clear();
    dragonScreen.clear();

    drawParam(kemono.level, kemono.hp) // レベルとHP

    if(scene === 'stand') drawKemono(0, 0, 2, 4, 56, 88); // 立ちシーン
    if(scene === 'vs') drawVs(); // 対戦顔アイコン
    if(scene === 'win') drawWin(); // 対戦顔アイコン
    if(scene === 'start') { // 口を開けているシーン
        drawKemono(4 + 4 * (kemono.animation < 0.5? 0 : 1), 0, 4, 2, 24, 46);
        drawDragon(0, 0);
    }
    if(scene === 'opened' || scene === 'debu') { // 口を開けているシーン
        drawKemono(4 + 4 * (kemono.animation < 0.5? 0 : 1), 2, 4, 2, 24, 46);
        drawDragon(0, 0);
    }
    if(scene === 'end') { // 口を閉じているが終了したシーン
        drawDragon(2, 2);
    }
    if(scene === 'release') { // 口を開けて終了する
        drawKemono(4 + 4 * (kemono.animation < 0.5? 0 : 1), 2, 4, 2, 24, 46);
        drawDragon(0, 0);
    }
    if(scene === 'closed' || scene === 'ikari') drawDragon(2, 2); // 口を閉じる
    if(scene === 'licking' || scene === 'oshioki') { // 舐め回し中
        let t = dragon.animation * 4;
        let r = 0;
        if(t < 2 - dragon.intensity) r = 0;
        else if(t < 2) r = 1;
        else if(t < 4 - dragon.intensity) r = 2;
        else r = 3;

        // 舐められてHPが減る
        if(
            (dragon.lickType === 0 || dragon.lickType === 1) &&
            (dragon.prevFrame === 0 && r === 1)
        ) {
            sound(160, 0.08, 55);
        }
        if(
            (dragon.lickType === 0 || dragon.lickType === 1) &&
            (dragon.prevFrame === 2 && r === 3)
        ) {
            kemono.hp -= 0.008 * dragon.speed * dragon.intensity;
            sound(55, 0.08, 160);
        }
        if(
            (dragon.lickType === 2 || dragon.lickType === 3) &&
            (dragon.prevFrame === 0 && r === 1 || dragon.prevFrame === 2 && r === 3)
        ) {
            kemono.hp -= 0.004 * dragon.speed * dragon.intensity;
            sound(110, 0.08, 160);
        }
        if(
            (dragon.lickType === 4 || dragon.lickType === 5) &&
            (dragon.prevFrame === 0 && r === 1)
        ) {
            kemono.hp -= 0.002 * dragon.speed * dragon.intensity;
            sound(220, 0.08, 110);
        }
        if(
            (dragon.lickType === 4 || dragon.lickType === 5) &&
            (dragon.prevFrame === 2 && r === 3)
        ) {
            kemono.hp -= 0.006 * dragon.speed * dragon.intensity;
            sound(110, 0.08, 220);
        }

        drawDragon(
            pattern[dragon.lickType][r][0],
            pattern[dragon.lickType][r][1]);

        dragon.prevFrame = r; // 前回フレームを記録
    }
    if(scene === 'licked' || scene === 'kanryo') { // 舐め回し完了
        drawDragon(2, 2);
    }
    if(scene === 'gomennasai') { // 謝るケモノくん
        drawKemono(4 + 4 * (kemono.animation < 0.5? 0 : 1), 4, 4, 2, 24, 46);
        drawDragon(0, 0);
    }
    if(scene === 'giveup') drawDragon(2, 2);
    if(scene === 'lookup') drawDragon(0, 3);
    if(scene === 'draining') {
        const r = Math.floor(dragon.animation * 4)
        if(wait > 1) drawDragon(3, r);
        else drawDragon(1, 3);
        if(wait > 1 && dragon.prevFrame === 0 && r === 1) {
            kemono.level--;
            sound(220, 0.08, 55);
        }
        dragon.prevFrame = r;
    }
    if(scene === 'empty') {
        drawKemono(4 + 4 * (kemono.animation < 0.5? 0 : 1), 6, 4, 2, 24, 46);
        drawDragon(2, 3);
    }
    if(scene === 'swallowed') {
        const r = Math.floor(Math.min(dragon.animation, 1) * 4)
        if(wait > 2) drawDragon(3, r);
        else drawDragon(1, 3);
        if(wait > 2 && dragon.prevFrame === 0 && r === 1) {
            sound(220, 0.08, 55);
        }
        dragon.prevFrame = r;
    }
    if(scene === 'gameover') {
        drawDragon(0, 0);
    }
};

// フレーム更新
let prevTimestamp = 0; // 前回フレームのタイムスタンプ
const frame = (timestamp) => {
    requestAnimationFrame(frame);
    const deltaTime = (timestamp - prevTimestamp) / 1000;

    if(isPlaying) wait -= deltaTime;

    kemono.animation += deltaTime * (1 - kemono.hp) * 2; // HPが減っているほど速く息をする
    if(kemono.animation >= 1) kemono.animation -= 1;

    // ドラゴンのアニメーション
    if (scene === 'licking' || scene === 'oshioki') {
        dragon.animation += deltaTime * dragon.speed;
        if(dragon.animation >= 1) dragon.animation -= 1;
    }
    if (scene === 'draining') {
        dragon.animation += deltaTime;
        if(dragon.animation >= 1) dragon.animation -= 1;
        if(wait < 1) dragon.animation = 0.99999999;
    }
    if (scene === 'swallowed') {
        dragon.animation += deltaTime;
        if(dragon.animation >= 1) dragon.animation = 0.99999999;
    }

    // ギブアップ
    if((scene === 'licking' || scene === 'oshioki') && kemono.hp <= 0) {
        scene = 'giveup';
        col('kemono', kemono.color);
        wait = 2;
        const r = randomRange(0, sceneMessage[scene].length);
        say(sceneMessage[scene][r]);
    }

    // 回復
    if (
        scene !== 'closed' &&
        scene !== 'ikari' &&
        scene !== 'licking' &&
        scene !== 'oshioki' &&
        scene !== 'licked' &&
        scene !== 'kanryo' &&
        scene !== 'end' &&
        scene !== 'giveup' &&
        scene !== 'lookup' &&
        scene !== 'draining' &&
        scene !== 'empty' &&
        scene !== 'swallowed' &&
        scene !== 'gameover'
    ) kemono.hp = Math.min(kemono.hp + deltaTime * 0.008 * (1 / kemono.hp), 1)


    // 時間経過で次のシーンに移る
    if(wait <= 0) {
        if(scene === 'stand') scene = 'vs';
        else if(scene === 'vs') scene = 'start';
        else if(scene === 'start') scene = 'closed';
        else if(scene === 'closed') scene = 'licking';
        else if(scene === 'licking') {
            scene = 'licked';
            dragon.phase++;
            if(
                currentStage < 12 && dragon.phase >= 5 ||
                currentStage === 12 && dragon.phase >= 10 ||
                currentStage === 13 && dragon.phase >= 255
            ) {
                dragon.phase = 0;
                scene = 'end';
            }
        }
        else if(scene === 'licked') {
            const r = randomRange(0, 3);
            if(!r)
                scene = 'debu';
            else 
                scene = 'opened';
        }
        else if(scene === 'opened') scene = 'closed';
        else if(scene === 'debu') scene = 'ikari';
        else if(scene === 'ikari') scene = 'oshioki';
        else if(scene === 'oshioki') scene = 'kanryo';
        else if(scene === 'kanryo') scene = 'gomennasai';
        else if(scene === 'gomennasai') scene = 'closed';
        else if(scene === 'end') scene = 'release';
        else if(scene === 'release') scene = 'win';
        else if(scene === 'win') {
            kemono.level++;
            scene = 'stand';
            dragon.phase = 0;
            currentStage++;
            dragon.color = stageColor[currentStage];
            dragonCanvas.className = `color-${dragon.color}`;
        }
        else if(scene === 'giveup') scene = 'lookup';
        else if(scene === 'lookup') scene = 'draining';
        else if(scene === 'draining') scene = 'empty';
        else if(scene === 'empty') scene = 'swallowed';
        else if(scene === 'swallowed') scene = 'gameover';

        // 待ち時間
        if(scene === 'stand') wait = 4;
        if(scene === 'vs') wait = 4;
        if(scene === 'start') wait = 6;
        if(scene === 'closed') wait = 2;
        if(scene === 'licking') {
            dragon.animation = 0;
        }
        if(scene === 'licked') {
            wait = 2;
        }
        if(scene === 'opened') wait = 6;
        if(scene === 'debu') wait = 2;
        if(scene === 'ikari') wait = 1;
        if(scene === 'oshioki') {
            dragon.animation = 0;
        }
        if(scene === 'kanryo') wait = 4;
        if(scene === 'gomennasai') wait = 6;
        if(scene === 'end') wait = 4;
        if(scene === 'release') wait = 6;
        if(scene === 'win') wait = 6;
        if(scene === 'giveup') wait = 2;
        if(scene === 'lookup') wait = 2;
        if(scene === 'draining') {
            dragon.animation = 0;
            wait = kemono.level + 1;
        }
        if(scene === 'empty') wait = 6;
        if(scene === 'swallowed') {
            dragon.animation = 0;
            wait = 3;
        }
        if(scene === 'gameover') wait = 256;

        // 台詞の色を指定
        if(
            scene === 'vs' ||
            scene === 'opened' ||
            scene === 'debu' ||
            scene === 'gomennasai' ||
            scene === 'release' ||
            scene === 'win' ||
            scene === 'giveup' ||
            scene === 'draining' ||
            scene === 'empty'
        ) {
            col('kemono', kemono.color);
        } else {
            col('dragon', dragon.color);
        }

        // HPに応じた台詞
        if(
            scene === 'opened'
        ) {
            say(sceneMessage[scene][Math.floor((1 - kemono.hp) * sceneMessage[scene].length * 0.999)]);
            sound(55, 0.08, 220);
        }

        // お仕置き後
        if(
            scene === 'debu' ||
            scene === 'gomennasai'
        ) {
            sound(55, 0.08, 220);
        }

        // 現在のステージに応じた台詞
        if(
            scene === 'vs' ||
            scene === 'start' ||
            scene === 'end'
        ) {
            say(sceneMessage[scene][currentStage]);
        }
        // ランダムな台詞
        if(
            scene === 'licked' ||
            scene === 'debu' ||
            scene === 'kanryo' ||
            scene === 'gomennasai' ||
            scene === 'release' ||
            scene === 'win' ||
            scene === 'giveup' ||
            scene === 'lookup' ||
            scene === 'swallowed'
        ) {
            const r = randomRange(0, sceneMessage[scene].length);
            say(sceneMessage[scene][r]);
        }

        if(scene === 'closed') {
            say('あむ！');
            sound(220, 0.08, 110);
        }
        if(scene === 'licking') {
            dragon.lickType = randomRange(0, 6);
            const q = randomRange(0, lickName[dragon.lickType].length);
            const r = randomRange(0, sceneMessage[scene].length);
            dragon.speed = 1;
            dragon.intensity = 1;
            dragon.count = 1;
            if(!randomRange(0, 4)) dragon.speed = 1.4;
            if(!randomRange(0, 4)) dragon.intensity = 1.4;
            if(!randomRange(0, 4)) dragon.count = 1.4;
            wait = 12 / dragon.speed * dragon.count;
            say(
                '舌を使って' +
                (dragon.intensity === 1? '' : '力強く') +
                (dragon.speed === 1? '' : '速く') +
                (dragon.count === 1? '' : '何度も') +
                lickName[dragon.lickType][q] +
                sceneMessage[scene][r]
            );
        }
        if(scene === 'ikari') {
            say('ばむ!!');
            sound(220, 0.08, 55);
        }
        if(scene === 'oshioki') {
            dragon.lickType = randomRange(0, 6);
            const q = randomRange(0, lickName[dragon.lickType].length);
            const r = randomRange(0, sceneMessage[scene].length);
            dragon.speed = 1.2;
            dragon.intensity = 1.2;
            dragon.count = 1.2;
            if(!randomRange(0, 2)) dragon.speed = 1.6;
            if(!randomRange(0, 2)) dragon.intensity = 1.6;
            if(!randomRange(0, 2)) dragon.count = 1.6;
            wait = 12 / dragon.speed * dragon.count;
            say(
                'わからせが必要だ。' +
                (dragon.intensity === 1.2? '' : '思い切り') +
                (dragon.speed === 1.2? '' : '激しく') +
                (dragon.count === 1.2? '' : '執拗に') +
                lickName[dragon.lickType][q] +
                sceneMessage[scene][r]
            );
        }
        if(scene === 'stand') {
            col('kemono', kemono.color)
            say(`レベルは${kemono.level}だ。`);
        }
        if(scene === 'draining') {
            say('!!!!!!!!!!!');
        }
        if(scene === 'empty') {
            say('はぁっはぁっはぁっはぁっはぁっ');
        }
        if(scene === 'gameover') {
            say('GAME OVER');
        }
    }

    draw(); // 描画
    prevTimestamp = timestamp;
};
requestAnimationFrame(frame);

// 初期化
const init = () => {
    kemono.hp = 1;
    kemono.level = 0;
    wait = 4;
    scene = 'stand';
    say('レベルはまだ0だ。');
    isPlaying = true;
    dragon.phase = 0;
}

// スタートボタンをおした
startButton.addEventListener('click', (e)=>{
    audioStart();
    init();
    startButton.className = 'none';
});