(function(){
    if (!window.openDatabase){
        alert("Este navegador no soporta la API WebSQL");
    }else{
        console.log("Este navegador soporta la API WebSQL");
    }
})();

let dbComercio;

function openDB(){
    dbComercio = openDatabase("dbComercio", "1.0","Base de datos del comercio",2*1024);

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

function agregar(){
    console.log("Agregamos articulo");
    dbComercio.transaction(function(tx){
        // ID NO SE CARGA PORQUE LO DEFINIMOS AUTOINCREMENT
        producto.descripcion = document.querySelector("#desc").value;
        producto.imagen = document.querySelector("#dirImg").value;
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
                         <div class="trash" onclick="eliminarItem(${i})"><img src="papelera.png"></div>
                         <div class="edit" onclick="editarItem(${i})"><img src="pincel.png"></div>
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

openDB();
createTableArticulos();
mostrarArticulos();