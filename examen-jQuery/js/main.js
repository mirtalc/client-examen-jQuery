// ========================================================================
//                         Variables / constantes globales
// ========================================================================
const BASEURL = "http://localhost:3000/";


// ========================================================================
//                         Función inicial
// ========================================================================

/**
 * Función inicial que se ejecuta cuando la página está cargada
 */
$(document).ready(function () {
    console.log("¡Bienvenido/a!");

    cargarTodasCategorias();
    cargarArticulos();
    setListeners();
});

// ========================================================================
//                         Listeners y eventos
// ========================================================================

/**
 * Establece los listeners de eventos de la página (apoyándose en otras funciones)
 */
function setListeners() {
    setListenersCapaCategorias();
    setListenersCapaArticulos();
    setListenersModal();
}

/**
 * Establece los listeners de eventos del menú lateral con las categorías
 */
function setListenersCapaCategorias() {
    // Listeners menú lateral categorías
    $("#categorias").on("click", ".categoria", function () {
        cargarArticulos($(this).attr("id"));
    })
}

/**
 * Establece los listeners de eventos de cada artículo que se pinta
 */
function setListenersCapaArticulos() {
    $("#articulos").on("click", ".caja", function () {

        // Rellenamos modal
        $("#ficha #id").val($(this).data("idArt"));
        $("#ficha #id").attr("disabled", true);

        $("#ficha #nombre").val($(this).data("nombreArt"));
        $("#ficha #descripcion").val($(this).data("descripcionArt"));
        $("#ficha #precio").val($(this).data("precioArt"));
        $("#ficha").data({
            "categoria": $(this).data("idCatArt")
        });

        // Lo mostramos
        $("#modalArticulo").modal("show");
    })
}

/**
 * Establece los listeners de eventos de la ventana modal
 */
function setListenersModal() {
    $("#modalArticulo #btnGrabar").on("click", function () {
        let miFormSerializado;

        // Obtenemos datos del formulario   
        miFormSerializado = $("#ficha").serialize();

        // Modificamos en BBDD
        $.ajax({
            type: "PATCH",
            url: BASEURL + "articulos/" + $("#ficha #id").val(),
            data: miFormSerializado
        }).done(function (response) {
            console.log("OK al modificar", response);
        }).fail(function (error) {
            console.log("ERROR del serivor al modificar:", error);
            alert("Ha habido un error al modificar. Revisa consola o contacta con admin");
        }).always(function () {
            console.log("Vamos a cerrar el modal...");
            $("#modalArticulo").modal("hide");
            // Cargamos categoría en la que estábamos
            cargarArticulos($("#ficha").data("categoria"));
        });
    });
}


// ========================================================================
//                         Carga de datos y AJAX
// ========================================================================

/**
 * Pide a la BBDD todas las categorías y llama a otra función para pintarlas
 */
function cargarTodasCategorias() {
    $.ajax({
        type: "GET",
        url: BASEURL + "categorias"
    }).done(function (response) {
        console.log("OK; categorias del servidor:", response);
        pintarCategorias(response);
    }).fail(function (error) {
        console.log("ERROR al obtener las categorías; error del servidor:", error);
        alert("Ha habido un error al obtener las categorías. Revisa consola o contacta con admin");
    });
}

/**
 * Pide a la BBDD los artículos de una categoría recibida por parámetro.
 * Además, si no recibe ninguna categoría por parámetro, redirige a otra función para averiguar cuál es la activa por defecto.
 * Nota: En las recomendaciones del examen se llama "articulosCategoria"
 */
function cargarArticulos(idCategoria) {
    // Si no nos pasan por parámetro (sería undefined, que se cumple con == null pero no se cumpliría con === null)
    if (idCategoria == null) {
        obtenerCategoriaPorDefecto();
    } else {
        $.ajax({
            type: "GET",
            url: BASEURL + "articulos?idCat=" + idCategoria,
        }).done(function (response) {
            console.log("OK; articulos del servidor:", response);
            pintarArticulos(response);

        }).fail(function (error) {
            console.log("ERROR; error del servidor:", error);
            alert("Ha habido un error. Revisa consola o contacta con admin");
        });
    }
}

/**
 * Realiza una petición a la BBDD para averiguar cuál es la categoría activa por defecto.
 * Después, llama a la función de carga con dicha categoría.
 * MEJORA PENDIENTE: Que gestione qué pasa cuando todas estan en "false" o no existe el campo "activa"
 */
function obtenerCategoriaPorDefecto() {
    $.ajax({
        type: "GET",
        url: BASEURL + "categorias?activa=true"
    }).done(function (response) {
        console.log("Categorías activas en BBDD", response);
        console.log("Pintaremos la primera activa (por si hubiera más de una): ", response[0].id);
        cargarArticulos(response[0].id);
    }).fail(function (error) {
        console.log("Vaya! Error inesperado. No se han podido obtener categorías activas", error);
    });

}

// ========================================================================
//                         Pintar en capas
// ========================================================================

/**
 * Recibe un array de categorías y las pinta en la capa correspondiente
 */
function pintarCategorias(categorias) {
    // Limpiamos la capa de categorias
    $("#categorias").empty();

    // Las vamos añadiendo
    $.each(categorias, function (index, categoria) {
        console.log("procesando categoria ", categoria);

        // Creamos categoria
        let miCategoria = $("<div/>").attr("id", categoria.id);
        miCategoria.append("<p>" + categoria.nombre + "</p>");
        miCategoria.addClass("categoria");

        // La añadimos
        $("#categorias").append(miCategoria);
    });
}

/**
 * Recibe un array de artículos y los pinta en la capa correspondiente
 */
function pintarArticulos(articulos) {

    // Limpiamos la capa de articulos
    $("#articulos").empty();

    // Por cada artículo, creamos una nueva capa y lo añadimos
    $.each(articulos, function (index, articulo) {
        let miArticulo, propiedadesObjeto;

        // Creamos articulo
        miArticulo = $("<div/>").attr("id", articulo.id);
        miArticulo.data({
            "idArt": articulo.id,
            "nombreArt": articulo.nombre,
            "descripcionArt": articulo.descripcion,
            "precioArt": articulo.precio,
            "idCatArt": articulo.idCat
        });

        // Pintamos un párrafo por cada una de las propiedades del artículo
        // (también podemos ir una a una, pero por variar y por si no supiéramos cuáles son en la BBDD)
        miArticulo.append("<p><b>INFORMACIÓN SOBRE " + articulo.nombre + "</b></p>");

        propiedadesObjeto = Object.keys(articulo);

        $.each(propiedadesObjeto, function (index, propiedad) {
            miArticulo.append("<p>" + propiedad + ": " + articulo[propiedad] + "</p>");
        });

        // Añadimos la clase CSS al artículo
        miArticulo.addClass("caja");

        // Añadimos artículo a la DIV de artículos
        $("#articulos").append(miArticulo);
    });
}

// ========================================================================
//                          FIN
// ========================================================================
