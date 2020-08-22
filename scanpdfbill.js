// var files = '\n' +
//     '\n' +
//     '.\n' +
//     'EON INTERNATIONAL\n' +
//     'CORPORATE OFFICE:43,Modern Market, Tulsi Circle, Bikaner: 334001.\n' +
//     'Phone no.: 917023731111 Email: dmcbkn@gmail.com\n' +
//     'GST INVOICE\n' +
//     'Original for Recipient\n' +
//     'O\n' +
//     'Duplicate for Transporter\n' +
//     'O\n' +
//     'Triplicate for Supplier\n' +
//     'O\n' +
//     'Bill To:\n' +
//     'A K Traders\n' +
//     'SIRSAGANJ\n' +
//     'Ship To\n' +
//     'SIRSAGANJ\n' +
//     'Transportation Details\n' +
//     'Transport Name: Agra Log\n' +
//     'agrah tr co. GR No. 549\n' +
//     'GR NO.: RJ05GB1075\n' +
//     'TRUCK NO.: sirsaganj\n' +
//     'DELIVERY AT.: GST No.\n' +
//     'transporter:\n' +
//     '08FZLPS0792A1Z3\n' +
//     'Field 6:\n' +
//     'Invoice No.: 334\n' +
//     'Date: 22-08-2020\n' +
//     'E-way Bill number:\n' +
//     '781141539702\n' +
//     'Item nameQuantityUnitPrice/ unitGSTAmount\n' +
//     '1\n' +
//     'NATURAL\n' +
//     'CALCINED\n' +
//     'GYPSUM\n' +
//     'PLASTER\n' +
//     'Commercial\n' +
//     '2520201045000Kg₹ 1.40\n' +
//     '₹ 3,150.00\n' +
//     '(5.0%)\n' +
//     '₹ 66,150.00\n' +
//     '  \n' +
//     'Total45000₹ 3,150.00₹ 66,150.00\n' +
//     'Tax typeTaxable amountRateTax amount\n' +
//     'IGST₹ 63,000.005.0%₹ 3,150.00\n' +
//     'Invoice Amount In Words:\n' +
//     'Sixty Six Thousand One Hundred and Fifty Rupees only\n' +
//     'Payment Type:\n' +
//     'Cash\n' +
//     'Terms and conditions:\n' +
//     '1.All Subject to Bikaner Jurisdiction.\n' +
//     '2.The Truck has been arranged by the Purchaser so only\n' +
//     'Purchaser will be responsible for Freight, GST on freight, etc.\n' +
//     '3.We will not be responsible for any liabilities with respect to\n' +
//     'Freight, GST on freight, etc.\n' +
//     'Bank details:\n' +
//     'Bank Name: idbi\n' +
//     'Bank Account No.: 010510400018124\n' +
//     'Bank IFSC code: IDBI0000105\n' +
//     'Amounts:\n' +
//     'Sub Total₹ 66,150.00\n' +
//     'Total₹ 66,150.00\n' +
//     'For, EON INTERNATIONAL\n' +
//     'Authorized Signatory\n' +
//    'www.vyaparapp.in'

function amount(string) {
    return Number(string.match(/^Total₹\s([\d\.,]*)$/m)?.map(_ => _)[1])
}
function rate(string) {
    return Number(string.match(/Kg₹ ([\d\.]*)/m)?.map(_ => _)[1])
}
function tax(string) { //IGST₹ 51,800.005.0%₹ 2,590.00\n
    var result = string.match(/IGST₹ ([\d,]*\.\d\d)([\d\.]*)%₹ ([\d,]*\.\d\d)/m)?.slice(1, 4)
    if (result) {
        return {
            'Taxable amount': Number(result[0].split('').filter(c => !/^,$/.test(c)).join('')),
            'Rate': Number(result[1]),
            'Tax amount': Number(result[2].split('').filter(c => !/^,$/.test(c)).join('')),
        }
    }
}
function quantity(string) {
    return Number(string.match(/(\d{5,5})Kg₹/m)?.map(_ => _)[1])
}
function eWayBill(string) {
    return string.match(/E-way Bill number:\n(\d{12,12})\nItem name/m)?.map(_ => _)[1]
}
function vehicle(string) {///Transport Name: ([^~]*)\nVehicle/
    return string.match(/^Vehicle Number:\s([^~]*)\nDelivery location/m)?.map(_ => _)[1]
}
function date(string) {
    return string.match(/Date:\s(.*)$/m)?.map(_ => _)[1]
}
function billto(string) {
    return string.match(/Bill To:\n(.*)\n(.*)$/m)?.map(_ => _)[1]
}
function dillocation(string) {
    return string.match(/^Delivery location: (.*)$/m)?.map(_ => _)[1]
}
function invoice(string) {
    return string.match(/Invoice No\.: (.*)/m)?.map(_ => _)[1]
}
function itemname(string) {
    return string.match(/Item nameQuantityUnitPrice\/ unitGSTAmount\n([^~]*)\d{5,5}Kg/)?.map(_ => _)[1]
}
function transporter(string) {
    return string.match(/Transport Name: ([^~]*)\nVehicle/)?.map(_ => _)[1]
}
function amountInWords(string) {
    return string.match(/Invoice Amount In Words:\n(.*)\n/m)?.map(_ => _)[1]
}
var funcs = [amountInWords, transporter, itemname, invoice, dillocation, billto, date, vehicle, eWayBill, quantity, tax, rate, quantity]
var pdf = require('pdf-parse')
async function parse(buffer) {
    var { text } = await pdf(buffer)
    return Object.fromEntries(funcs.map(fn => [fn.name, fn(text)]))
}
module.exports = { parse }