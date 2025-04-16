const apiKey = "fd72acf9c7c0c1649b65459c092a274f";

window.onload = () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      pos => fetchWeatherByCoords(pos.coords.latitude, pos.coords.longitude),
      () => alert("Location access denied. Please search manually.")
    );
  }
  document.getElementById("unitSelect").addEventListener("change", () => {
    const city = document.getElementById("cityInput").value.trim();
    if (city) searchWeather(city);
  });
};

async function searchWeather(city = null) {
  city = city || document.getElementById("cityInput").value.trim();
  if (!city) return alert("Please enter a city name");

  const unit = document.getElementById("unitSelect").value;
  const unitSymbol = unit === "metric" ? "°C" : "°F";

  try {
    const weatherRes = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=${unit}`
    );
    const weatherData = await weatherRes.json();
    if (weatherData.cod !== 200) throw new Error(weatherData.message);

    const forecastRes = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=${unit}`
    );
    const forecastData = await forecastRes.json();

    updateCurrentWeather(weatherData, unitSymbol);
    updateForecast(forecastData, unitSymbol);
    setBackground(weatherData.weather[0].main);
  } catch (error) {
    alert("Error: " + error.message);
  }
}

async function fetchWeatherByCoords(lat, lon) {
  const unit = document.getElementById("unitSelect").value;
  const unitSymbol = unit === "metric" ? "°C" : "°F";

  try {
    const weatherRes = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=${unit}`
    );
    const weatherData = await weatherRes.json();

    const forecastRes = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=${unit}`
    );
    const forecastData = await forecastRes.json();

    updateCurrentWeather(weatherData, unitSymbol);
    updateForecast(forecastData, unitSymbol);
    setBackground(weatherData.weather[0].main);
    document.getElementById("cityInput").value = weatherData.name;
  } catch (error) {
    alert("Location-based weather not available.");
  }
}

function updateCurrentWeather(data, unitSymbol) {
  const { main, weather, wind, clouds, sys } = data;

  document.getElementById("temperature").innerText = `${Math.round(main.temp)}${unitSymbol}`;
  document.getElementById("condition").innerText = weather[0].description;
  document.getElementById("location").innerText = `${data.name}, ${data.sys.country}`;
  document.getElementById("humidity").innerText = `${main.humidity}%`;
  document.getElementById("wind").innerText = `${wind.speed} ${unitSymbol === "°C" ? "km/h" : "mph"}`;
  document.getElementById("pressure").innerText = `${main.pressure} hPa`;
  document.getElementById("clouds").innerText = `${clouds.all}%`;

  const sunrise = new Date(sys.sunrise * 1000);
  const sunset = new Date(sys.sunset * 1000);

  document.getElementById("sunrise").innerText = sunrise.toLocaleTimeString();
  document.getElementById("sunset").innerText = sunset.toLocaleTimeString();
}
function updateForecast(data, unitSymbol) {
  const forecastEl = document.getElementById("forecast");
  forecastEl.innerHTML = "";

  const filtered = data.list.filter(item => item.dt_txt.includes("12:00:00"));
  filtered.slice(0, 5).forEach(day => {
    const date = new Date(day.dt_txt);
    const dayName = date.toLocaleDateString("en-US", { weekday: "short" });

    const weatherDesc = day.weather[0].description;

    const box = document.createElement("div");
    box.className = "day-box";
    box.innerHTML = `
      <h4>${dayName}</h4>
      <img src="https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png" alt="${weatherDesc}" />
      <p>${Math.round(day.main.temp)}${unitSymbol}</p>
      <p class="desc">${weatherDesc}</p>
    `;
    forecastEl.appendChild(box);
  });
} 
function setBackground() {
  const hour = new Date().getHours();
  let image = "";

  if (hour >= 6 && hour < 12) {
    image = "Morning.jpg"; // 6 AM – 12 PM
  } else if (hour >= 12 && hour < 18) {
    image = "Afternoon.jpg"; // 12 PM – 6 PM
  } else {
    image = "Night.jpg"; // 6 PM – 6 AM
  }

  document.body.style.backgroundImage = `url('${image}')`;
  document.body.style.backgroundSize = "cover";
  document.body.style.backgroundPosition = "center";
  document.body.style.backgroundRepeat = "no-repeat";
  document.body.style.transition = "background-image 1s ease-in-out";
}
window.onload = setBackground;
