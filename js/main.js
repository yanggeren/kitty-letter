/* ============================================================
   💌 一封给你的信 — 交互逻辑
   场景流转:Kitty 飞来 → 点击信封 → 展开信纸 → 重新折好信件
   ============================================================ */
(function () {
  "use strict";

  var $ = function (id) { return document.getElementById(id); };

  var sceneFly      = $("sceneFly");
  var sceneEnvelope = $("sceneEnvelope");
  var sceneLetter   = $("sceneLetter");
  var flyer         = $("flyer");
  var envelopeBtn   = $("envelopeBtn");
  var letter        = $("letter");
  var refoldBtn     = $("refoldBtn");
  var ring          = $("heartKittyRing");

  var busy = false;                 // 转场锁,防止连点
  var TIMES = { flyOut: 760, flap: 640, fold: 820 };

  /* ============================================================
     1. 背景音乐:打开页面自动播放;音乐缺失/出错 → 提示并移除按钮
     ============================================================ */
  var audio    = $("bgm");
  var musicBtn = $("musicBtn");
  var musicDead = false;

  function showToast(msg, ms) {
    var toast = $("toast");
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add("is-show");
    clearTimeout(showToast._t);
    showToast._t = setTimeout(function () {
      toast.classList.remove("is-show");
    }, ms || 3200);
  }

  function setPlayingUI(playing) {
    if (!musicBtn) return;
    musicBtn.classList.toggle("is-playing", playing);
  }

  function musicFailed() {
    if (musicDead) return;
    musicDead = true;
    showToast("播放失败:没有听到音乐,但信里的话一样是真的 💌");
    if (musicBtn && musicBtn.parentNode) {
      musicBtn.parentNode.removeChild(musicBtn);   // 删除播放音乐按钮
      musicBtn = null;
    }
  }

  if (audio) {
    // 音频文件缺失 / 解码失败 / 网络错误
    audio.addEventListener("error", musicFailed);

    // 资源就绪检测:8 秒还加载不出来就视为"没有这个音乐"
    var loadTimer = setTimeout(function () {
      if (audio.readyState < 1) musicFailed();
    }, 8000);
    audio.addEventListener("canplay", function () { clearTimeout(loadTimer); });
    audio.addEventListener("loadeddata", function () { clearTimeout(loadTimer); });

    function tryPlay() {
      if (musicDead || !audio) return Promise.resolve();
      var p = audio.play();
      if (p && typeof p.then === "function") {
        return p.then(function () {
          setPlayingUI(true);
        }).catch(function (err) {
          // NotAllowedError = 浏览器自动播放限制,保留按钮等用户点击,不算"没有音乐"
          if (err && err.name === "NotAllowedError") {
            setPlayingUI(false);
          } else if (err && err.name === "NotSupportedError") {
            musicFailed();
          }
        });
      }
      setPlayingUI(true);
      return Promise.resolve();
    }

    // 打开网页就开始播放
    tryPlay();

    // 手机浏览器若拦截了自动播放:首次触摸/点击时再补一次
    var unlock = function () {
      tryPlay();
      document.removeEventListener("touchend", unlock);
      document.removeEventListener("click", unlock);
    };
    document.addEventListener("touchend", unlock, { passive: true });
    document.addEventListener("click", unlock);

    if (musicBtn) {
      musicBtn.addEventListener("click", function (e) {
        e.stopPropagation();
        if (musicDead) return;
        if (audio.paused) {
          tryPlay();
        } else {
          audio.pause();
          setPlayingUI(false);
        }
      });
    }
  } else {
    musicFailed();
  }

  /* ============================================================
     2. 爱心 Kitty 贴纸:围绕信纸的各种彩色爱心小猫
     ============================================================ */
  var PALETTE = [
    "#ff69b4", "#ff8fab", "#ff4757", "#ffb6c1", "#e8449b",
    "#f7a1c4", "#ff9f68", "#c9a2ff", "#8fd3ff", "#ffd166",
    "#ff7fa8", "#ffc0cb"
  ];

  // 位置:相对 .letter-stage(inset 负值的外圈),left/top 用百分比
  var SPOTS = [
    { l: "-4%",  t: "-3%",  s: 76, r: -14, extra: false },
    { l: "8%",   t: "-9%",  s: 58, r: 10,  extra: false },
    { l: "26%",  t: "-12%", s: 48, r: -6,  extra: true  },
    { l: "46%",  t: "-10%", s: 54, r: 12,  extra: true  },
    { l: "66%",  t: "-12%", s: 46, r: -10, extra: true  },
    { l: "84%",  t: "-6%",  s: 62, r: 8,   extra: false },
    { l: "96%",  t: "12%",  s: 52, r: -12, extra: true  },
    { l: "99%",  t: "38%",  s: 66, r: 6,   extra: false },
    { l: "95%",  t: "66%",  s: 50, r: -8,  extra: true  },
    { l: "84%",  t: "90%",  s: 70, r: 12,  extra: false },
    { l: "62%",  t: "98%",  s: 52, r: -10, extra: true  },
    { l: "42%",  t: "100%", s: 46, r: 8,   extra: true  },
    { l: "22%",  t: "97%",  s: 58, r: -12, extra: false },
    { l: "4%",   t: "88%",  s: 68, r: 10,  extra: false },
    { l: "-6%",  t: "62%",  s: 54, r: -8,  extra: true  },
    { l: "-8%",  t: "34%",  s: 64, r: 12,  extra: false }
  ];

  function heartKittySVG(color, i) {
    // 设计稿风格:纯黑圆眼 · 黄鼻 · 微笑 · 玫粉蝴蝶结 · 浅粉细描边
    return (
      '<svg viewBox="0 0 110 112" xmlns="http://www.w3.org/2000/svg">' +
        // 大爱心
        '<path d="M55 100 C21 76 6 57 6 38 C6 20 19 9 34 9 C44 9 51 14 55 21 C59 14 66 9 76 9 C91 9 104 20 104 38 C104 57 89 76 55 100 Z" fill="' + color + '"/>' +
        '<path d="M55 100 C21 76 6 57 6 38 C6 20 19 9 34 9 C44 9 51 14 55 21 C59 14 66 9 76 9 C91 9 104 20 104 38 C104 57 89 76 55 100 Z" fill="none" stroke="rgba(255,255,255,.55)" stroke-width="2.5"/>' +
        // 小猫脸
        '<circle cx="55" cy="50" r="24" fill="#fffdfb" stroke="#eebdc8" stroke-width="2.2"/>' +
        '<path d="M36 34 L39 15 L53 28 Z" fill="#fffdfb" stroke="#eebdc8" stroke-width="2.2" stroke-linejoin="round"/>' +
        '<path d="M74 34 L71 15 L57 28 Z" fill="#fffdfb" stroke="#eebdc8" stroke-width="2.2" stroke-linejoin="round"/>' +
        '<circle cx="47" cy="48" r="3" fill="#3a2c31"/>' +
        '<circle cx="63" cy="48" r="3" fill="#3a2c31"/>' +
        '<ellipse cx="55" cy="55" rx="4.3" ry="3" fill="#ffc61e"/>' +
        '<path d="M51 62 q4 4 8 0" stroke="#3a2c31" stroke-width="1.9" fill="none" stroke-linecap="round"/>' +
        '<ellipse cx="39" cy="56" rx="5" ry="3.4" fill="#ffb3c4" opacity=".8"/>' +
        '<ellipse cx="71" cy="56" rx="5" ry="3.4" fill="#ffb3c4" opacity=".8"/>' +
        '<g stroke="#eebdc8" stroke-width="1.8" stroke-linecap="round">' +
          '<path d="M24 45 H36"/><path d="M24 54 H36"/>' +
          '<path d="M74 45 H86"/><path d="M74 54 H86"/>' +
        "</g>" +
        // 蝴蝶结:奇偶两款小变化
        (i % 2 === 0
          ? '<path d="M72 20 C63 9 52 12 54 21 C56 29 67 30 72 23 Z" fill="#ff69b4" stroke="#e8449b" stroke-width="1.8" stroke-linejoin="round"/>' +
            '<path d="M76 20 C85 9 96 12 94 21 C92 29 81 30 76 23 Z" fill="#ff69b4" stroke="#e8449b" stroke-width="1.8" stroke-linejoin="round"/>' +
            '<ellipse cx="74" cy="21" rx="4.4" ry="5.2" fill="#ff8fc0" stroke="#e8449b" stroke-width="1.8"/>'
          : '<circle cx="74" cy="18" r="4.2" fill="#ffd166" stroke="#f0b43c" stroke-width="1.6"/>') +
      "</svg>"
    );
  }

  if (ring) {
    var html = "";
    SPOTS.forEach(function (spot, i) {
      var color = PALETTE[i % PALETTE.length];
      html +=
        '<div class="hk hk--pop' + (spot.extra ? " hk--extra" : "") + '"' +
        ' style="left:' + spot.l + ";top:" + spot.t + ";--size:" + spot.s + "px" +
        ";--rot:" + spot.r + "deg" +
        ";--dur:" + (3.6 + (i % 5) * 0.45).toFixed(2) + "s" +
        ";--delay:" + (i * 0.13).toFixed(2) + "s" +
        ";--pop-delay:" + (0.35 + i * 0.06).toFixed(2) + "s" + '">' +
        heartKittySVG(color, i) +
        "</div>";
    });
    ring.innerHTML = html;
  }

  /* ============================================================
     3. 场景流转
     ============================================================ */
  // Kitty 飞入结束 → 进入悬停状态(可点击)
  if (flyer) {
    flyer.addEventListener("animationend", function (e) {
      if (e.animationName === "fly-in") flyer.classList.add("is-landed");
    });
    // 兜底:动画事件万一没触发
    setTimeout(function () { flyer.classList.add("is-landed"); }, 2300);
  }

  // 场景一 → 场景二:点击信封,Kitty 收起,信封出现
  if (flyer) {
    flyer.addEventListener("click", function () {
      if (busy || sceneFly.hidden) return;
      busy = true;
      flyer.classList.remove("is-landed");
      flyer.classList.add("is-leaving");
      setTimeout(function () {
        sceneFly.hidden = true;
        sceneEnvelope.hidden = false;
        busy = false;
      }, TIMES.flyOut);
    });
  }

  // 场景二 → 场景三:点击信封,封盖翻开,信纸展开
  if (envelopeBtn) {
    envelopeBtn.addEventListener("click", function () {
      if (busy || sceneEnvelope.hidden) return;
      busy = true;
      envelopeBtn.classList.remove("is-closing");
      envelopeBtn.classList.add("is-open");          // 封盖 3D 翻开
      setTimeout(function () {
        sceneEnvelope.hidden = true;
        sceneLetter.hidden = false;
        // 重放信纸展开动画
        letter.classList.remove("is-folding");
        void letter.offsetWidth;
        refoldBtn.hidden = false;
        refoldBtn.classList.remove("is-hiding");
        showToast("打开啦!💌");
        busy = false;
      }, TIMES.flap);
    });
  }

  // 场景三 → 场景二:重新折好信件(按钮隐藏 + 信纸折叠回信封)
  if (refoldBtn) {
    refoldBtn.addEventListener("click", function () {
      if (busy || sceneLetter.hidden) return;
      busy = true;
      refoldBtn.classList.add("is-hiding");           // 先隐藏按钮
      letter.classList.add("is-folding");             // 信纸折叠
      setTimeout(function () {
        refoldBtn.hidden = true;
        sceneLetter.hidden = true;
        sceneEnvelope.hidden = false;
        envelopeBtn.classList.remove("is-open");
        envelopeBtn.classList.add("is-closing");      // 封盖合上
        setTimeout(function () {
          envelopeBtn.classList.remove("is-closing");
          busy = false;
        }, TIMES.fold);
      }, TIMES.fold);
    });
  }
})();
