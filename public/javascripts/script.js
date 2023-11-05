let mostrador = document.getElementById("mostrador");
let seleccion = document.getElementById("seleccion");
let imgSeleccionada = document.getElementById("img");
let modeloSeleccionado = document.getElementById("modelo");
let descripSeleccionada = document.getElementById("descripcion");
let precioSeleccionado = document.getElementById("precio");
let codigoSeleccionado = document.getElementById("codigo");
let procesadorSeleccionado = document.getElementById("procesador");
let pantallaSeleccionada = document.getElementById("pantalla");
let editar = document.getElementById("editar");
let subir = document.getElementById("subir");
let eliminar = document.getElementById("eliminar")



function cargar(item){
    quitarBordes();
    mostrador.style.width = "90%";
    seleccion.style.width = "40%";
    seleccion.style.opacity = "1";
    item.style.border = "2px solid #39A7FF";
    imgSeleccionada.src = item.getElementsByClassName("img_ghost")[0].innerHTML;
    modeloSeleccionado.innerHTML =  'Modelo: ' + item.getElementsByTagName("p")[0].innerHTML;

    descripSeleccionada.innerHTML = 'Descripción: ' + item.getElementsByTagName("article")[0].innerHTML;

    precioSeleccionado.innerHTML =  'Precio: ' + item.getElementsByTagName("span")[0].innerHTML;

    codigoSeleccionado.innerHTML = 'Codigo: ' + item.getElementsByTagName("section")[0].innerHTML;

    procesadorSeleccionado.innerHTML = 'Procesador: ' + item.getElementsByClassName("procesador")[0].innerHTML;

    pantallaSeleccionada.innerHTML = 'Pantalla: ' + item.getElementsByClassName("pantalla")[0].innerHTML;

    editar.href = '/editproduct/' + item.getElementsByClassName("id")[0].innerHTML;

    subir.href = '/addimg/' + item.getElementsByClassName("id")[0].innerHTML;

    eliminar.href = "/deleteproduct/" + item.getElementsByClassName("id")[0].innerHTML;
}
function cerrar(){
    mostrador.style.width = "100%";
    seleccion.style.width = "0%";
    seleccion.style.opacity = "0";
    quitarBordes();
}
function quitarBordes(){
    var items = document.getElementsByClassName("item");
    for(i=0;i <items.length; i++){
        items[i].style.border = "none";
    }
}