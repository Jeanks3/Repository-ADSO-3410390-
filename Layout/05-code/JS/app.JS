// Carussel de los videos

document.addEventListener("DOMContentLoaded", () => {
  const contenedorVideos = document.querySelector(".Videos");
  const btnIzq = document.getElementById("btn-izq");
  const btnDer = document.getElementById("btn-der");

  if (contenedorVideos && btnIzq && btnDer) {
    // Distancia que se desplazará por cada clic (ancho de un video aprox. + gap)
    const desplazamiento = 350;

    btnDer.addEventListener("click", () => {
      contenedorVideos.scrollBy({
        left: desplazamiento,
        behavior: "smooth"
      });
    });

    btnIzq.addEventListener("click", () => {
      contenedorVideos.scrollBy({
        left: -desplazamiento,
        behavior: "smooth"
      });
    });
  }
});