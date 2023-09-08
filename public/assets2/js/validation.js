//validations for  name  add and edit product
function validateField(input, fieldName) {
    var fieldValue = input.value.trim();
    var errorMessage = document.getElementById(fieldName + 'ErrorMessage');

    if (fieldValue === "") {
        errorMessage.textContent = fieldName.charAt(0).toUpperCase() + fieldName.slice(1) + " must not be empty.";
    } 
    else if(!/^[a-zA-Z\s]+$/.test(fieldValue)){
        
        errorMessage.textContent = "Name should contain only letters.";
    }
    else {
        errorMessage.textContent = "";
    }
}

function validateForm() {
    var productNameInput = document.querySelector('input[name="name"]');
    var priceInput = document.querySelector('input[name="price"]');
    var stockInput = document.querySelector('input[name="stock"]');
    
    // Validate Product Name
    if (productNameInput.value.trim() === "") {
        var nameErrorMessage = document.getElementById('nameErrorMessage');
        nameErrorMessage.textContent = "Product Name must not be empty.";
        return false;
    }
       // Validate Price
       if (parseFloat(priceInput.value) <= 0) {
        var priceErrorMessage = document.getElementById('priceErrorMessage');
        priceErrorMessage.textContent = "Price must be greater than 0.";
        return false;
    }
        // Validate Stock
        if (parseInt(stockInput.value) <= 0) {
        var stockErrorMessage = document.getElementById('stockErrorMessage');
        stockErrorMessage.textContent = "Stock must be greater than 0.";
        return false;
    }
    return true
}