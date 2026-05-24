/*****************************************************
 * UST 随机生成器 - 核心逻辑
 * 新增：Shift-JIS 编码，解决 OpenUTAU 乱码问题
 *****************************************************/

// ---------- 音名映射 ----------
const NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

// 当前使用的歌词库 (默认拼音，来自 lyrics.js)
let languageLibrary = PINYIN_LIB;

// ---------- DOM 元素引用 ----------
const lyricLibSelect = document.getElementById('lyricLibSelect');
const libCount = document.getElementById('libCount');

const shortestNoteSlider = document.getElementById('shortestNote');
const longestNoteSlider = document.getElementById('longestNote');
const lowestNoteSlider = document.getElementById('lowestNote');
const highestNoteSlider = document.getElementById('highestNote');
const bpmSlider = document.getElementById('bpm');
const noteCountSlider = document.getElementById('noteCount');
const pauseIntervalSlider = document.getElementById('pauseInterval');
const rDurationSlider = document.getElementById('rDuration');

const shortestNoteInput = document.getElementById('shortestNoteInput');
const longestNoteInput = document.getElementById('longestNoteInput');
const lowestNoteInput = document.getElementById('lowestNoteInput');
const highestNoteInput = document.getElementById('highestNoteInput');
const bpmInput = document.getElementById('bpmInput');
const noteCountInput = document.getElementById('noteCountInput');
const pauseIntervalInput = document.getElementById('pauseIntervalInput');
const rDurationInput = document.getElementById('rDurationInput');

const lowestNoteName = document.getElementById('lowestNoteName');
const highestNoteName = document.getElementById('highestNoteName');

const smoothPitchCheck = document.getElementById('smoothPitch');
const smoothLengthCheck = document.getElementById('smoothLength');
const generateBtn = document.getElementById('generateBtn');
const resetBtn = document.getElementById('resetBtn');
const statusBar = document.getElementById('statusBar');
const downloadLinksDiv = document.getElementById('downloadLinks');

// ---------- 工具函数 ----------
function getNoteName(noteNum) {
    const octave = Math.floor(noteNum / 12) - 1;
    const index = noteNum % 12;
    return NOTE_NAMES[index] + octave;
}

function noteLengthToSeconds(length, bpm) {
    return length * (60 / bpm) / 480;
}

function secondsToUSTLength(seconds, bpm) {
    return Math.round(seconds * bpm * 480 / 60);
}

// ---------- 双向同步 ----------
function bindSliderAndInput(slider, input, callback) {
    const fromSlider = () => {
        const val = parseFloat(slider.value);
        input.value = val;
        if (callback) callback(val);
    };
    const fromInput = () => {
        let val = parseFloat(input.value);
        if (isNaN(val)) return;
        val = Math.min(parseFloat(input.max), Math.max(parseFloat(input.min), val));
        input.value = val;
        slider.value = val;
        if (callback) callback(val);
    };

    slider.addEventListener('input', fromSlider);
    input.addEventListener('input', fromInput);
    input.addEventListener('blur', fromInput);
    fromSlider();
}

function bindPitchSliderAndInput(slider, input, nameSpan) {
    const updateName = (val) => {
        nameSpan.textContent = getNoteName(Math.round(val));
    };
    bindSliderAndInput(slider, input, updateName);
}

bindSliderAndInput(shortestNoteSlider, shortestNoteInput);
bindSliderAndInput(longestNoteSlider, longestNoteInput);
bindPitchSliderAndInput(lowestNoteSlider, lowestNoteInput, lowestNoteName);
bindPitchSliderAndInput(highestNoteSlider, highestNoteInput, highestNoteName);
bindSliderAndInput(bpmSlider, bpmInput);
bindSliderAndInput(noteCountSlider, noteCountInput);
bindSliderAndInput(pauseIntervalSlider, pauseIntervalInput);
bindSliderAndInput(rDurationSlider, rDurationInput);

