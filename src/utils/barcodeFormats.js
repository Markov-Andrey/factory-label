// src/utils/barcodeFormats.js

export default {
    'Code 128':      { format: 'CODE128',   example: 'ABC123' },
    'Code 128 A':    { format: 'CODE128A',  example: 'ABCDEF' },       // Только заглавные и управляющие
    'Code 128 B':    { format: 'CODE128B',  example: 'Abc123' },       // Строчные, заглавные, цифры
    'Code 128 C':    { format: 'CODE128C',  example: '12345678' },     // Только чётное количество цифр
    'Code 39':       { format: 'CODE39',    example: 'CODE39' },
    'Code 93':       { format: 'CODE93',    example: 'ABC-123' },
    'EAN-13':        { format: 'EAN13',     example: '5901234123457' }, // Только 13 цифр
    'EAN-8':         { format: 'EAN8',      example: '96385074' },
    'EAN-5':         { format: 'EAN5',      example: '12345' },
    'EAN-2':         { format: 'EAN2',      example: '12' },
    'UPC':         { format: 'UPC',      example: '123456789012' },
    'ITF':           { format: 'ITF',       example: '123456' },         // Только чётное число цифр
    'ITF-14':        { format: 'ITF14',     example: '10012345000017' }, // 14 цифр
    'MSI':           { format: 'MSI',       example: '1234567' },
    'MSI-10':        { format: 'MSI10',     example: '1234567' },
    'MSI-11':        { format: 'MSI11',     example: '1234567' },
    'MSI-1010':      { format: 'MSI1010',   example: '1234567' },
    'MSI-1110':      { format: 'MSI1110',   example: '1234567' },
    'Pharmacode':    { format: 'pharmacode', example: '12345' },         // Только числа от 3 до 131070
    'Codabar':       { format: 'codabar',   example: 'A123456A' },       // Начинается и заканчивается с A/B/C/D
};