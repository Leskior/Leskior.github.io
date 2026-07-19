/*****************************************************
 * UST 随机生成器 - 核心逻辑
 * 修正：Shift-JIS 编码表准确映射所有假名
 *****************************************************/

const NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
let languageLibrary = PINYIN_LIB;
let customLibrary = [];           // 存放用户从 oto.ini 导入的自定义歌词库
let customLibLoaded = false;     // 标记是否已成功导入

// DOM 元素（同前）
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
const customUpload = document.getElementById('customUpload');
const otoFileInput = document.getElementById('otoFileInput');
const uploadHint = document.getElementById('uploadHint');
const uploadResult = document.getElementById('uploadResult');
const lyricTextarea = document.getElementById('lyricTextarea');
const previewCount = document.getElementById('previewCount');
const applyLyricBtn = document.getElementById('applyLyricBtn');
const revertLyricBtn = document.getElementById('revertLyricBtn');

let originalLibrary = [];    // 用于"还原"的快照

// ============ 歌词预览编辑区 ============

/** 将当前歌词库写入 textarea（每行一个） */
function populateTextarea(library) {
    lyricTextarea.value = library.join('\n');
    previewCount.textContent = `${library.length} 行`;
    originalLibrary = [...library];
}

/** 从 textarea 读取并解析为数组（过滤空行、trim） */
function readTextarea() {
    return lyricTextarea.value
        .split(/\r?\n/)
        .map(line => line.trim())
        .filter(line => line.length > 0);
}

/** 应用 textarea 编辑到当前歌词库 */
function applyTextareaEdit() {
    const newLib = readTextarea();
    if (newLib.length === 0) {
        alert('歌词库不能为空！');
        return;
    }
    languageLibrary = newLib;
    // 如果是自定义模式，同步更新 customLibrary
    if (lyricLibSelect.value === 'custom') {
        customLibrary = newLib;
        customLibLoaded = true;
    }
    previewCount.textContent = `${newLib.length} 行`;
    libCount.textContent = `共 ${newLib.length} 个歌词`;
    originalLibrary = [...newLib];
    statusBar.textContent = `已应用 ${newLib.length} 个歌词`;
}

applyLyricBtn.addEventListener('click', applyTextareaEdit);

revertLyricBtn.addEventListener('click', () => {
    populateTextarea(originalLibrary);
    languageLibrary = [...originalLibrary];
    if (lyricLibSelect.value === 'custom') {
        customLibrary = [...originalLibrary];
    }
    libCount.textContent = `共 ${originalLibrary.length} 个歌词`;
    statusBar.textContent = '已还原';
});

// ============ 工具函数 ============
function getNoteName(noteNum) {
    const octave = Math.floor(noteNum / 12) - 1;
    const index = noteNum % 12;
    return NOTE_NAMES[index] + octave;
}
function noteLengthToSeconds(length, bpm) { return length * (60 / bpm) / 480; }
function secondsToUSTLength(seconds, bpm) { return Math.round(seconds * bpm * 480 / 60); }

// 双向同步（不变）
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
    bindSliderAndInput(slider, input, (val) => { nameSpan.textContent = getNoteName(Math.round(val)); });
}

bindSliderAndInput(shortestNoteSlider, shortestNoteInput);
bindSliderAndInput(longestNoteSlider, longestNoteInput);
bindPitchSliderAndInput(lowestNoteSlider, lowestNoteInput, lowestNoteName);
bindPitchSliderAndInput(highestNoteSlider, highestNoteInput, highestNoteName);
bindSliderAndInput(bpmSlider, bpmInput);
bindSliderAndInput(noteCountSlider, noteCountInput);
bindSliderAndInput(pauseIntervalSlider, pauseIntervalInput);
bindSliderAndInput(rDurationSlider, rDurationInput);

