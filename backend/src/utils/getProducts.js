import XLSX from "xlsx";
import path from "path";

export function getProducts() {
    const filePath = path.join(process.cwd(), "assets", "electronic_products.csv");
    console.log("filePath", filePath)
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet);
    return data;
}
