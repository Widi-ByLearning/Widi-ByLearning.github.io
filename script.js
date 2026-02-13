const openGiftBtn = document.getElementById("openGiftBtn");
const entry = document.getElementById("entry");
const mainContent = document.getElementById("mainContent");
const revealItems = document.querySelectorAll(".reveal");
const momentCards = document.querySelectorAll(".moment-card");
const noteCards = document.querySelectorAll(".note");
const secretBtn = document.getElementById("secretBtn");
const surprise = document.getElementById("surprise");
const scrollStatus = document.getElementById("scrollStatus");
const buttonStatus = document.getElementById("buttonStatus");

const musicGate = document.getElementById("musicGate");
const trackOptions = document.querySelectorAll(".track-option");
const bgMusic = document.getElementById("bgMusic");
const musicPlayer = document.getElementById("musicPlayer");
const currentTrackName = document.getElementById("currentTrackName");
const toggleMusicBtn = document.getElementById("toggleMusicBtn");
const changeMusicBtn = document.getElementById("changeMusicBtn");

const SONG_PROGRESS_KEY = "valentine_song_progress";

let reachedBottom = false;
let clickedSecret = false;
let revealObserver = null;
let currentSongSrc = "";
let currentSongTitle = "";

function spawnHeart(x, y) {
  const heart = document.createElement("span");
  heart.className = "float-heart";
  heart.textContent = "❤";
  heart.style.left = `${x}px`;
  heart.style.top = `${y}px`;
  document.body.appendChild(heart);

  setTimeout(() => {
    heart.remove();
  }, 900);
}

function maybeUnlock() {
  if (reachedBottom && clickedSecret) {
    surprise.classList.remove("hidden");
    surprise.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

function initRevealObserver() {
  if (revealObserver) {
    return;
  }

  if (!("IntersectionObserver" in window)) {
    revealItems.forEach((item) => item.classList.add("visible"));
    return;
  }

  revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entryItem) => {
        if (entryItem.isIntersecting) {
          entryItem.target.classList.add("visible");
        }
      });
    },
    {
      threshold: 0.12,
    },
  );

  revealItems.forEach((item) => revealObserver.observe(item));
}

function openMusicGate() {
  musicGate.classList.remove("hidden");
  document.body.classList.add("locked");
}

function closeMusicGate() {
  musicGate.classList.add("hidden");
  document.body.classList.remove("locked");
  entry.classList.remove("hidden");
}

function getSavedProgress() {
  try {
    const raw = localStorage.getItem(SONG_PROGRESS_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveSongProgress() {
  if (!currentSongSrc) {
    return;
  }

  const payload = {
    src: currentSongSrc,
    title: currentSongTitle,
    time: bgMusic.currentTime || 0,
  };
  localStorage.setItem(SONG_PROGRESS_KEY, JSON.stringify(payload));
}

function selectSong(src, title) {
  currentSongSrc = src;
  currentSongTitle = title;
  currentTrackName.textContent = title;

  const saved = getSavedProgress();
  const shouldResume = saved && saved.src === src && Number.isFinite(saved.time) && saved.time > 0;

  bgMusic.src = src;

  if (shouldResume) {
    bgMusic.addEventListener(
      "loadedmetadata",
      () => {
        const safeTime = Math.min(saved.time, Math.max(0, bgMusic.duration - 1));
        bgMusic.currentTime = safeTime;
      },
      { once: true },
    );
  }

  bgMusic
    .play()
    .then(() => {
      toggleMusicBtn.textContent = "Pause";
    })
    .catch(() => {
      toggleMusicBtn.textContent = "Play";
    });

  musicPlayer.classList.remove("hidden");
  saveSongProgress();
  closeMusicGate();
}

trackOptions.forEach((option) => {
  option.addEventListener("click", () => {
    selectSong(option.dataset.src, option.dataset.title);
  });
});

toggleMusicBtn.addEventListener("click", () => {
  if (!currentSongSrc) {
    return;
  }

  if (bgMusic.paused) {
    bgMusic.play().then(() => {
      toggleMusicBtn.textContent = "Pause";
    });
  } else {
    bgMusic.pause();
    toggleMusicBtn.textContent = "Play";
  }
});

changeMusicBtn.addEventListener("click", () => {
  openMusicGate();
});

bgMusic.addEventListener("play", () => {
  toggleMusicBtn.textContent = "Pause";
});

bgMusic.addEventListener("pause", () => {
  toggleMusicBtn.textContent = "Play";
});

setInterval(saveSongProgress, 3000);
window.addEventListener("beforeunload", saveSongProgress);

openGiftBtn.addEventListener("click", () => {
  entry.classList.add("hidden");
  mainContent.classList.remove("hidden");

  window.scrollTo({ top: 0, behavior: "smooth" });
  // Fallback: force visible so gallery always appears even if observer fails.
  revealItems.forEach((item) => item.classList.add("visible"));
  initRevealObserver();
});

window.addEventListener("scroll", () => {
  const scrollPosition = window.innerHeight + window.scrollY;
  const pageBottom = document.body.offsetHeight - 40;

  if (scrollPosition >= pageBottom) {
    reachedBottom = true;
    scrollStatus.textContent = "Scroll: selesai";
    maybeUnlock();
  }
});

secretBtn.addEventListener("click", (event) => {
  clickedSecret = true;
  buttonStatus.textContent = "Tombol rahasia: ditekan";
  spawnHeart(event.clientX, event.clientY);
  maybeUnlock();
});

momentCards.forEach((card) => {
  card.addEventListener("click", (event) => {
    card.classList.toggle("active");
    spawnHeart(event.clientX, event.clientY);
  });
});

noteCards.forEach((note) => {
  note.addEventListener("click", (event) => {
    note.classList.toggle("active");
    spawnHeart(event.clientX, event.clientY);
  });
});

openMusicGate();