// 歌词库切换
lyricLibSelect.addEventListener('change', () => {
    if (lyricLibSelect.value === 'pinyin') {
        languageLibrary = PINYIN_LIB;
        libCount.textContent = `共 ${PINYIN_LIB.length} 个音节`;
    } else {
        languageLibrary = HIRAGANA_LIB;
        libCount.textContent = `共 ${HIRAGANA_LIB.length} 个假名/拗音`;
    }
});
libCount.textContent = `共 ${PINYIN_LIB.length} 个音节`;

// ---------- Shift-JIS 编码器（覆盖日文假名及 ASCII）----------
const SHIFT_JIS_MAP = new Map([
    // 半角 ASCII 字符 (0x00-0x7E 直接映射，0x20 空格等)
    // 只列出非控制字符的映射，实际处理时 0x20-0x7E 都是一字节
    // 平假名 (清音)
    ['\u3042', 0x82A0], // あ
    ['\u3044', 0x82A2], // い
    ['\u3046', 0x82A4], // う
    ['\u3048', 0x82A6], // え
    ['\u304A', 0x82A8], // お
    ['\u304B', 0x82A9], // か
    ['\u304D', 0x82AB], // き
    ['\u304F', 0x82AD], // く
    ['\u3051', 0x82AF], // け
    ['\u3053', 0x82B1], // こ
    ['\u3055', 0x82B3], // さ
    ['\u3057', 0x82B5], // し
    ['\u3059', 0x82B7], // す
    ['\u305B', 0x82B9], // せ
    ['\u305D', 0x82BB], // そ
    ['\u305F', 0x82BD], // た
    ['\u3061', 0x82BF], // ち
    ['\u3064', 0x82C1], // つ
    ['\u3066', 0x82C3], // て
    ['\u3068', 0x82C5], // と
    ['\u306A', 0x82C7], // な
    ['\u306B', 0x82C9], // に
    ['\u306C', 0x82CB], // ぬ
    ['\u306D', 0x82CD], // ね
    ['\u306E', 0x82CF], // の
    ['\u306F', 0x82D1], // は
    ['\u3072', 0x82D3], // ひ
    ['\u3075', 0x82D5], // ふ
    ['\u3078', 0x82D7], // へ
    ['\u307B', 0x82D9], // ほ
    ['\u307E', 0x82DB], // ま
    ['\u307F', 0x82DD], // み
    ['\u3080', 0x82DF], // む
    ['\u3081', 0x82E1], // め
    ['\u3082', 0x82E3], // も
    ['\u3084', 0x82E5], // や
    ['\u3086', 0x82E7], // ゆ
    ['\u3088', 0x82E9], // よ
    ['\u3089', 0x82EB], // ら
    ['\u308A', 0x82ED], // り
    ['\u308B', 0x82EF], // る
    ['\u308C', 0x82F1], // れ
    ['\u308D', 0x82F3], // ろ
    ['\u308F', 0x82F5], // わ
    ['\u3092', 0x82F7], // を
    ['\u3093', 0x82F9], // ん
    // 浊音
    ['\u304C', 0x82AA], // が
    ['\u304E', 0x82AC], // ぎ
    ['\u3050', 0x82AE], // ぐ
    ['\u3052', 0x82B0], // げ
    ['\u3054', 0x82B2], // ご
    ['\u3056', 0x82B4], // ざ
    ['\u3058', 0x82B6], // じ
    ['\u305A', 0x82B8], // ず
    ['\u305C', 0x82BA], // ぜ
    ['\u305E', 0x82BC], // ぞ
    ['\u3060', 0x82BE], // だ
    ['\u3062', 0x82C0], // ぢ
    ['\u3065', 0x82C2], // づ
    ['\u3067', 0x82C4], // で
    ['\u3069', 0x82C6], // ど
    ['\u3070', 0x82D2], // ば
    ['\u3073', 0x82D4], // び
    ['\u3076', 0x82D6], // ぶ
    ['\u3079', 0x82D8], // べ
    ['\u307C', 0x82DA], // ぼ
    // 半浊音
    ['\u3071', 0x82E0], // ぱ
    ['\u3074', 0x82E2], // ぴ
    ['\u3077', 0x82E4], // ぷ
    ['\u307A', 0x82E6], // ぺ
    ['\u307D', 0x82E8], // ぽ
    // 拗音 (组合假名，Shift-JIS 中是两个独立字符，但我们的库中存的是组合，需拆开编码)
    // 例如 'きゃ' -> き + ゃ ，编码时分别处理
    // 小假名
    ['\u3083', 0x82E0], // ゃ
    ['\u3085', 0x82E5], // ゅ
    ['\u3087', 0x82EB], // ょ
    // 其他小假名（用于拗音）
    ['\u3041', 0x829F], // ぁ (未用到，保留)
    ['\u3043', 0x82A1], // ぃ
    ['\u3045', 0x82A3], // ぅ
    ['\u3047', 0x82A5], // ぇ
    ['\u3049', 0x82A7], // ぉ
    ['\u3063', 0x82C0], // っ (促音，实际在日文中也会出现)
    // 半角片假名范围等，目前用不到
]);

