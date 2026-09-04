

const jsonFile = document.getElementById("jsonFile");
const csvFile = document.getElementById("csvFile");

const jsonToCsvButton = document.getElementById("jsonButton");
const csvToJsonButton = document.getElementById("csvButton");

const csvOutput = document.getElementById("csvOutput");
const jsonOutput = document.getElementById("jsonOutput");

const downloadCsvButton = document.getElementById("downloadCsv");
const downloadJsonButton = document.getElementById("downloadJson");

const message = document.getElementById("message");   




jsonButton.addEventListener("click", function () {

    if (jsonFile.files.length === 0) {

        message.textContent = "Please select orders.json first.";

        return;             
    }

    const file = jsonFile.files[0]; 

    const reader = new FileReader();

    reader.onload = function (event) {

        try {

            const jsonText = event.target.result;

            const orders = JSON.parse(jsonText);

            if (!Array.isArray(orders)) {

                message.textContent =
                    "JSON file must contain an array of orders.";

                return;
            }

            const csv = ordersToCsv(orders);   

            csvOutput.value = csv;

            message.textContent =
                "JSON successfully converted to CSV.";

        } catch (error) {    

            message.textContent =
                "Invalid JSON file.";    

            console.log(error);
        }
    };

    reader.readAsText(file);
});




function ordersToCsv(orders) {

  


    const headers = [
        "orderId",
        "orderDate",

        "customerId",
        "customerName",
        "customerEmail",
        "customerCountry",

        "sku",
        "productName",
        "category",
        "unitPrice",
        "quantity",
        "lineTotal",

        "subtotal",
        "discountPercent",
        "discountAmount",
        "shipping",
        "total",

        "status",
        "paymentMethod"
    ];


    let csv = "";

    

    for (let i = 0; i < headers.length; i++) {    

        csv += escapeCsvValue(headers[i]);

        if (i < headers.length - 1) {
            csv += ",";   
        }
    }

    csv += "\n";


   

    for (let i = 0; i < orders.length; i++) {

        const order = orders[i];

        
        

        if (order.items && order.items.length > 0) {

            for (let j = 0; j < order.items.length; j++) {

                const item = order.items[j];

                const row = [

                    order.orderId,
                    order.orderDate,

                    order.customer.id,
                    order.customer.name,
                    order.customer.email,
                    order.customer.country,   

                    item.sku,
                    item.name,
                    item.category,
                    item.unitPrice,
                    item.quantity,
                    item.lineTotal,

                    order.subtotal,
                    order.discountPercent,
                    order.discountAmount,
                    order.shipping,
                    order.total,

                    order.status,
                    order.paymentMethod
                ];


                csv += createCsvRow(row);
            }

        } else {

          

            const row = [

                order.orderId,
                order.orderDate,

                order.customer.id,
                order.customer.name,
                order.customer.email,
                order.customer.country,

                "",
                "",
                "",
                "",
                "",
                "",

                order.subtotal,
                order.discountPercent,
                order.discountAmount,
                order.shipping,
                order.total,

                order.status,
                order.paymentMethod   
            ];

            csv += createCsvRow(row);
        }
    }

    return csv;
}
 



function createCsvRow(row) {   

    let line = "";

    for (let i = 0; i < row.length; i++) {

        line += escapeCsvValue(row[i]);

        if (i < row.length - 1) {
            line += ",";
        }
    }

    line += "\n";

    return line; 
}




