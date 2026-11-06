const menuButton = document.querySelector(".menu-toggle");
const navigation = document.querySelector("#main-navigation");
menuButton.hidden = false;

function closeMenu() {
  menuButton.setAttribute("aria-expanded", "false");
  navigation.classList.remove("is-open");
}

menuButton.addEventListener("click", () => {
  const open = menuButton.getAttribute("aria-expanded") !== "true";
  menuButton.setAttribute("aria-expanded", String(open));
  navigation.classList.toggle("is-open", open);
});

navigation.addEventListener("click", (event) => {
  if (event.target.closest("a")) closeMenu();
});

document.addEventListener("keydown", (event) => {
  if (
    event.key === "Escape" &&
    menuButton.getAttribute("aria-expanded") === "true"
  ) {
    closeMenu();
    menuButton.focus();
  }
});

document.addEventListener("click", (event) => {
  if (!event.target.closest(".header-inner")) closeMenu();
});

// Light / dark preview switch in the hero. Hidden without JavaScript,
// where the light screenshot stays visible.
const modeSwitch = document.querySelector(".mode-switch");
const heroWindow = document.querySelector(".hero-window");
if (modeSwitch && heroWindow) {
  modeSwitch.hidden = false;
  modeSwitch.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-mode]");
    if (!button) return;
    heroWindow.dataset.mode = button.dataset.mode;
    for (const other of modeSwitch.querySelectorAll("button")) {
      other.setAttribute("aria-pressed", String(other === button));
    }
  });
}

// Name the visitor's system on the download buttons. Without JavaScript, or on a
// system we do not ship for, they keep the generic "Windows & macOS" label.
function detectPlatform() {
  const ua = navigator.userAgent || "";
  const hint = navigator.userAgentData?.platform || "";
  const platform = hint || navigator.platform || "";
  if (/android/i.test(ua) || /^android/i.test(hint)) return "android";
  if (/iphone|ipad|ipod/i.test(ua)) return "ios";
  if (/^mac/i.test(platform) || /macintosh/i.test(ua)) {
    // iPadOS reports itself as a Mac, but a real Mac has no touch screen.
    return navigator.maxTouchPoints > 1 ? "ios" : "macos";
  }
  if (/^win/i.test(platform) || /windows/i.test(ua)) return "windows";
  if (/cros|chrome os/i.test(`${ua} ${hint}`)) return "other";
  if (/linux|x11/i.test(`${platform} ${ua}`)) return "linux";
  return "other";
}

const platformNames = { windows: "Windows", macos: "macOS" };
const platformNotes = {
  android:
    "Ultra Tasks is a desktop app for now. Open this page on your Windows or Mac computer to download it.",
  ios: "Ultra Tasks is a desktop app for now. Open this page on your Windows or Mac computer to download it.",
  linux:
    "Ultra Tasks is available for Windows and macOS. A Linux version is planned.",
};
const platform = detectPlatform();
document.documentElement.dataset.os = platform;
if (platformNames[platform]) {
  for (const name of document.querySelectorAll("[data-os-name]")) {
    name.textContent = platformNames[platform];
  }
}
const platformNote = document.querySelector("[data-os-note]");
if (platformNote && platformNotes[platform]) {
  platformNote.textContent = platformNotes[platform];
}

document.querySelector("#copyright-year").textContent =
  new Date().getFullYear();