function encodeCharToShiftJIS(ch) {
    const code = ch.charCodeAt(0);
    // ASCII 范围 (空格 0x20 到 '~' 0x7E)
    if (code >= 0x20 && code <= 0x7E) {
        return [code];
    }
    // 换行符
    if (code === 0x0A) return [0x0A];
    if (code === 0x0D) return [0x0D];
    // 假名映射
    const sjis = SHIFT_JIS_MAP.get(ch);
    if (sjis !== undefined) {
        return [(sjis >> 8) & 0xFF, sjis & 0xFF];
    }
    // 若包含拼音中的 'v' 或其它未映射字符，用 '?' 替代
    console.warn('Unmapped character in Shift-JIS:', ch);
    return [0x3F]; // '?'
}

function encodeToShiftJIS(str) {
    const bytes = [];
    for (const ch of str) {
        const b = encodeCharToShiftJIS(ch);
        bytes.push(...b);
    }
    return new Uint8Array(bytes);
}

// ---------- 截断正态分布 ----------
function erf(x) {
    const sign = (x >= 0) ? 1 : -1;
    x = Math.abs(x);
    const a1 =  0.254829592;
    const a2 = -0.284496736;
    const a3 =  1.421413741;
    const a4 = -1.453152027;
    const a5 =  1.061405429;
    const p  =  0.3275911;
    const t = 1.0 / (1.0 + p * x);
    const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
    return sign * y;
}

function erfinv(x) {
    if (x >= 1.0) return Infinity;
    if (x <= -1.0) return -Infinity;
    let w = -Math.log((1 - x) * (1 + x));
    let p;
    if (w < 5) {
        w = w - 2.5;
        p = 2.81022636e-08;
        p = 3.43273939e-07 + p * w;
        p = -3.5233877e-06 + p * w;
        p = -4.39150654e-06 + p * w;
        p = 0.00021858087 + p * w;
        p = -0.00125372503 + p * w;
        p = -0.00417768164 + p * w;
        p = 0.246640727 + p * w;
        p = 1.50140941 + p * w;
    } else {
        w = Math.sqrt(w) - 3;
        p = -0.000200214257;
        p = 0.000100950558 + p * w;
        p = 0.00134934322 + p * w;
        p = -0.00367342844 + p * w;
        p = 0.00573950773 + p * w;
        p = -0.0076224613 + p * w;
        p = 0.00943887047 + p * w;
        p = 1.00167406 + p * w;
        p = 2.83297682 + p * w;
    }
    return p * x;
}

