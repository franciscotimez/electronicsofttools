const DateTime = luxon.DateTime;

const maxHistory = 5;
let historyReg = JSON.parse(localStorage.getItem('historyEST')) || [];

// Funciones de Calculadoro
/**
 * Calcula el valor de la resistencia segun las bandas de colores.
 * @param   {Object} bandas Objeto bandas de colores
 * @return  {number} Resistencia [Ohm].
 */
function calculoResistencia(bandas) {
    let { b1, b2, mult } = bandas;
    let digito1 = colorToNumber(b1);
    let digito2 = colorToNumber(b2);
    let multiplier = colorToMultiplier(mult);

    return ((digito1 * 10) + digito2) * multiplier;
}

/**
 * Calcula la potencia segun la resistencia y la corriente.
 * @param   {number} resistance Valor de resistencia [Ohm]
 * @param   {number} current Valor de corriente [A]
 * @return  {number} Potencia [W].
 */
function calculoPotencia(resistance, current) {
    return (current ** 2) * resistance;
}

/**
 * Convierte un color ingresado a un numero numero.
 * @param   {string} color  Color a convertir.
 * @return  {number} Valor nominal del color.
 */
function colorToNumber(color) {
    const colors = ['negro', 'marron', 'rojo', 'naranja', 'amarillo', 'verde', 'azul', 'violeta', 'gris', 'blanco'];
    return colors.indexOf(color.toLowerCase());
}

/**
 * Convierte el color de la banda multiplicadora a un numero.
 * @param   {string}    color  Color de banda multiplicadora.
 * @return  {number}    Multiplicador.
 */
function colorToMultiplier(color) {
    const specialColors = ['dorado', 'plateado'];
    if (specialColors.includes(color.toLowerCase())) {
        console.log(specialColors.indexOf(color.toLowerCase()) + 1);
        let multiplier = 0.1 ** (specialColors.indexOf(color.toLowerCase()) + 1);
        return multiplier;
    }
    return 10 ** colorToNumber(color);
}

/**
 * Convierte el color de la banda de tolerancia a un numero.
 * @param   {string} color  Color de banda tolerancia.
 * @return  {number} Tolerancia.
 */
function colorToTolerance(color) {
    const toleranceColors = ['marron', 'rojo', 'dorado', 'plateado'];
    const tolerance = [1, 2, 5, 10];
    if (toleranceColors.includes(color.toLowerCase())) {
        return tolerance[toleranceColors.indexOf(color.toLowerCase())];
    }
}

/**
 * Busca en el array de la serie el valor superior e inferior para evaluar el reemplazo, ademas del error.
 * @param   {number} valor Valor a buscar dentro de la Serie
 * @param   {Object[]} valoresSerie Serie Objetivo
 * @return  {Object} Objeto con el valor superior e inferior con los errores.
 */
function searchReplacement(valor, valoresSerie) {
    const error = (valorReal, valorEstimado) => {
        return (Math.abs(valorEstimado - valorReal) / valorReal) * 100;
    };
    let valorAux = valor;
    let valorInferior = 0;
    let valorSuperior = 10;
    let multiplicador = 1;

    while (valorAux <= 1) {
        valorAux *= 10;
        multiplicador /= 10;
    }

    while (valorAux > 10) {
        valorAux /= 10;
        multiplicador *= 10;
    }

    valoresSerie.forEach((valor, index, arr) => {
        if (valor < valorAux) {
            valorInferior = valor;
            valorSuperior = arr[(index + 1) % arr.length];
        }
    });

    // Fix error fin de array
    if (valorSuperior < valorInferior) {
        valorSuperior *= 10;
    }

    let data = {
        superior: {
            valor: valorSuperior * multiplicador,
            error: error(valor, valorSuperior * multiplicador)
        },
        inferior: {
            valor: valorInferior * multiplicador,
            error: error(valor, valorInferior * multiplicador)
        }
    };
    return data;
}

/**
 * Convierte el valor calculado en un String legible por humanos.
 * @param   {number} valor Valor a buscar dentro de la Serie
 * @return  {string} String Human readable.
 */
