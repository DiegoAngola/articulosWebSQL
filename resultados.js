let arrayProductos = JSON.parse(localStorage.getItem('articulos'));
console.log(arrayProductos);


let producto = {
    id: 0,
    descripcion: '',
    imagen: '',
}
let html = '<table><thead><th>Id</th><th>Descripción</th><th>Imagen</th></thead><tbody>';

for (let i = 0; i < arrayProductos.length; i++) {
    producto = arrayProductos[i];
    html += `<tr><td>${producto.id}</td><td>${producto.descripcion}</td><td><img src="${producto.imagen}"></td></tr>`;
}
html += "</table></tbody>";
document.querySelector('.tabla').innerHTML = html;