function normalCDF(x) {
    return 0.5 * (1 + erf(x / Math.SQRT2));
}

function probit(p) {
    return Math.SQRT2 * erfinv(2 * p - 1);
}

function truncatedNormalRandom(mu, sigma, minVal, maxVal) {
    if (minVal >= maxVal) return Math.round(minVal);
    if (sigma <= 0) return Math.round(Math.max(minVal, Math.min(maxVal, mu)));
    const a = (minVal - mu) / sigma;
    const b = (maxVal - mu) / sigma;
    const phiA = a === -Infinity ? 0 : normalCDF(a);
    const phiB = b === Infinity ? 1 : normalCDF(b);
    if (phiA >= phiB) return Math.round(mu);
    const u = phiA + Math.random() * (phiB - phiA);
    const safeU = Math.min(Math.max(u, 1e-16), 1 - 1e-16);
    const x = probit(safeU);
    let val = mu + sigma * x;
    val = Math.max(minVal, Math.min(maxVal, val));
    return Math.round(val);
}

// ---------- UST 生成 ----------
function getRandomLyric() {
    if (languageLibrary.length > 0) {
        return languageLibrary[Math.floor(Math.random() * languageLibrary.length)];
    }
    return 'a';
}

function generateUST() {
    const shortest = parseInt(shortestNoteSlider.value, 10);
    const longest = parseInt(longestNoteSlider.value, 10);
    const lowest = parseInt(lowestNoteSlider.value, 10);
    const highest = parseInt(highestNoteSlider.value, 10);
    const smoothPitch = smoothPitchCheck.checked;
    const smoothLength = smoothLengthCheck.checked;
    const bpm = parseFloat(bpmSlider.value);
    const count = parseInt(noteCountSlider.value, 10);
    const pauseInterval = parseFloat(pauseIntervalSlider.value);
    const rDuration = parseFloat(rDurationSlider.value);

    if (shortest >= longest) throw new Error('最短音符长度必须小于最长音符长度');
    if (lowest >= highest) throw new Error('最低音必须小于最高音');
    if (count <= 0) throw new Error('音符数量必须大于0');
    if (rDuration <= 0) throw new Error('R音符时长必须大于0');

    const noteList = [];
    const lyricsSequence = [];
    let currentTime = 0.0;

    const avgNoteNum = Math.min(highest, Math.max(lowest, Math.floor((lowest + highest) / 2)));
    const firstLyric = getRandomLyric();
    const firstLength = Math.round((shortest + longest) / 2);
    noteList.push({ length: firstLength, lyric: firstLyric, noteNum: avgNoteNum });
    lyricsSequence.push(firstLyric);
    currentTime += noteLengthToSeconds(firstLength, bpm);

    for (let i = 1; i < count; i++) {
        if (currentTime >= pauseInterval) {
            const pauseLength = secondsToUSTLength(rDuration, bpm);
            const safeNoteNum = Math.max(lowest, Math.min(highest, 60));
            noteList.push({ length: pauseLength, lyric: 'R', noteNum: safeNoteNum });
            lyricsSequence.push('R');
            currentTime = 0.0;
            continue;
        }

        const prevNote = noteList[noteList.length - 1];
        const isAfterRest = prevNote.lyric === 'R';

        let newLength, newNoteNum;

        if (isAfterRest) {
            newLength = Math.floor(Math.random() * (longest - shortest + 1)) + shortest;
            newNoteNum = Math.floor(Math.random() * (highest - lowest + 1)) + lowest;
        } else {
            if (smoothLength) {
                const sigmaLength = (longest - shortest) / 3;
                newLength = truncatedNormalRandom(prevNote.length, sigmaLength, shortest, longest);
            } else {
                newLength = Math.floor(Math.random() * (longest - shortest + 1)) + shortest;
            }

            if (smoothPitch) {
                const sigmaPitch = (highest - lowest) / 10;
                newNoteNum = truncatedNormalRandom(prevNote.noteNum, sigmaPitch, lowest, highest);
            } else {
                newNoteNum = Math.floor(Math.random() * (highest - lowest + 1)) + lowest;
            }
        }

        const lyric = getRandomLyric();
        noteList.push({ length: newLength, lyric: lyric, noteNum: newNoteNum });
        lyricsSequence.push(lyric);
        currentTime += noteLengthToSeconds(newLength, bpm);
    }

    return { noteList, lyricsSequence, bpm };
}

