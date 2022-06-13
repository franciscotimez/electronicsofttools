const maxHistory = 10
let historyReg = []

// Funcion Calculadora
// recibe String con colores.
function calculoResistencia(banda1, banda2, banda3) {
    let digito1 = colorToNumber(banda1)
    let digito2 = colorToNumber(banda2)
    let multiplier = colorToMultiplier(banda3)

    let resultado = ((digito1 * 10) + digito2) * multiplier
    return resultado
}

// Funcion auxiliar
// Tranforma colores a numeros
function colorToNumber(color) {
    const colors = [ 'negro', 'marron', 'rojo', 'naranja', 'amarillo', 'verde', 'azul', 'violeta', 'gris', 'blanco' ]
    return colors.indexOf(color.toLowerCase())
}

// Tranforma colores a multiplicadores
function colorToMultiplier(color) {
    let multiplier = 1
    for (let index = 0; index < colorToNumber(color); index++) {
        multiplier *= 10
    }
    return multiplier
}

// Guardo los ultimos 10 valores calculados
function saveHistory(banda1, banda2, banda3) {
    let data = {
        date: new Date(),
        bandas: [banda1, banda2, banda3],
        resultado: calculoResistencia(banda1, banda2, banda3)
    }

    historyReg.push(data)

    if(historyReg.length > maxHistory) {
        historyReg.shift()
    }

    return data
}

// Algunos casos de test
console.log(`El color rojo es ${colorToNumber('rojo')} y multiplica por ${colorToMultiplier('rojo')}`)
console.log(`El color verde es ${colorToNumber('verde')} y multiplica por ${colorToMultiplier('verde')}`)
console.log(`El color azul es ${colorToNumber('azul')} y multiplica por ${colorToMultiplier('azul')}`)
console.log(`El color Marron es ${colorToNumber('Marron')} y multiplica por ${colorToMultiplier('Marron')}`)

console.log(`Resistencia rojo rojo rojo es ${saveHistory('rojo','rojo','rojo').resultado} ohms`)
console.log(`Resistencia azul verde amarillo es ${saveHistory('azul','verde','amarillo').resultado} ohms`)
console.log(`Resistencia marron rojo rojo es ${saveHistory('marron','rojo','rojo').resultado} ohms`)
console.log(`Resistencia rojo rojo rojo es ${saveHistory('rojo','rojo','rojo').resultado} ohms`)
console.log(`Resistencia azul verde amarillo es ${saveHistory('azul','verde','amarillo').resultado} ohms`)
console.log(`Resistencia marron rojo rojo es ${saveHistory('marron','rojo','rojo').resultado} ohms`)
console.log(`Resistencia rojo rojo rojo es ${saveHistory('rojo','rojo','rojo').resultado} ohms`)
console.log(`Resistencia azul verde amarillo es ${saveHistory('azul','verde','amarillo').resultado} ohms`)
console.log(`Resistencia marron rojo rojo es ${saveHistory('marron','rojo','rojo').resultado} ohms`)
console.log(`Resistencia rojo rojo rojo es ${saveHistory('rojo','rojo','rojo').resultado} ohms`)
console.log(`Resistencia azul verde amarillo es ${saveHistory('azul','verde','amarillo').resultado} ohms`)
console.log(`Resistencia marron rojo naranja es ${saveHistory('marron','rojo','naranja').resultado} ohms`)

console.log("Registro historico:")
console.log(historyReg)