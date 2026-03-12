import QRCode from 'qrcode';
QRCode.toFile('C:/Users/나원선/.gemini/antigravity/brain/cac73cde-8bda-4293-870b-c09177ffa33b/qr.png', 'http://192.168.219.105:5174', { width: 300 }, function (err) {
  if (err) throw err
  console.log('QR Code generated successfully!');
});
