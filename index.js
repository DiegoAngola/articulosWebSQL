let salirBusqueda = document.querySelector("#salirB");


let titulo = document.querySelector("#titulo");
let seccionProducto = document.querySelector("#producto");
let descripcion = document.querySelector("#desc");
let urlImagen = document.querySelector("#dirImg");
let botonUno = document.querySelector("#btnUno");
let botonDos = document.querySelector("#btnDos");







(function(){
    if (!window.openDatabase){
        alert("Este navegador no soporta la API WebSQL");
    }else{
        console.log("Este navegador soporta la API WebSQL");
    }
});

let dbComercio;

function openDB(){
    dbComercio = openDatabase("dbComercio", "1.0","Base de datos del comercio",3 * 1024 * 1024);

    if(!dbComercio){
        alert("No se pudo crear la base de datos");
        javascriptAbort();
    }else {
        console.log("La base de datos se creó correctamente");
    }


function javascriptAbort(){
    throw new Error("Por no poder abrir la base de datos, abortamos javascript")
}
console.log(dbComercio.version)
}


function createTableArticulos(){
    console.log("Creando tabla articulos");
    dbComercio.transaction(function(tx){
        tx.executeSql("CREATE TABLE IF NOT EXISTS Articulos (id integer primary key autoincrement, descripcion TEXT, imagen TEXT)");
    })
}

let producto = {
    id: 0,
    descripcion: "",
    imagen:"",
}

let des, img;

function agregar(){
    console.log("Agregamos articulo");
    dbComercio.transaction(function(tx){
        // ID NO SE CARGA PORQUE LO DEFINIMOS AUTOINCREMENT
        des = descripcion.value.trim();
        img = urlImagen.value.trim();

        if(des.length === 0 || img.length === 0)return;

        producto.descripcion = des;
        producto.imagen = img;

        tx.executeSql(
            "INSERT INTO Articulos (descripcion, imagen) VALUES (?,?)",[producto.descripcion,producto.imagen],itemInserted
        );

    });
    mostrarArticulos();
    createTableArticulos();
}

function itemInserted(tx, results){
    console.log("id: ", results.insertId);
}

let cantidad;
function mostrarArticulos(){
    console.log("mostramos articulos");
    dbComercio.transaction(function(tx){
        tx.executeSql("SELECT * FROM Articulos", [], function(tx,results){
            cantidad = results.rows.length;
            armaTemplate(results);
        })
    })
}

function armaTemplate(results){
    let template = "", row;
    for (let i = 0; i < cantidad; i++){
        row = results.rows.item(i);

        producto.id = row.id;
        producto.descripcion = row.descripcion;
        producto.imagen = row.imagen;

        template += `<article>
                         <div class="edicionImg">
                         <div class="trash" onclick="eliminarItem(${producto.id})"><img src="papelera.png"></div>
                         <div class="edit" onclick="editarItem(${producto.id})"><img src="pincel.png"></div>
                         </div>
                        <h3 class="descripcion">${producto.descripcion}</h3>
                        <img class="imagen" src="${producto.imagen}">
                    </article>` 

    }
    document.querySelector("#producto").innerHTML = template;
}

function dropTable(){
    dbComercio.transaction(function(tx){
        tx.executeSql(
            "DROP TABLE Articulos", [],
            function(tx,results){
                console.log("Tabla eliminada");
                document.querySelector("#producto").innerHTML = "";
            },
            function(tx,error){
                console.error("Error: ",error);
            }
        )
    })
}


function listado(){
    let arrayProductos = [];
    dbComercio.transaction(function(tx){
        tx.executeSql("SELECT * FROM Articulos", [], function(tx,results){
            cantidad = results.rows.length;
            for (let i = 0; i < cantidad; i++){
                row = results.rows.item(i);
                producto = row;
                arrayProductos[i] = producto;
            }
            localStorage.setItem('articulos', JSON.stringify(arrayProductos));
            location.href = 'resultados.html';
        })
    })
}

