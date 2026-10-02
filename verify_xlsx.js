const fs = require('fs');
const JSZip = require('jszip');

async function verify() {
  const data = fs.readFileSync('test-google-sheets-hack.xlsx');
  const zip = await JSZip.loadAsync(data);
  const sheetXML = await zip.file('xl/worksheets/sheet1.xml').async('text');
  
  if (sheetXML.includes('<dataValidations')) {
    const match = sheetXML.match(/<dataValidations[\s\S]*?<\/dataValidations>/);
    console.log("SUCCESS! Found Data Validation Rules in the Excel file:\n");
    console.log(match[0]);
  } else {
    console.log("No data validations found.");
  }
}
verify();
