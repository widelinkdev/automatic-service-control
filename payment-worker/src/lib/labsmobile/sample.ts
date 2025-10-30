import { LabsMobile } from "./index.js";

const username = 'victor@wide.link';
const token = 'NcrB9qMGDLEDDIPy9PqCLLibfsx6KFko';

// LabsMobile Client
const client = await new LabsMobile(username, token);

// Get Credits
const credits = await client.getCredits();
// console.log("CREDITOS::::", credits);

// Get Prices
const prices = await client.getPrice();
// console.log(prices);

// Send SMS
// const response = await client.sendSMS('WideLink le informa que su servicio de Internet ha sido activado exitosamente', ['573015883764']);
const response = await client.sendSMS('¡Hola! Su servicio de Internet ya se encuentra activo. Gracias por seguir conectado con WideLink.', ['573015883764']);
console.log(response);

// Send OTP
// const otp = await client.sendOTP('573015883764', 'Codigo WIDE: %CODE%, valido por 5 minutos.');
// console.log(otp);

// Validate OTP
// const otp_valid = await client.validateOTP('573015883764', '123456');
// console.log(otp_valid);
