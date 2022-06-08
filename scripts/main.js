
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

// Algunos casos de test
console.log(`El color rojo es ${colorToNumber('rojo')} y multiplica por ${colorToMultiplier('rojo')}`)
console.log(`El color verde es ${colorToNumber('verde')} y multiplica por ${colorToMultiplier('verde')}`)
console.log(`El color azul es ${colorToNumber('azul')} y multiplica por ${colorToMultiplier('azul')}`)
console.log(`El color Marron es ${colorToNumber('Marron')} y multiplica por ${colorToMultiplier('Marron')}`)

console.log(`Resistencia rojo rojo rojo es ${calculoResistencia('rojo','rojo','rojo')} ohms`)
console.log(`Resistencia azul verde amarillo es ${calculoResistencia('azul','verde','amarillo')} ohms`)
console.log(`Resistencia marron rojo rojo es ${calculoResistencia('marron','rojo','rojo')} ohms`)