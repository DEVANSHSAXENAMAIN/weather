// ----------- Animated Weather App JS -----------

// Weather Emoji Map
const weatherEmojis = {
    Clear: "☀️",
    Clouds: "☁️",
    Rain: "🌧️",
    Drizzle: "🌦️",
    Thunderstorm: "⛈️",
    Snow: "❄️",
    Mist: "🌫️",
    Fog: "🌫️",
    Haze: "🌫️",
    Smoke: "🌫️",
    Dust: "🌫️",
    Sand: "🌫️",
    Ash: "🌫️",
    Squall: "🌬️",
    Tornado: "🌪️"
};
// Weather Sounds Map
const weatherSounds = {
    Clear: "sounds/clear.mp3",
    Clouds: "sounds/clouds.mp3",
    Rain: "sounds/rain.mp3",
    Drizzle: "sounds/rain.mp3",
    Thunderstorm: "sounds/thunder.mp3",
    Snow: "sounds/snow.mp3"
};
// Background Class Map
const bgClassMap = {
    Clear: "clear",
    Clouds: "clouds",
    Rain: "rain",
    Drizzle: "rain",
    Thunderstorm: "thunderstorm",
    Snow: "snow"
};

const show = document.getElementById("show");
const search = document.getElementById("search");
const cityVal = document.getElementById("city");
const splash = document.getElementById("splash");
const container = document.querySelector('.container');
const audio = document.getElementById('weather-audio');
const darkToggle = document.getElementById('dark-toggle');
const darkIcon = document.getElementById('dark-icon');
const soundToggle = document.getElementById('sound-toggle');
const soundIcon = document.getElementById('sound-icon');
const key = "2f745fa85d563da5adb87b6cd4b81caf";

// --- Settings State ---
let isDarkMode = false;
let isSoundOn = true;

// --------- SPLASH SCREEN ---------
window.addEventListener("load", () => {
    // Load preferences
    loadSettings();
    setDarkMode(isDarkMode);
    setSoundMode(isSoundOn);

    setTimeout(() => {
        splash.style.opacity = 0;
        setTimeout(() => {
            splash.style.display = "none";
            container.classList.remove("hidden");
            getWeather();
        }, 650);
    }, 1400);
});

// --------- MAIN WEATHER FUNCTION ---------
function getWeather() {
    let cityValue = cityVal.value.trim() || "Varanasi";
    if (cityValue.length == 0) {
        show.innerHTML = `<h3 class="error">Please enter a city name</h3>`;
        setWeatherAnim();
        stopWeatherSound();
        setBodyClass();
        return;
    }
    let url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(cityValue)}&appid=${key}&units=metric`;

    fetch(url)
        .then(resp => resp.json())
        .then(data => {
            if (data.cod != 200) throw new Error("Not Found");
            const city = data.name;
            const country = data.sys.country;
            const weatherMain = data.weather[0].main;
            const weatherDesc = data.weather[0].description;
            const icon = data.weather[0].icon;
            const temp = Math.round(data.main.temp);
            const temp_min = Math.round(data.main.temp_min);
            const temp_max = Math.round(data.main.temp_max);

            const emoji = weatherEmojis[weatherMain] || "🌈";
            const iconUrl = `https://openweathermap.org/img/wn/${icon}@4x.png`;

            show.innerHTML = `
                <h2>
                    <span>${emoji}</span>
                    <span>${city}, ${country}</span>
                </h2>
                <h4 class="weather">${weatherMain}</h4>
                <h4 class="desc">${weatherDesc}</h4>
                <img src="${iconUrl}" alt="${weatherMain}"/>
                <h1>${temp}&#176;C</h1>
                <div class="temp_container">
                    <div>
                        <h4 class="title">min</h4>
                        <h4 class="temp">${temp_min}&#176;C</h4>
                    </div>
                    <div>
                        <h4 class="title">max</h4>
                        <h4 class="temp">${temp_max}&#176;C</h4>
                    </div>
                </div>
            `;
            setWeatherAnim();
            // Play weather sound if enabled
            if (isSoundOn) playWeatherSound(weatherMain);
            else stopWeatherSound();
            setBodyClass(weatherMain);
        })
        .catch(() => {
            show.innerHTML = `<h3 class="error">City not found</h3>`;
            setWeatherAnim();
            stopWeatherSound();
            setBodyClass();
        });
}

// -------- Animate Weather Card --------
function setWeatherAnim() {
    show.classList.remove('animated');
    void show.offsetWidth;
    setTimeout(() => show.classList.add('animated'), 30);
}

// -------- Weather Sounds --------
function playWeatherSound(weatherType) {
    let soundUrl = weatherSounds[weatherType];
    if (!soundUrl || !isSoundOn) { stopWeatherSound(); return; }
    if (audio.src !== window.location.origin + '/' + soundUrl) audio.src = soundUrl;
    audio.volume = 0.29;
    audio.play().catch(() => {});
}
function stopWeatherSound() {
    audio.pause();
    audio.currentTime = 0;
    audio.src = "";
}

// -------- Dynamic Background & CSS --------
function setBodyClass(weatherType) {
    document.body.className = isDarkMode ? "darkmode" : "";
    if (weatherType && bgClassMap[weatherType]) {
        document.body.classList.add(bgClassMap[weatherType]);
    }
}

// --------- SEARCH HANDLERS ---------
search.addEventListener("click", getWeather);
cityVal.addEventListener("keydown", e => {
    if (e.key === "Enter") getWeather();
});

// --------- TOGGLE HANDLERS ---------
darkToggle.addEventListener("click", () => {
    setDarkMode(!isDarkMode);
    saveSettings();
});
soundToggle.addEventListener("click", () => {
    setSoundMode(!isSoundOn);
    saveSettings();
});

function setDarkMode(val) {
    isDarkMode = val;
    if (isDarkMode) {
        document.body.classList.add("darkmode");
        darkIcon.textContent = "☀️";
        darkToggle.title = "Switch to Light Mode";
    } else {
        document.body.classList.remove("darkmode");
        darkIcon.textContent = "🌙";
        darkToggle.title = "Switch to Dark Mode";
    }
    // Re-apply weather background class if needed
    setBodyClass();
}

function setSoundMode(val) {
    isSoundOn = val;
    if (isSoundOn) {
        soundIcon.textContent = "🔈";
        soundToggle.title = "Mute Weather Sounds";
        // If on, resume sound if weather is displayed
        const weatherMain = show.querySelector('.weather')?.textContent;
        if (weatherMain) playWeatherSound(weatherMain);
    } else {
        soundIcon.textContent = "🔇";
        soundToggle.title = "Unmute Weather Sounds";
        stopWeatherSound();
    }
}

// --------- PERSIST SETTINGS ---------
function saveSettings() {
    localStorage.setItem('weatherapp-darkmode', JSON.stringify(isDarkMode));
    localStorage.setItem('weatherapp-sound', JSON.stringify(isSoundOn));
}
function loadSettings() {
    const d = localStorage.getItem('weatherapp-darkmode');
    const s = localStorage.getItem('weatherapp-sound');
    isDarkMode = d === null ? false : JSON.parse(d);
    isSoundOn = s === null ? true : JSON.parse(s);
}