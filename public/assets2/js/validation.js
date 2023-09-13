// //validations for  name  add and edit product
// function validateField(input, fieldName) {
//     var fieldValue = input.value.trim();
//     var errorMessage = document.getElementById(fieldName + 'ErrorMessage');

//     if (fieldValue === "") {
//         errorMessage.textContent = fieldName.charAt(0).toUpperCase() + fieldName.slice(1) + " must not be empty.";
//     } 

//     else {
//         errorMessage.textContent = "";
//     }
// }

// function validateForm() {
//     var productNameInput = document.querySelector('input[name="name"]');
//     var priceInput = document.querySelector('input[name="price"]');
//     var stockInput = document.querySelector('input[name="stock"]');
    
//     // Validate Product Name
//     if (productNameInput.value.trim() === "") {
//         var nameErrorMessage = document.getElementById('nameErrorMessage');
//         nameErrorMessage.textContent = "Product Name must not be empty.";
//         return false;
//     }
//        // Validate Price
//        if (parseFloat(priceInput.value) <= 0) {
//         var priceErrorMessage = document.getElementById('priceErrorMessage');
//         priceErrorMessage.textContent = "Price must be greater than 0.";
//         return false;
//     }
//         // Validate Stock
//         if (parseInt(stockInput.value) <= 0) {
//         var stockErrorMessage = document.getElementById('stockErrorMessage');
//         stockErrorMessage.textContent = "Stock must be greater than 0.";
//         return false;
//     }
//     return true
// }


// Validations for name, price, and stock fields for adding/editing products
function validateField(input, fieldName) {
    var fieldValue = input.value.trim();
    var errorMessage = document.getElementById(fieldName + 'ErrorMessage');

    if (fieldValue === "") {
        errorMessage.textContent = fieldName.charAt(0).toUpperCase() + fieldName.slice(1) + " must not be empty.";
    } else {
        errorMessage.textContent = "";
    }
}

function validateForm() {
    var productNameInput = document.querySelector('input[name="name"]');
    var priceInput = document.querySelector('input[name="price"]');
    var stockInput = document.querySelector('input[name="stock"]');
    
    // Validate Product Name
    var productName = productNameInput.value.trim();
    if (productName === "") {
        var nameErrorMessage = document.getElementById('nameErrorMessage');
        nameErrorMessage.textContent = "Product Name must not be empty.";
        return false;
    } else if (!/^[A-Za-z\s]+$/.test(productName)) {
        var nameErrorMessage = document.getElementById('nameErrorMessage');
        nameErrorMessage.textContent = "Product Name should only contain letters and spaces.";
        return false;
    }

    // Validate Price
    var price = parseFloat(priceInput.value);
    if (isNaN(price) || price <= 0) {
        var priceErrorMessage = document.getElementById('priceErrorMessage');
        priceErrorMessage.textContent = "Price must be a valid number greater than 0.";
        return false;
    }

    // Validate Stock
    var stock = parseInt(stockInput.value);
    if (isNaN(stock) || stock <= 0) {
        var stockErrorMessage = document.getElementById('stockErrorMessage');
        stockErrorMessage.textContent = "Stock must be a valid number greater than 0.";
        return false;
    }

    return true;
}
