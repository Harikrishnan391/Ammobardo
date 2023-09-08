//====================================================
// custome.js for validation
//====================================================
function validateForm() {
    var email = document.getElementById('emailInput').value;
    var password = document.getElementById('passwordInput').value;

    // Clear previous error messages
    document.getElementById('emailError').innerHTML = '';
    document.getElementById('passwordError').innerHTML = '';
  

    // Check if email is empty
    if (email.trim().length === 0) {
        document.getElementById('emailError').innerHTML = 'Email field must not be empty.';
        return false;
    }

    // Check if password is empty
    if (password.trim().length === 0) {
        document.getElementById('passwordError').innerHTML = 'Password field must not be empty.';
        return false;
    }

    // Check if password has at least 8 characters
    if (password.length < 8) {
        document.getElementById('passwordError').innerHTML = 'Password must have at least 8 characters.';
        return false;
    }

    // Return true to submit the form if all validations pass
    return true;
}

// Email input real-time validation
let emailInput = document.getElementById('emailInput');
let emailError = document.getElementById('emailError');

emailInput.addEventListener('keyup', function () {
    var email = emailInput.value;

    emailError.innerHTML = '';

  
     if (/^[0-9]/.test(email)) {
        emailError.innerHTML = 'Email must not start with a number.';
    } 
    else if (!/^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(email)) {
        emailError.innerHTML = 'Invalid email address(eg:example@gmail.com)';
    } 
    // Check if email contains special characters
    if (/[^a-zA-Z0-9.@]/.test(email)) {
        emailError.innerHTML = 'Email contains invalid characters.';
    }


});

//===============================================
//for eye icon
//===============================================
let eyeicon=document.getElementById("eyeicon")
let passwordInput=document.getElementById("passwordInput")

eyeicon.onclick=function(){

    if(passwordInput.type=='password'){
        passwordInput.type="text";
        eyeicon.src="../assets2/imgs/icons/eye-open.png"
    }
    
    else{

        passwordInput.type="password"
        eyeicon.src="../assets2/imgs/icons/eye-close.png"
    }
}


