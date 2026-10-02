const ExcelJS = require('exceljs');

async function test() {
  const workbook = new ExcelJS.Workbook();
  const ws = workbook.addWorksheet("Products");
  
  // Columns
  ws.columns = [
    { header: "Product Name", key: "name", width: 45 },
    { header: "Description", key: "desc", width: 60 },
    { header: "Category", key: "cat", width: 22 },
    { header: "Subcategory", key: "subcat", width: 28 }
  ];

  const catCol = ws.getColumn('Z');
  const subCatCol = ws.getColumn('AA');
  catCol.hidden = true;
  subCatCol.hidden = true;

  const categories = ["Sarees", "Dupattas"];
  const subCategories = ["Tussar Silk", "Mangalagiri Cotton"];

  categories.forEach((cat, index) => { ws.getCell(`Z${index + 1}`).value = cat; });
  subCategories.forEach((subcat, index) => { ws.getCell(`AA${index + 1}`).value = subcat; });

  const catFormula = `$Z$1:$Z$${categories.length}`;
  const subCatFormula = `$AA$1:$AA$${subCategories.length}`;

  for (let i = 2; i <= 10; i++) {
    ws.getCell(`C${i}`).dataValidation = {
      type: 'list', allowBlank: true, formulae: [catFormula],
      showErrorMessage: true, errorTitle: 'Invalid Category', error: 'Please select a category'
    };
    ws.getCell(`D${i}`).dataValidation = {
      type: 'list', allowBlank: true, formulae: [subCatFormula],
      showErrorMessage: true, errorTitle: 'Invalid Subcategory', error: 'Please select a subcategory'
    };
  }

  await workbook.xlsx.writeFile('test-google-sheets-hack.xlsx');
  console.log("File generated successfully.");
}

test();