lyricLibSelect.addEventListener('change', () => {
    if (lyricLibSelect.value === 'pinyin') {
        languageLibrary = PINYIN_LIB;
        libCount.textContent = `共 ${PINYIN_LIB.length} 个音节`;
        customUpload.style.display = 'none';
        populateTextarea(PINYIN_LIB);
    } else if (lyricLibSelect.value === 'hiragana') {
        languageLibrary = HIRAGANA_LIB;
        libCount.textContent = `共 ${HIRAGANA_LIB.length} 个假名/拗音`;
        customUpload.style.display = 'none';
        populateTextarea(HIRAGANA_LIB);
    } else if (lyricLibSelect.value === 'custom') {
        customUpload.style.display = 'block';
        if (customLibLoaded) {
            languageLibrary = customLibrary;
            libCount.textContent = `共 ${customLibrary.length} 个歌词`;
            populateTextarea(customLibrary);
        } else {
            languageLibrary = [];
            libCount.textContent = '尚未导入';
            populateTextarea([]);
        }
    }
});
// 根据当前选择初始化歌词库计数
if (lyricLibSelect.value === 'pinyin') {
    languageLibrary = PINYIN_LIB;
    libCount.textContent = `共 ${PINYIN_LIB.length} 个音节`;
    populateTextarea(PINYIN_LIB);
} else if (lyricLibSelect.value === 'hiragana') {
    languageLibrary = HIRAGANA_LIB;
    libCount.textContent = `共 ${HIRAGANA_LIB.length} 个假名/拗音`;
    populateTextarea(HIRAGANA_LIB);
}

