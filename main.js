// User settings
const settings = {
  isPaused: false,
  fps: 0,
  isLightTheme: false,
  highlightColor: "#f57c00", // Orange 700
};

// Matrix for numbers in a 3x5 grid
const numbers = [
  [1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 1, 1], // 0
  [1, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1], // 1
  [1, 0, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 0, 1], // 2
  [1, 0, 1, 0, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1], // 3
  [1, 1, 1, 0, 0, 0, 0, 1, 0, 0, 1, 1, 1, 1, 1], // 4
  [1, 1, 1, 0, 1, 1, 0, 1, 0, 1, 1, 0, 1, 1, 1], // 5
  [1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 0, 1, 1, 1], // 6
  [1, 0, 0, 0, 0, 1, 0, 1, 1, 1, 1, 1, 0, 0, 0], // 7
  [1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1], // 8
  [1, 1, 1, 0, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1], // 9
];

const body = document.querySelector("body");
const digits = Array.from(document.querySelectorAll(".block"));

const blocks = [];
for (let i = 0; i < 4; i++) {
  blocks.push(digits.slice(i * 15, i * 15 + 15));
}

const time = {
  seconds: "",
  minutes: "",
  hours: "",
  highlight: null,
};

// FPS Limiter; see: https://docs.wallpaperengine.io/en/web/performance/fps.html
let last = performance.now() / 1000;
let fpsThreshold = 0;

// Page completely loaded
window.onload = function () {
  setLightTheme(settings.isLightTheme);
  setHighlightColor(settings.highlightColor);
  start();
};

// See: https://docs.wallpaperengine.io/en/web/api/propertylistener.html
window.wallpaperPropertyListener = {
  setPaused: function (isPaused) {
    settings.isPaused = isPaused;

    if (!settings.isPaused) {
      start();
    }
  },

  applyGeneralProperties: function (properties) {
    if (properties.fps) {
      settings.fps = properties.fps;
    }
  },

  applyUserProperties: function (properties) {
    if (properties.islighttheme) {
      settings.isLightTheme = properties.islighttheme.value;
      setLightTheme(settings.isLightTheme);
    }

    if (properties.schemecolor) {
      // Convert the custom color to 0 - 255 range for CSS usage
      const highlightColor = properties.schemecolor.value
        .split(" ")
        .map(function (color) {
          return Math.ceil(color * 255);
        });

      settings.highlightColor = `rgb(${highlightColor})`;
      setHighlightColor(settings.highlightColor);
    }
  },
};

// Main loop
const run = () => {
  if (settings.isPaused) return;

  // Keep animating
  window.requestAnimationFrame(run);

  // Figure out how much time has passed since the last animation
  const now = performance.now() / 1000;
  const dt = Math.min(now - last, 1);
  last = now;

  // If there is an FPS limit, abort updating the animation if we have reached the desired FPS
  if (settings.fps > 0) {
    fpsThreshold += dt;
    if (fpsThreshold < 1.0 / settings.fps) {
      return;
    }
    fpsThreshold -= 1.0 / settings.fps;
  }

  // FPS limit not reached, draw animation!
  let date = new Date();
  let hours = date.getHours().toString();
  let minutes = date.getMinutes().toString();
  let seconds = date.getSeconds().toString();
  seconds = padWithZero(seconds);
  minutes = padWithZero(minutes);
  hours = padWithZero(hours);

  // Update seconds
  if (seconds !== time.seconds) {
    for (let digit = 0; digit < digits.length; digit++) {
      let digitElement = digits[digit];

      if (digit === +seconds) {
        digitElement.classList.add("highlight");
        if (time.highlight !== null)
          digits[time.highlight].classList.remove("highlight");

        time.highlight = digit;
        time.seconds = seconds;
      }
    }
  }

  // Update minutes
  if (minutes !== time.minutes) {
    setNum(blocks[2], minutes[0]);
    setNum(blocks[3], minutes[1]);
    time.minutes = minutes;
  }

  // Update hours
  if (hours !== time.hours) {
    setNum(blocks[0], hours[0]);
    setNum(blocks[1], hours[1]);
    time.hours = hours;
  }
};

const start = () => window.requestAnimationFrame(run);

const setLightTheme = (isLightTheme) =>
  body.classList[isLightTheme ? "add" : "remove"]("light-theme");

const setHighlightColor = (color) =>
  body.style.setProperty("--highlight-color", color);

const padWithZero = (number) => (number.length === 1 ? "0" + number : number);

const setNum = (block, num) => {
  let n = numbers[num];
  for (let i = 0; i < block.length; i++) {
    block[i].classList[n[i] === 1 ? "add" : "remove"]("active");
  }
};
