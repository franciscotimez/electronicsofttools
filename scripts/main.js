
const colors = ['negro', 'marron', 'rojo', 'naranja', 'amarillo', 'verde', 'azul', 'violeta', 'gris', 'blanco'];
const maxHistory = 5;
let historyReg = JSON.parse(localStorage.getItem('historyEST'));

if (historyReg === null) {
    historyReg = [];
}

// Funcion Calculadora
// recibe String con colores.
function calculoResistencia(bandas) {
    let digito1 = colorToNumber(bandas[0]);
    let digito2 = colorToNumber(bandas[1]);
    let multiplier = colorToMultiplier(bandas[2]);

    let resultado = ((digito1 * 10) + digito2) * multiplier;
    return resultado;
}

// Funcion auxiliar
// Tranforma colores a numeros
function colorToNumber(color) {
    return colors.indexOf(color.toLowerCase());
}

// Tranforma colores a multiplicadores
function colorToMultiplier(color) {
    let multiplier = 1;
    for (let index = 0; index < colorToNumber(color); index++) {
        multiplier *= 10;
    }
    return multiplier;
}

// Guardo los ultimos 10 valores calculados
function saveHistory(bandas) {
    let data = {
        date: new Date().toLocaleString(),
        bandas: bandas,
        resultado: calculoResistencia(bandas)
    };

    historyReg.unshift(data);

    if (historyReg.length > maxHistory) {
        historyReg.pop();
    }

    localStorage.setItem("historyEST", JSON.stringify(historyReg));

    return data;
}

// Borra el historial del HTML y del LocalStorage
function clearHistory() {
    historyReg = [];
    localStorage.removeItem("historyEST");
    clearHTMLTable();
}

// Funcion que crea la tabla HTML
function createTableHtml() {
    let tablaHtml = `
    <tr>
    <th>Date</th>
    <th>1ra Banda</th>
    <th>2da Banda</th>
    <th>Multiplicador</th>
    <th>Resultado [ohm]</th>
    </tr>`;

    historyReg.forEach((item) => {
        tablaHtml += `
        <tr>
        <td>${item.date}</td>
        <td>${item.bandas[0]}</td>
        <td>${item.bandas[1]}</td>
        <td>${item.bandas[2]}</td>
        <td>${item.resultado}</td>
        </tr>`;
    });

    return tablaHtml;
}

// Funcion que imprime la tabla en el HTML
function printHTMLTable() {
    // Cargo la tabla en el documento
    let table = document.getElementById('historial');
    table.innerHTML = createTableHtml();
}

// Funcion que borra la tabla del HTML
function clearHTMLTable() {
    // Cargo la tabla en el documento
    let table = document.getElementById('historial');
    table.innerHTML = "";
}


// Funcion que levanta los valores del form en submit
function readInput(event) {
    event.preventDefault();

    let bandas = [];
    bandas[0] = event.target[0].value;
    bandas[1] = event.target[1].value;
    bandas[2] = event.target[2].value;
    document.getElementById('resultado_res').innerText = `Resultado: ${saveHistory(bandas).resultado} [Ohm]`;

    printHTMLTable();
}

// Ejecuciones
// Imprimo la tabla que puede provenir del localStorage
if (historyReg.length > 0) {
    printHTMLTable();
}
else {
    clearHTMLTable();
}

// Agrego listener para el formulario de inputs
let resInput = document.getElementById('res_input_form');
resInput.addEventListener('submit', readInput);

// Agrego listener para el boton de borrado
let clearBtn = document.getElementById('clearBtn');
clearBtn.addEventListener("click", clearHistory);