// ============ 完整的 Shift-JIS 假名编码表 ============
const SHIFT_JIS_MAP = new Map([
    // 平假名 (Hiragana)
    ['\u3041', 0x829f],  // ぁ
    ['\u3042', 0x82a0],  // あ
    ['\u3043', 0x82a1],  // ぃ
    ['\u3044', 0x82a2],  // い
    ['\u3045', 0x82a3],  // ぅ
    ['\u3046', 0x82a4],  // う
    ['\u3047', 0x82a5],  // ぇ
    ['\u3048', 0x82a6],  // え
    ['\u3049', 0x82a7],  // ぉ
    ['\u304a', 0x82a8],  // お
    ['\u304b', 0x82a9],  // か
    ['\u304c', 0x82aa],  // が
    ['\u304d', 0x82ab],  // き
    ['\u304e', 0x82ac],  // ぎ
    ['\u304f', 0x82ad],  // く
    ['\u3050', 0x82ae],  // ぐ
    ['\u3051', 0x82af],  // け
    ['\u3052', 0x82b0],  // げ
    ['\u3053', 0x82b1],  // こ
    ['\u3054', 0x82b2],  // ご
    ['\u3055', 0x82b3],  // さ
    ['\u3056', 0x82b4],  // ざ
    ['\u3057', 0x82b5],  // し
    ['\u3058', 0x82b6],  // じ
    ['\u3059', 0x82b7],  // す
    ['\u305a', 0x82b8],  // ず
    ['\u305b', 0x82b9],  // せ
    ['\u305c', 0x82ba],  // ぜ
    ['\u305d', 0x82bb],  // そ
    ['\u305e', 0x82bc],  // ぞ
    ['\u305f', 0x82bd],  // た
    ['\u3060', 0x82be],  // だ
    ['\u3061', 0x82bf],  // ち
    ['\u3062', 0x82c0],  // ぢ
    ['\u3063', 0x82c1],  // っ
    ['\u3064', 0x82c2],  // つ
    ['\u3065', 0x82c3],  // づ
    ['\u3066', 0x82c4],  // て
    ['\u3067', 0x82c5],  // で
    ['\u3068', 0x82c6],  // と
    ['\u3069', 0x82c7],  // ど
    ['\u306a', 0x82c8],  // な
    ['\u306b', 0x82c9],  // に
    ['\u306c', 0x82ca],  // ぬ
    ['\u306d', 0x82cb],  // ね
    ['\u306e', 0x82cc],  // の
    ['\u306f', 0x82cd],  // は
    ['\u3070', 0x82ce],  // ば
    ['\u3071', 0x82cf],  // ぱ
    ['\u3072', 0x82d0],  // ひ
    ['\u3073', 0x82d1],  // び
    ['\u3074', 0x82d2],  // ぴ
    ['\u3075', 0x82d3],  // ふ
    ['\u3076', 0x82d4],  // ぶ
    ['\u3077', 0x82d5],  // ぷ
    ['\u3078', 0x82d6],  // へ
    ['\u3079', 0x82d7],  // べ
    ['\u307a', 0x82d8],  // ぺ
    ['\u307b', 0x82d9],  // ほ
    ['\u307c', 0x82da],  // ぼ
    ['\u307d', 0x82db],  // ぽ
    ['\u307e', 0x82dc],  // ま
    ['\u307f', 0x82dd],  // み
    ['\u3080', 0x82de],  // む
    ['\u3081', 0x82df],  // め
    ['\u3082', 0x82e0],  // も
    ['\u3083', 0x82e1],  // ゃ
    ['\u3084', 0x82e2],  // や
    ['\u3085', 0x82e3],  // ゅ
    ['\u3086', 0x82e4],  // ゆ
    ['\u3087', 0x82e5],  // ょ
    ['\u3088', 0x82e6],  // よ
    ['\u3089', 0x82e7],  // ら
    ['\u308a', 0x82e8],  // り
    ['\u308b', 0x82e9],  // る
    ['\u308c', 0x82ea],  // れ
    ['\u308d', 0x82eb],  // ろ
    ['\u308e', 0x82ec],  // ゎ
    ['\u308f', 0x82ed],  // わ
    ['\u3090', 0x82ee],  // ゐ
    ['\u3091', 0x82ef],  // ゑ
    ['\u3092', 0x82f0],  // を
    ['\u3093', 0x82f1],  // ん
    // 片假名 (Katakana) — 修复 oto.ini 中包含片假名时的乱码问题
    ['\u30a1', 0x8340],  // ァ
    ['\u30a2', 0x8341],  // ア
    ['\u30a3', 0x8342],  // ィ
    ['\u30a4', 0x8343],  // イ
    ['\u30a5', 0x8344],  // ゥ
    ['\u30a6', 0x8345],  // ウ
    ['\u30a7', 0x8346],  // ェ
    ['\u30a8', 0x8347],  // エ
    ['\u30a9', 0x8348],  // ォ
    ['\u30aa', 0x8349],  // オ
    ['\u30ab', 0x834a],  // カ
    ['\u30ac', 0x834b],  // ガ
    ['\u30ad', 0x834c],  // キ
    ['\u30ae', 0x834d],  // ギ
    ['\u30af', 0x834e],  // ク
    ['\u30b0', 0x834f],  // グ
    ['\u30b1', 0x8350],  // ケ
    ['\u30b2', 0x8351],  // ゲ
    ['\u30b3', 0x8352],  // コ
    ['\u30b4', 0x8353],  // ゴ
    ['\u30b5', 0x8354],  // サ
    ['\u30b6', 0x8355],  // ザ
    ['\u30b7', 0x8356],  // シ
    ['\u30b8', 0x8357],  // ジ
    ['\u30b9', 0x8358],  // ス
    ['\u30ba', 0x8359],  // ズ
    ['\u30bb', 0x835a],  // セ
    ['\u30bc', 0x835b],  // ゼ
    ['\u30bd', 0x835c],  // ソ
    ['\u30be', 0x835d],  // ゾ
    ['\u30bf', 0x835e],  // タ
    ['\u30c0', 0x835f],  // ダ
    ['\u30c1', 0x8360],  // チ
    ['\u30c2', 0x8361],  // ヂ
    ['\u30c3', 0x8362],  // ッ
    ['\u30c4', 0x8363],  // ツ
    ['\u30c5', 0x8364],  // ヅ
    ['\u30c6', 0x8365],  // テ
    ['\u30c7', 0x8366],  // デ
    ['\u30c8', 0x8367],  // ト
    ['\u30c9', 0x8368],  // ド
    ['\u30ca', 0x8369],  // ナ
    ['\u30cb', 0x836a],  // ニ
    ['\u30cc', 0x836b],  // ヌ
    ['\u30cd', 0x836c],  // ネ
    ['\u30ce', 0x836d],  // ノ
    ['\u30cf', 0x836e],  // ハ
    ['\u30d0', 0x836f],  // バ
    ['\u30d1', 0x8370],  // パ
    ['\u30d2', 0x8371],  // ヒ
    ['\u30d3', 0x8372],  // ビ
    ['\u30d4', 0x8373],  // ピ
    ['\u30d5', 0x8374],  // フ
    ['\u30d6', 0x8375],  // ブ
    ['\u30d7', 0x8376],  // プ
    ['\u30d8', 0x8377],  // ヘ
    ['\u30d9', 0x8378],  // ベ
    ['\u30da', 0x8379],  // ペ
    ['\u30db', 0x837a],  // ホ
    ['\u30dc', 0x837b],  // ボ
    ['\u30dd', 0x837c],  // ポ
    ['\u30de', 0x837d],  // マ
    ['\u30df', 0x837e],  // ミ
    ['\u30e0', 0x8380],  // ム
    ['\u30e1', 0x8381],  // メ
    ['\u30e2', 0x8382],  // モ
    ['\u30e3', 0x8383],  // ャ
    ['\u30e4', 0x8384],  // ヤ
    ['\u30e5', 0x8385],  // ュ
    ['\u30e6', 0x8386],  // ユ
    ['\u30e7', 0x8387],  // ョ
    ['\u30e8', 0x8388],  // ヨ
    ['\u30e9', 0x8389],  // ラ
    ['\u30ea', 0x838a],  // リ
    ['\u30eb', 0x838b],  // ル
    ['\u30ec', 0x838c],  // レ
    ['\u30ed', 0x838d],  // ロ
    ['\u30ee', 0x838e],  // ヮ
    ['\u30ef', 0x838f],  // ワ
    ['\u30f0', 0x8390],  // ヰ
    ['\u30f1', 0x8391],  // ヱ
    ['\u30f2', 0x8392],  // ヲ
    ['\u30f3', 0x8393],  // ン
    ['\u30f4', 0x8394],  // ヴ
    ['\u30f5', 0x8395],  // ヵ
    ['\u30f6', 0x8396],  // ヶ
    // 拗音组合 (Yoon) - 这些在 UST 中通常作为两个字符处理
    // きゃ = き + ゃ, しゃ = し + ゃ, 等等
    // 由于 Shift-JIS 中没有单独的拗音编码，我们将其分解为基本假名
]);