function eliminarItem(id){
    console.log("Borrando registro: ", id);

    dbComercio.transaction(function(tx){
        tx.executeSql("DELETE FROM Articulos WHERE id=?",[id],
        
        function(tx, results){
            console.log(results);
            console.info('Registro borrado satisfactoriamente');
        },
        function (tx, error){
            console.log(error)
        });
    },null)
    mostrarArticulos();
}

function editarItem(nroProd){
console.log("Actualizando registro: ", nroProd);
muestraTablaSinBtns();
document.querySelector("#titulo").innerHTML = "Edicion de producto";
botonUno.value = "Modificar";
botonUno.classList.add("colorGreen");
botonDos.value = "Cancelar";
botonDos.classList.add("colorRed");
botonUno.setAttribute("onclick",`modificar(${nroProd})`);
botonDos.setAttribute("onclick","limpiarCancelar()");


dbComercio.transaction(function(tx){
    tx.executeSql("SELECT * FROM Articulos WHERE id=?", [nroProd],
    function(tx,results){
        cantidad = results.rows.length;
        if (cantidad !== 1) console.log("Error, se encontraron mas de un registro en la edicion");
        
        producto = results.rows.item(0);

        descripcion.value = producto.descripcion;
        urlImagen.value = producto.imagen;

   });
});
}


function muestraTablaSinBtns(){
    console.log("mostrando tabla sin botones");
    dbComercio.transaction(function(tx){
        tx.executeSql("SELECT * FROM Articulos",[], function(tx,results){
            cantidad = results.rows.length;
            armaTemplateSinBtns(results);
        })
    });
}


function armaTemplateSinBtns(results){
    let template = '', row;

    for(let i = 0; i < cantidad; i++){
        row = results.rows.item(i);

        producto.id = row.id;
        producto.descripcion = row.descripcion;
        producto.imagen = row.imagen;

        template += `<article>
                     <h3 class="descripcion">${producto.descripcion}</h3>
                     <img src="${producto.imagen}" class="imagen">
                     </article>`
    }
    document.querySelector("#producto").innerHTML = template;
}

function modificar(nroProd){
    console.log("Modificamos registro: ", nroProd);
    des = descripcion.value.trim();
    img = urlImagen.value.trim();
    if (des.length === 0 || img.length === 0)return;


    producto = {
        id: nroProd,
        descripcion: des,
        imagen: img
    };

    dbComercio.transaction(function(tx){
        console.log(producto.descripcion, " - ", producto.imagen);
        tx.executeSql("UPDATE Articulos SET descripcion=?, imagen=? WHERE id=?",
        [producto.descripcion, producto.imagen, producto.id]);
    });
    limpiarCancelar();
}

function limpiarCancelar(){
    descripcion.value = "";
    urlImagen.value = "";
    titulo.innerHTML = "Nuevo Producto";
    botonUno.value = "Agregar";
    botonUno.classList.remove("colorGreen");
    botonDos.value = "Listado";
    botonDos.classList.remove("colorRed");
    botonUno.setAttribute("onclick","agregar()");
    botonDos.setAttribute("onclick", "listado()");
    mostrarArticulos();
}



function busqueda(){
    document.querySelector("#agrego").classList.add("disable");
    salirBusqueda.disabled = false;
    let aBuscar = document.querySelector("#aBuscar").value;
    if(aBuscar.trim().length === 0){
        muestraTablaSinBtns();
    }else {
        console.log("Leyendo con Select lo pedido");
        dbComercio.transaction(function(tx){
            let q = "SELECT * FROM Articulos WHERE descripcion LIKE ?";
            console.log(q);
            tx.executeSql(q, [aBuscar.trim()+"%"],function(tx, results){
                cantidad = results.rows.length;
                console.log(cantidad);
                armaTemplateSinBtns(results);
            })
        })
    }
}

function salirBusquedaA(){
    aBuscar.value = "";
    mostrarArticulos();
    document.querySelector("#agrego").classList.remove("disable");
    salirBusqueda.disabled = true;
}

function main(){
    openDB();
    createTableArticulos();
    mostrarArticulos();
}

main();