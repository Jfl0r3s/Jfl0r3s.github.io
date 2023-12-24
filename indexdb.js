// indexdb.js
var db;
var request = indexedDB.open("versiculoDatabase", 2);

request.onerror = function(event) {
  console.error("No se pudo abrir la base de datos debido al error: ", event.target.errorCode);
};

request.onupgradeneeded = function(event) {
  db = event.target.result;
  if (!db.objectStoreNames.contains('versiculos')) {
    var objectStore = db.createObjectStore("versiculos", { keyPath: "id", autoIncrement: true });
    objectStore.createIndex("titulo", "titulo", { unique: false });
    objectStore.createIndex("contenido", "contenido", { unique: false });
  }
};

request.onsuccess = function(event) {
  db = event.target.result;
  displayVersiculos();
};

function addVersiculo(titulo, contenido) {
  var transaction = db.transaction(["versiculos"], "readwrite");
  var store = transaction.objectStore("versiculos");
  var versiculo = { titulo: titulo, contenido: contenido };
  var request = store.add(versiculo);

  request.onsuccess = function() {
    displayVersiculos();
    showMessage("Versículo agregado con éxito", "success");
  };

  request.onerror = function(e) {
    console.error("Error al añadir versículo: ", e.target.error);
    showMessage("Error al agregar el versículo", "danger");
  };
}

function displayVersiculos() {
  var objectStore = db.transaction("versiculos").objectStore("versiculos");
  var versiculosContainer = document.querySelector("main");
  versiculosContainer.innerHTML = ""; 

  objectStore.openCursor().onsuccess = function(event) {
    var cursor = event.target.result;
    if (cursor) {
      var div = document.createElement("div");
      div.classList.add("my-4", "text-center");

      var h2 = document.createElement("h2");
      h2.textContent = cursor.value.titulo;
      div.appendChild(h2);

      var p = document.createElement("p");
      p.textContent = cursor.value.contenido;
      p.classList.add("text-left");
      div.appendChild(p);

      versiculosContainer.appendChild(div);

      cursor.continue();
    }
  };
}

function showMessage(text, type) {
  var messageElement = document.getElementById('message');
  if (messageElement) {
    messageElement.textContent = text;
    messageElement.className = `alert alert-${type}`;
    messageElement.style.display = 'block';

    setTimeout(function() {
      messageElement.style.display = 'none';
    }, 4000);
  }
}

document.addEventListener('DOMContentLoaded', function() {
  var form = document.getElementById('formAddVersiculo');
  form.onsubmit = function(e) {
    e.preventDefault();
    addVersiculo(form.versiculoTitulo.value, form.versiculoContenido.value);
    form.versiculoTitulo.value = '';
    form.versiculoContenido.value = '';
  };
});