function escapeCsvValue(value) {

    if (value === null || value === undefined) {
        return "";
    }

    const stringValue = String(value);

 

    if (
        stringValue.includes(",") ||      
        stringValue.includes('"') ||
        stringValue.includes("\n")
    ) {

        return '"' +
            stringValue.replace(/"/g, '""') +
            '"';
    }

    return stringValue;
}




csvButton.addEventListener("click", function () {

    if (csvFile.files.length === 0) {    

        message.textContent =
            "Please select a CSV file first.";

        return;
    }

    const file = csvFile.files[0];

    const reader = new FileReader(); 
    reader.onload = function (event) {

        try {

            const csvText = event.target.result;

            const orders = csvToOrders(csvText);

            jsonOutput.value =
                JSON.stringify(orders, null, 4);   

            message.textContent =
                "CSV successfully converted to JSON.";  

        } catch (error) {

            message.textContent =
                "Invalid CSV file.";

            console.log(error);
        }
    };

    reader.readAsText(file);   
});




function csvToOrders(csvText) {

    const lines = csvText
        .trim()
        .split(/\r?\n/)
        .filter(function (line) {

            return line.trim() !== "";
        });


    if (lines.length < 2) {

        return [];    
    }


   

    const headers = parseCsvLine(lines[0]);          


    const orders = [];    

    

    for (let i = 1; i < lines.length; i++) {

        const values = parseCsvLine(lines[i]);

        const row = {};

        

        for (let j = 0; j < headers.length; j++) {   

            row[headers[j]] = values[j] || "";
        }


       

        let existingOrder = null;

        for (let j = 0; j < orders.length; j++) {

            if (
                orders[j].orderId === row.orderId
            ) {

                existingOrder = orders[j];  

                break;
            }
        }


    

        if (existingOrder === null) {

            existingOrder = {

                orderId: row.orderId,

                orderDate: row.orderDate,

                customer: {

                    id: row.customerId,

                    name: row.customerName,

                    email: row.customerEmail,

                    country: row.customerCountry
                },

                items: [],

                subtotal: toNumber(row.subtotal),

                discountPercent: toNumber(row.discountPercent),

                discountAmount: toNumber(row.discountAmount),

                shipping: toNumber(row.shipping),

                total: toNumber(row.total),

                status: row.status,

                paymentMethod: row.paymentMethod
            };


            orders.push(existingOrder);
        }


        

        if (
            row.sku !== "" ||
            row.productName !== ""
        ) {

            const item = {

                sku: row.sku,

                name: row.productName,    

                category: row.category,

                unitPrice: toNumber(row.unitPrice),

                quantity: toNumber(row.quantity),    

                lineTotal: toNumber(row.lineTotal)  
            };


            existingOrder.items.push(item);  
        }
    }


    return orders;
}




function parseCsvLine(line) {

    const values = [];

    let currentValue = "";

    let insideQuotes = false;


    for (let i = 0; i < line.length; i++) {   

        const character = line[i];


     

        if (character === '"') {       

         

            if (
                insideQuotes &&
                line[i + 1] === '"'
            ) {

                currentValue += '"';  

                i++;

            } else {      

                insideQuotes = !insideQuotes; 
            }


        } else if (
            character === "," &&
            insideQuotes === false
        ) {

            values.push(currentValue);

            currentValue = "";

        } else {

            currentValue += character; 
        }
    }


  

    values.push(currentValue);      


    return values;
}




function toNumber(value) {     

    if (value === "") {        

        return "";
    }

    const numberValue = Number(value);


    if (!isNaN(numberValue)) {

        return numberValue;
    }


    return value;
}




downloadCsv.addEventListener("click", function () {

    const content = csvOutput.value;   


    if (content === "") {

        message.textContent =
            "Please convert JSON to CSV first.";  

        return;            
    }


    const file = new Blob(
        [content],
        {
            type: "text/csv"
        }
    );


    const url = URL.createObjectURL(file);    


    const link = document.createElement("a");

    link.href = url;

    link.download = "orders.csv";

    link.click();


    URL.revokeObjectURL(url);


    message.textContent =
        "CSV file downloaded.";        
});




downloadJson.addEventListener("click", function () {

    const content = jsonOutput.value; 


    if (content === "") {

        message.textContent =
            "Please convert CSV to JSON first.";

        return;
    }


    const file = new Blob(
        [content],
        {
            type: "application/json"
        }
    );


    const url = URL.createObjectURL(file);       


    const link = document.createElement("a");

    link.href = url;

    link.download = "orders.json"; 

    link.click();


    URL.revokeObjectURL(url);


    message.textContent =
        "JSON file downloaded.";
});