function encodeCharToShiftJIS(ch) {
    const code = ch.charCodeAt(0);
    if (code >= 0x20 && code <= 0x7E) return [code];   // ASCII
    if (code === 0x0A) return [0x0A];
    if (code === 0x0D) return [0x0D];
    const sjis = SHIFT_JIS_MAP.get(ch);
    if (sjis !== undefined) return [(sjis >> 8) & 0xFF, sjis & 0xFF];
    console.warn('Unmapped character in Shift-JIS:', ch, '(using UTF-8 fallback)');
    // 对于未映射的字符（如拗音），使用 UTF-8 编码作为备选
    const encoder = new TextEncoder();
    return Array.from(encoder.encode(ch));
}

function encodeToShiftJIS(str) {
    const bytes = [];
    for (const ch of str) {
        bytes.push(...encodeCharToShiftJIS(ch));
    }
    return new Uint8Array(bytes);
}

// 正态分布（不变）
function erf(x) {
    const sign = (x >= 0) ? 1 : -1;
    x = Math.abs(x);
    const a1 = 0.254829592, a2 = -0.284496736, a3 = 1.421413741, a4 = -1.453152027, a5 = 1.061405429, p = 0.3275911;
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
        w -= 2.5;
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
function normalCDF(x) { return 0.5 * (1 + erf(x / Math.SQRT2)); }
function probit(p) { return Math.SQRT2 * erfinv(2 * p - 1); }
function truncatedNormalRandom(mu, sigma, minVal, maxVal) {
    if (minVal >= maxVal) return Math.round(minVal);
    if (sigma <= 0) return Math.round(Math.max(minVal, Math.min(maxVal, mu)));
    const a = (minVal - mu) / sigma, b = (maxVal - mu) / sigma;
    const phiA = a === -Infinity ? 0 : normalCDF(a), phiB = b === Infinity ? 1 : normalCDF(b);
    if (phiA >= phiB || isNaN(phiA) || isNaN(phiB)) return Math.round(mu);
    const u = phiA + Math.random() * (phiB - phiA);
    const safeU = Math.min(Math.max(u, 1e-16), 1 - 1e-16);
    const x = probit(safeU);
    if (isNaN(x)) return Math.round(mu);
    let val = mu + sigma * x;
    return Math.round(Math.max(minVal, Math.min(maxVal, val)));
}

// UST 生成（不变）
// ============ oto.ini 自定义歌词库导入 ============

/**
 * 解析 oto.ini 内容，提取所有歌词
 * oto.ini 格式: filename.wav=歌词,offset,consonant,cutoff,preutterance,overlap
 * 提取规则: 取每行中 '=' 之后、第一个 ',' 之前的内容作为歌词
 * 对于 CV 单独音音源，自动去除 "- " 和 "* " 前缀，并去重
 */
function parseOtoIni(text) {
    const lyricSet = new Set();      // 用 Set 自动去重
    const prefixPattern = /^[-*]\s+/; // 匹配 "- " 或 "* " 前缀
    const lines = text.split(/\r?\n/);
    for (const line of lines) {
        const eqIdx = line.indexOf('=');
        if (eqIdx === -1) continue;
        const afterEq = line.substring(eqIdx + 1);
        const commaIdx = afterEq.indexOf(',');
        if (commaIdx === -1) continue;
        let lyric = afterEq.substring(0, commaIdx).trim();
        if (lyric.length === 0) continue;
        // 去除 CV 单独音的前缀标记
        lyric = lyric.replace(prefixPattern, '');
        lyricSet.add(lyric);
    }
    return Array.from(lyricSet);
}

/**
 * 处理 oto.ini 文件上传
 * 使用 Shift-JIS 编码解码文件内容
 */
otoFileInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (!file) return;

    uploadHint.style.display = 'none';
    uploadResult.style.display = 'block';
    uploadResult.textContent = '正在解析...';
    uploadResult.className = 'upload-result';

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const arrayBuffer = e.target.result;
            // 用 Shift-JIS 解码
            const decoder = new TextDecoder('shift_jis');
            const text = decoder.decode(arrayBuffer);

            customLibrary = parseOtoIni(text);

            if (customLibrary.length === 0) {
                throw new Error('未找到任何有效歌词');
            }

            customLibLoaded = true;
            languageLibrary = customLibrary;
            libCount.textContent = `共 ${customLibrary.length} 个歌词`;
            populateTextarea(customLibrary);
            uploadResult.textContent = `✅ 成功导入 ${customLibrary.length} 个歌词`;
            uploadResult.className = 'upload-result success';
            statusBar.textContent = `已从 oto.ini 导入 ${customLibrary.length} 个歌词`;
        } catch (err) {
            customLibLoaded = false;
            languageLibrary = [];
            libCount.textContent = '导入失败';
            populateTextarea([]);
            uploadResult.textContent = '❌ 解析失败: ' + err.message;
            uploadResult.className = 'upload-result error';
            statusBar.textContent = 'oto.ini 解析失败: ' + err.message;
            console.error('oto.ini parse error:', err);
        }
    };
    reader.onerror = () => {
        uploadResult.textContent = '❌ 文件读取失败';
        uploadResult.className = 'upload-result error';
        uploadHint.style.display = 'inline';
    };
    reader.readAsArrayBuffer(file);
});

