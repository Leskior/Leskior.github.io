/*****************************************************
 * UST 随机生成器 - 核心逻辑
 * 包含：内置歌词库、滑块交互、正态分布采样、UST生成与下载
 * 最新修正：停顿后音符完全随机，避免从C4附近恢复
 *****************************************************/

// ---------- 音名映射 ----------
const NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

// ---------- 内置歌词库 ----------
const PINYIN_LIB = [
    "a","ai","an","ang","ao","ba","bai","ban","bang","bao","bei","ben","beng","bi","bian","biao","bie",
    "bin","bing","bo","bu","ca","cai","can","cang","cao","ce","cen","ceng","cha","chai","chan","chang",
    "chao","che","chen","cheng","chi","chong","chou","chu","chua","chuai","chuan","chuang","chui","chun",
    "chuo","ci","cong","cou","cu","cuan","cui","cun","cuo","da","dai","dan","dang","dao","de","dei","den",
    "deng","di","dian","diao","die","ding","diu","dong","dou","du","duan","dui","dun","duo","e","ei",
    "en","eng","er","fa","fan","fang","fei","fen","feng","fo","fou","fu","ga","gai","gan","gang","gao",
    "ge","gei","gen","geng","gong","gou","gu","gua","guai","guan","guang","gui","gun","guo","ha","hai",
    "han","hang","hao","he","hei","hen","heng","hong","hou","hu","hua","huai","huan","huang","hui","hun",
    "huo","ji","jia","jian","jiang","jiao","jie","jin","jing","jiong","jiu","ju","juan","jue","jun","ka",
    "kai","kan","kang","kao","ke","ken","keng","kong","kou","ku","kua","kuai","kuan","kuang","kui","kun",
    "kuo","la","lai","lan","lang","lao","le","lei","leng","li","lia","lian","liang","liao","lie","lin",
    "ling","liu","long","lou","lu","luan","lun","luo","lv","lve","ma","mai","man","mang","mao","me","mei",
    "men","meng","mi","mian","miao","mie","min","ming","miu","mo","mou","mu","na","nai","nan","nang",
    "nao","ne","nei","nen","neng","ni","nian","niang","niao","nie","nin","ning","niu","nong","nou","nu",
    "nuan","nuo","nv","nve","o","ou","pa","pai","pan","pang","pao","pei","pen","peng","pi","pian","piao",
    "pie","pin","ping","po","pou","pu","qi","qia","qian","qiang","qiao","qie","qin","qing","qiong","qiu",
    "qu","quan","que","qun","ran","rang","rao","re","ren","reng","ri","rong","rou","ru","ruan","rui","run",
    "ruo","sa","sai","san","sang","sao","se","sen","seng","sha","shai","shan","shang","shao","she","shei",
    "shen","sheng","shi","shou","shu","shua","shuai","shuan","shuang","shui","shun","shuo","si","song",
    "sou","su","suan","sui","sun","suo","ta","tai","tan","tang","tao","te","teng","ti","tian","tiao","tie",
    "ting","tong","tou","tu","tuan","tui","tun","tuo","wa","wai","wan","wang","wei","wen","weng","wo","wu",
    "xi","xia","xian","xiang","xiao","xie","xin","xing","xiong","xiu","xu","xuan","xue","xun","ya","yan",
    "yang","yao","ye","yi","yin","ying","yong","you","yu","yuan","yue","yun","za","zai","zan","zang","zao",
    "ze","zei","zen","zeng","zha","zhai","zhan","zhang","zhao","zhe","zhei","zhen","zheng","zhi","zhong",
    "zhou","zhu","zhua","zhuai","zhuan","zhuang","zhui","zhun","zhuo","zi","zong","zou","zu","zuan","zui",
    "zun","zuo"
];