function buildUSTContent(noteList, bpm) {
    const lines = [];
    lines.push('[#SETTING]');
    lines.push(`Tempo=${bpm.toFixed(2)}`);
    noteList.forEach((note, idx) => {
        const id = String(idx).padStart(4, '0');
        lines.push(`[#${id}]`);
        lines.push(`Length=${note.length}`);
        lines.push(`Lyric=${note.lyric}`);
        lines.push(`NoteNum=${note.noteNum}`);
    });
    return lines.join('\r\n');
}

function buildLyricsText(lyricsSequence) {
    return lyricsSequence.join(' ');
}

// ---------- 生成按钮与下载（Shift-JIS 编码） ----------
generateBtn.addEventListener('click', () => {
    statusBar.textContent = '正在生成...';
    downloadLinksDiv.style.display = 'none';
    downloadLinksDiv.innerHTML = '';
    try {
        const { noteList, lyricsSequence, bpm } = generateUST();
        const ustText = buildUSTContent(noteList, bpm);
        const lyricsText = buildLyricsText(lyricsSequence);

        // UST 文件转为 Shift-JIS 字节
        const ustBytes = encodeToShiftJIS(ustText);
        const ustBlob = new Blob([ustBytes], { type: 'application/octet-stream' });

        // 歌词文件保持 UTF-8
        const lyricsBlob = new Blob([lyricsText], { type: 'application/octet-stream;charset=utf-8' });

        const createLink = (text, filename, blob) => {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            a.textContent = text;
            a.className = 'download-link';
            a.addEventListener('click', () => {
                setTimeout(() => URL.revokeObjectURL(url), 2000);
            });
            return a;
        };

        downloadLinksDiv.appendChild(createLink('⬇️ 下载 UST 文件 (Shift-JIS)', 'generated.ust', ustBlob));
        downloadLinksDiv.appendChild(createLink('⬇️ 下载歌词文本', 'generated.txt', lyricsBlob));
        downloadLinksDiv.style.display = 'flex';
        statusBar.textContent = `生成成功！共 ${noteList.length} 个音符，文件已转为 Shift-JIS 编码。`;
    } catch (e) {
        statusBar.textContent = '错误: ' + e.message;
        alert('生成失败: ' + e.message);
    }
});

// ---------- 重置按钮 ----------
resetBtn.addEventListener('click', () => {
    shortestNoteSlider.value = 240;
    longestNoteSlider.value = 960;
    lowestNoteSlider.value = 60;
    highestNoteSlider.value = 84;
    bpmSlider.value = 120;
    noteCountSlider.value = 16;
    pauseIntervalSlider.value = 10;
    rDurationSlider.value = 1.0;
    smoothPitchCheck.checked = true;
    smoothLengthCheck.checked = true;
    lyricLibSelect.value = 'pinyin';
    languageLibrary = PINYIN_LIB;
    libCount.textContent = `共 ${PINYIN_LIB.length} 个音节`;

    [shortestNoteSlider, longestNoteSlider, lowestNoteSlider, highestNoteSlider,
        bpmSlider, noteCountSlider, pauseIntervalSlider, rDurationSlider].forEach(s => s.dispatchEvent(new Event('input')));

    statusBar.textContent = '已恢复默认设置 (中文拼音库，R时长1秒)';
    downloadLinksDiv.style.display = 'none';
    downloadLinksDiv.innerHTML = '';
});