// ============ 原有歌词获取函数 ============

function getRandomLyric() {
    if (languageLibrary.length > 0) return languageLibrary[Math.floor(Math.random() * languageLibrary.length)];
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

    // 默认在开头插入一个四分音符 (480 tick) 的 R 休止符
    const initialRestNoteNum = Math.max(lowest, Math.min(highest, 60));
    noteList.push({ length: 480, lyric: 'R', noteNum: initialRestNoteNum });
    lyricsSequence.push('R');
    currentTime += noteLengthToSeconds(480, bpm);

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
                newLength = truncatedNormalRandom(prevNote.length, (longest - shortest) / 3, shortest, longest);
            } else {
                newLength = Math.floor(Math.random() * (longest - shortest + 1)) + shortest;
            }
            if (smoothPitch) {
                newNoteNum = truncatedNormalRandom(prevNote.noteNum, (highest - lowest) / 10, lowest, highest);
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
    const lines = ['[#SETTING]', `Tempo=${bpm.toFixed(2)}`];
    noteList.forEach((note, idx) => {
        const id = String(idx).padStart(4, '0');
        lines.push(`[#${id}]`, `Length=${note.length}`, `Lyric=${note.lyric}`, `NoteNum=${note.noteNum}`);
    });
    return lines.join('\r\n');
}
function buildLyricsText(lyricsSequence) { return lyricsSequence.join(' '); }