function fixToHumanreadable(valor) {
    let valAux = 0;

    if (valor >= 1000000) {
        valAux = valor / 1000000;
        let fixed = 3 - (Math.log(valAux) * Math.LOG10E + 1 | 0);
        return `${valAux.toFixed(fixed > 0 ? fixed : 0)} M`;
    }
    if (valor >= 1000) {
        valAux = valor / 1000;
        let fixed = 3 - (Math.log(valAux) * Math.LOG10E + 1 | 0);
        return `${valAux.toFixed(fixed > 0 ? fixed : 0)} k`;
    }
    if (valor < 1) {
        valAux = valor * 1000;
        let fixed = 3 - (Math.log(valAux) * Math.LOG10E + 1 | 0);
        return `${valAux.toFixed(fixed > 0 ? fixed : 0)} m`;
    }
    else {
        let fixed = 3 - (Math.log(valor) * Math.LOG10E + 1 | 0);
        return `${valor.toFixed(fixed > 0 ? fixed : 0)}`;
    }
}

/**
 * Prueba el valor segun RegEx, validando valor y multiplicador. Devuelve el valor parseado.
 * @param   {string} valor Numero de resistencia o corriente a validar.
 * @return  {Object} Objeto con la validacion y el valor en MKS.
 */
function testAndParse(valor) {
    console.log("valor length", valor.length);
    if (valor.length > 0) {
        if (/^\d*\.?\d*\s*[kMm]?$/.test(valor)) {
            if (valor.endsWith('k')) {
                let valoraux = valor.substring(0, valor.length - 1);
                return {
                    pass: true,
                    value: parseFloat(valoraux) * 1000
                };
            }
            if (valor.endsWith('M')) {
                let valoraux = valor.substring(0, valor.length - 1);
                return {
                    pass: true,
                    value: parseFloat(valoraux) * 1000000
                };
            }
            if (valor.endsWith('m')) {
                let valoraux = valor.substring(0, valor.length - 1);
                return {
                    pass: true,
                    value: parseFloat(valoraux) / 1000
                };
            }
            else {
                return {
                    pass: true,
                    value: parseFloat(valor)
                };
            }
        }
    }
    alert("Valor ingresado es invalido:\nValores posibles:\n15\n13.4\n12k\n16.5M\n150m");
    return { pass: false };
}

/**
 * Guarda el objeto 'bandas' en el localStorage.
 * @param   {Object} bandas Objeto de los colores de bandas ingresados.
 * @return  {Object} Objeto con el ultimo dato ingresado.
 */
function saveHistory(bandas) {
    let data = {
        date: DateTime.now().toLocaleString(DateTime.DATETIME_MED_WITH_SECONDS),
        bandas: bandas,
        resultado: calculoResistencia(bandas),
        tolerance: colorToTolerance(bandas.tol)
    };

    // Agrego un elemento
    historyReg.unshift(data);

    // Elimino un elemento si paso el maximo
    historyReg.length > maxHistory && historyReg.pop();

    // Guardo el historial
    localStorage.setItem("historyEST", JSON.stringify(historyReg));

    return data;
}

/**
 * Borra Historial del local storage y llama a borrar la tabla HTML
 */
function clearHistory() {
    historyReg = [];
    localStorage.removeItem("historyEST");
    clearHTMLTable();
}

/**
 * Crea la tabla Historial del HTML.
 */
function createTableHtml() {
    let tablaHtml = `
    <tr>
    <th>Date</th>
    <th>Bandas</th>
    <th>Resultado [ohm]</th>
    </tr>`;

    historyReg.forEach((item) => {
        tablaHtml += `
        <tr>
        <td>${item.date}</td>
        <td>
        <p class="${item.bandas.b1}"> </p>
        <p class="${item.bandas.b2}"> </p>
        <p class="${item.bandas.mult}"> </p>
        <p class="${item.bandas.tol}"> </p>
        </td>
        <td>${fixToHumanreadable(item.resultado)} ± ${item.tolerance} %</td>
        </tr>`;
    });

    let table = document.getElementById('historial');
    table.innerHTML = tablaHtml;
    document.getElementById('clearBtn').className = "inlineBlock"
}

/**
 * Borra la tabla Historial del HTML.
 */
function clearHTMLTable() {
    // Cargo la tabla en el documento
    let table = document.getElementById('historial');
    table.innerHTML = "";
    document.getElementById('clearBtn').className = "none"
}

/**
 * Lee los target del formulario de las bandas de colores. Guarda en el historial, completa el campo en el HTML y completa los campos de los demas formularios.
 * @param   {Object} event Objeto de los colores de bandas ingresados.
 */