const HIRAGANA_LIB = [
    "あ","い","う","え","お",
    "か","き","く","け","こ",
    "さ","し","す","せ","そ",
    "た","ち","つ","て","と",
    "な","に","ぬ","ね","の",
    "は","ひ","ふ","へ","ほ",
    "ま","み","む","め","も",
    "や","ゆ","よ",
    "ら","り","る","れ","ろ",
    "わ","を","ん",
    "が","ぎ","ぐ","げ","ご",
    "ざ","じ","ず","ぜ","ぞ",
    "だ","ぢ","づ","で","ど",
    "ば","び","ぶ","べ","ぼ",
    "ぱ","ぴ","ぷ","ぺ","ぽ",
    "きゃ","きゅ","きょ",
    "しゃ","しゅ","しょ",
    "ちゃ","ちゅ","ちょ",
    "にゃ","にゅ","にょ",
    "ひゃ","ひゅ","ひょ",
    "みゃ","みゅ","みょ",
    "りゃ","りゅ","りょ",
    "ぎゃ","ぎゅ","ぎょ",
    "じゃ","じゅ","じょ",
    "ぢゃ","ぢゅ","ぢょ",
    "びゃ","びゅ","びょ",
    "ぴゃ","ぴゅ","ぴょ"
];

// 当前使用的歌词库 (默认拼音)
let languageLibrary = PINYIN_LIB;

// ---------- DOM 元素引用 ----------
const lyricLibSelect = document.getElementById('lyricLibSelect');
const libCount = document.getElementById('libCount');
const shortestNoteSlider = document.getElementById('shortestNote');
const longestNoteSlider = document.getElementById('longestNote');
const lowestNoteSlider = document.getElementById('lowestNote');
const highestNoteSlider = document.getElementById('highestNote');
const smoothPitchCheck = document.getElementById('smoothPitch');
const smoothLengthCheck = document.getElementById('smoothLength');
const bpmSlider = document.getElementById('bpm');
const noteCountSlider = document.getElementById('noteCount');
const pauseIntervalSlider = document.getElementById('pauseInterval');
const generateBtn = document.getElementById('generateBtn');
const resetBtn = document.getElementById('resetBtn');
const statusBar = document.getElementById('statusBar');
const downloadLinksDiv = document.getElementById('downloadLinks');

// 数值显示标签
const shortestVal = document.getElementById('shortestVal');
const longestVal = document.getElementById('longestVal');
const lowestVal = document.getElementById('lowestVal');
const highestVal = document.getElementById('highestVal');
const bpmVal = document.getElementById('bpmVal');
const noteCountVal = document.getElementById('noteCountVal');
const pauseIntervalVal = document.getElementById('pauseIntervalVal');

// ---------- 工具函数 ----------
function getNoteName(noteNum) {
    const octave = Math.floor(noteNum / 12) - 1;
    const index = noteNum % 12;
    return NOTE_NAMES[index] + octave;
}

function noteLengthToSeconds(length, bpm) {
    return length * (60 / bpm) / 480;
}

// 绑定滑块与数值显示
function bindSlider(slider, valueSpan, formatter) {
    const update = () => {
        const val = parseFloat(slider.value);
        valueSpan.textContent = formatter ? formatter(val) : val;
    };
    slider.addEventListener('input', update);
    update(); // 初始化显示
}

// 初始化所有滑块显示
bindSlider(shortestNoteSlider, shortestVal, v => Math.round(v));
bindSlider(longestNoteSlider, longestVal, v => Math.round(v));
bindSlider(lowestNoteSlider, lowestVal, v => getNoteName(Math.round(v)));
bindSlider(highestNoteSlider, highestVal, v => getNoteName(Math.round(v)));
bindSlider(bpmSlider, bpmVal, v => Math.round(v));
bindSlider(noteCountSlider, noteCountVal, v => Math.round(v));
bindSlider(pauseIntervalSlider, pauseIntervalVal, v => v.toFixed(1));

// 切换歌词库
lyricLibSelect.addEventListener('change', () => {
    if (lyricLibSelect.value === 'pinyin') {
        languageLibrary = PINYIN_LIB;
        libCount.textContent = `共 ${PINYIN_LIB.length} 个音节`;
    } else {
        languageLibrary = HIRAGANA_LIB;
        libCount.textContent = `共 ${HIRAGANA_LIB.length} 个假名/拗音`;
    }
});
// 初始显示数量
libCount.textContent = `共 ${PINYIN_LIB.length} 个音节`;