// 下载
generateBtn.addEventListener('click', () => {
    statusBar.textContent = '正在生成...';
    downloadLinksDiv.style.display = 'none';
    downloadLinksDiv.innerHTML = '';
    try {
        // 检查自定义歌词库是否已加载
        if (lyricLibSelect.value === 'custom' && !customLibLoaded) {
            throw new Error('请先导入 oto.ini 文件再生成');
        }
        const { noteList, lyricsSequence, bpm } = generateUST();
        const ustText = buildUSTContent(noteList, bpm);
        const lyricsText = buildLyricsText(lyricsSequence);
        const ustBytes = encodeToShiftJIS(ustText);
        const ustBlob = new Blob([ustBytes], { type: 'application/octet-stream' });
        const lyricsBlob = new Blob([lyricsText], { type: 'text/plain;charset=utf-8' });

        const createLink = (text, filename, blob) => {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url; a.download = filename; a.textContent = text; a.className = 'download-link';
            a.addEventListener('click', () => setTimeout(() => URL.revokeObjectURL(url), 2000));
            return a;
        };
        downloadLinksDiv.appendChild(createLink('⬇️ 下载 UST 文件 (Shift-JIS)', 'generated.ust', ustBlob));
        downloadLinksDiv.appendChild(createLink('⬇️ 下载歌词文本', 'generated.txt', lyricsBlob));
        downloadLinksDiv.style.display = 'flex';
        statusBar.textContent = `生成成功！共 ${noteList.length} 个音符。`;
    } catch (e) {
        statusBar.textContent = '错误: ' + e.message;
        alert('生成失败: ' + e.message);
    }
});

resetBtn.addEventListener('click', () => {
    // 重置所有滑块到默认值
    shortestNoteSlider.value = 240;
    longestNoteSlider.value = 960;
    lowestNoteSlider.value = 60;
    highestNoteSlider.value = 84;
    bpmSlider.value = 120;
    noteCountSlider.value = 16;
    pauseIntervalSlider.value = 10;
    rDurationSlider.value = 1.0;
    
    // 重置复选框
    smoothPitchCheck.checked = true;
    smoothLengthCheck.checked = true;
    
    // 重置歌词库选择
    lyricLibSelect.value = 'pinyin';
    languageLibrary = PINYIN_LIB;
    libCount.textContent = `共 ${PINYIN_LIB.length} 个音节`;
    customLibLoaded = false;
    customLibrary = [];
    customUpload.style.display = 'none';
    uploadHint.style.display = 'inline';
    uploadResult.style.display = 'none';
    otoFileInput.value = '';
    populateTextarea(PINYIN_LIB);

    // 触发所有滑块的 input 事件以更新对应的输入框和显示
    [shortestNoteSlider, longestNoteSlider, lowestNoteSlider, highestNoteSlider,
        bpmSlider, noteCountSlider, pauseIntervalSlider, rDurationSlider].forEach(s => s.dispatchEvent(new Event('input')));

    statusBar.textContent = '已恢复默认设置';
    downloadLinksDiv.style.display = 'none';
    downloadLinksDiv.innerHTML = '';
});

// 页面加载时，bindSliderAndInput 已经调用了 fromSlider() 进行初始化
// 因此不需要再次触发 input 事件
window.addEventListener('load', () => {
    // bindSliderAndInput 在绑定时已经完成了初始化
    // 这里只需要确保状态栏显示初始状态
    statusBar.textContent = '准备就绪';
});