function readBandasInput(event) {
    event.preventDefault();

    let bandas = {
        b1: event.target[0].value,
        b2: event.target[1].value,
        mult: event.target[2].value,
        tol: event.target[3].value,
    };
    let result = saveHistory(bandas);
    document.getElementById('resultado_res').innerHTML = `<h3>Valor Nominal: ${fixToHumanreadable(result.resultado)} [Ohm] ± ${result.tolerance} %</h3>`;
    document.getElementById('serie_valor').value = fixToHumanreadable(result.resultado);
    document.getElementById('power_valor_res').value = fixToHumanreadable(result.resultado);
    createTableHtml();
}

/**
 * Lee los target del formulario de la Serie "E", Completa el HTML con los resultados.
 * @param   {Object} event Objeto de los colores de bandas ingresados.
 */
async function readSerieInput(event) {
    event.preventDefault();
    const valor = testAndParse(event.target[0].value);
    console.log("valor ingresaro", valor);
    if (valor.pass) {
        const serie = await getResistorSerie(event.target[1].value);
        const valores = searchReplacement(valor.value, serie.values);

        let realContainer = document.getElementById('serie_box_real');
        realContainer.innerHTML = `<h3>Valor real</h3><h4>${fixToHumanreadable(valor.value)}[Ohm]</h4>`;
        realContainer.className = "real";

        if (valores.inferior.error < valores.superior.error) {
            classInf = valores.inferior.error <= 0.1 ? "real" : "best";
            classSup = "worst";
        }
        else {
            classInf = "worst";
            classSup = valores.superior.error <= 0.1 ? "real" : "best";
        }

        let infContainer = document.getElementById('serie_box_inf');
        infContainer.innerHTML = `<h3>Valor inferior</h3><h4>${fixToHumanreadable(valores.inferior.valor)}[Ohm]</h4><h5>error ${valores.inferior.error.toFixed()}[%]</h5>`;
        infContainer.className = classInf;

        let supContainer = document.getElementById('serie_box_sup');
        supContainer.innerHTML = `<h3>Valor superior</h3><h4>${fixToHumanreadable(valores.superior.valor)}[Ohm]</h4><h5>error ${valores.superior.error.toFixed()}[%]</h5>`;
        supContainer.className = classSup;
    }
}

/**
 * Lee los target del formulario de Potencia, Completa el HTML con los resultados.
 * @param   {Object} event Objeto de los colores de bandas ingresados.
 */
function readPowerInput(event) {
    event.preventDefault();
    const valorRes = testAndParse(event.target[0].value);
    const valorCurr = testAndParse(event.target[1].value);

    if (valorRes.pass && valorCurr.pass) {
        const result = calculoPotencia(valorRes.value, valorCurr.value);
        document.getElementById('power_box').innerHTML = `<h3>Potencia: ${fixToHumanreadable(result)} [W]</h3>`;

        console.log(result);
    }
}

/**
 * Hace fetch del documento JSON, y busca en el resultado el objeto correspondiente a la serie.
 * @param   {String} serieName Nombre de la serie que se busca.
 * @return {Object} Objeto de la serie encontrada.
 */
const getResistorSerie = async (serieName) => {
    const res = await fetch('./serieE.json');
    const serieE = await res.json();
    return serieE.find(serie => serie.serieName === serieName);
};

// 
// Ejecuciones 
// 

// Imprimo la tabla que puede provenir del localStorage
historyReg.length > 0 ? createTableHtml() : clearHTMLTable();

// Agrego listener para el formulario de inputs
let resInput = document.getElementById('res_input_form');
resInput.addEventListener('submit', readBandasInput);

// Listener para selectores de formulario
let selectorInput = document.getElementById('1da_banda');
selectorInput.addEventListener('change', (event) => { event.srcElement.className = event.target.value; });

selectorInput = document.getElementById('2da_banda');
selectorInput.addEventListener('change', (event) => { event.srcElement.className = event.target.value; });

selectorInput = document.getElementById('multiplicador');
selectorInput.addEventListener('change', (event) => { event.srcElement.className = event.target.value; });

selectorInput = document.getElementById('tolerancia');
selectorInput.addEventListener('change', (event) => { event.srcElement.className = event.target.value; });

// Agrego listener para el boton de borrado
let clearBtn = document.getElementById('clearBtn');
clearBtn.addEventListener("click", clearHistory);

// Agrego listener para el formulario de Series
let serieInput = document.getElementById('serie_res_form');
serieInput.addEventListener('submit', readSerieInput);

// Agrego listener para el formulario de Potencia
let powerInput = document.getElementById('power_res_form');
powerInput.addEventListener('submit', readPowerInput);