// ---------- 截断正态分布随机数生成 (纯数学实现) ----------
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

// ---------- UST 生成核心 ----------
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

    if (shortest >= longest) throw new Error('最短音符长度必须小于最长音符长度');
    if (lowest >= highest) throw new Error('最低音必须小于最高音');
    if (count <= 0) throw new Error('音符数量必须大于0');

    const noteList = [];
    const lyricsSequence = [];
    let currentTime = 0.0;

    // 第一个音符
    const avgNoteNum = Math.min(highest, Math.max(lowest, Math.floor((lowest + highest) / 2)));
    const firstLyric = getRandomLyric();
    const firstLength = Math.round((shortest + longest) / 2);
    noteList.push({ length: firstLength, lyric: firstLyric, noteNum: avgNoteNum });
    lyricsSequence.push(firstLyric);
    currentTime += noteLengthToSeconds(firstLength, bpm);

    // 生成后续音符
    for (let i = 1; i < count; i++) {
        // 检查是否插入停顿
        if (currentTime >= pauseInterval) {
            const pauseLength = Math.round(480 * bpm / 60);
            const safeNoteNum = Math.max(lowest, Math.min(highest, 60));
            noteList.push({ length: pauseLength, lyric: 'R', noteNum: safeNoteNum });
            lyricsSequence.push('R');
            currentTime = 0.0;
            continue; // 跳过本次剩余音符生成，避免连续插入停顿
        }

        const prevNote = noteList[noteList.length - 1];
        const isAfterRest = prevNote.lyric === 'R';

        let newLength, newNoteNum;

        if (isAfterRest) {
            // 停顿后完全随机生成，不受平滑影响，创造新旋律片段
            newLength = Math.floor(Math.random() * (longest - shortest + 1)) + shortest;
            newNoteNum = Math.floor(Math.random() * (highest - lowest + 1)) + lowest;
        } else {
            // 正常生成：根据平滑开关决定是否基于前一个音符
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

// ---------- 生成按钮与下载 ----------
generateBtn.addEventListener('click', () => {
    statusBar.textContent = '正在生成...';
    downloadLinksDiv.style.display = 'none';
    downloadLinksDiv.innerHTML = '';
    try {
        const { noteList, lyricsSequence, bpm } = generateUST();
        const ustContent = buildUSTContent(noteList, bpm);
        const lyricsContent = buildLyricsText(lyricsSequence);

        // 创建下载链接
        const createLink = (text, filename, content) => {
            const blob = new Blob([content], { type: 'application/octet-stream' });
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

        downloadLinksDiv.appendChild(createLink('⬇️ 下载 UST 文件', 'generated.ust', ustContent));
        downloadLinksDiv.appendChild(createLink('⬇️ 下载歌词文本', 'generated.txt', lyricsContent));
        downloadLinksDiv.style.display = 'flex';
        statusBar.textContent = `生成成功！共 ${noteList.length} 个音符，点击下方链接下载文件。`;
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
    smoothPitchCheck.checked = true;
    smoothLengthCheck.checked = true;
    bpmSlider.value = 120;
    noteCountSlider.value = 16;
    pauseIntervalSlider.value = 10;
    lyricLibSelect.value = 'pinyin';
    languageLibrary = PINYIN_LIB;
    libCount.textContent = `共 ${PINYIN_LIB.length} 个音节`;

    // 触发滑块显示更新
    [shortestNoteSlider, longestNoteSlider, lowestNoteSlider, highestNoteSlider,
        bpmSlider, noteCountSlider, pauseIntervalSlider].forEach(s => s.dispatchEvent(new Event('input')));

    statusBar.textContent = '已恢复默认设置 (中文拼音库)';
    downloadLinksDiv.style.display = 'none';
    downloadLinksDiv.innerHTML = '';
});

// 页面加载时触发一次滑块显示
window.addEventListener('load', () => {
    [shortestNoteSlider, longestNoteSlider, lowestNoteSlider, highestNoteSlider,
        bpmSlider, noteCountSlider, pauseIntervalSlider].forEach(s => s.dispatchEvent(new Event('input')));
});