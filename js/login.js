const input = document.getElementById('passwordInput');
const btnLogin = document.getElementById('btnLogin');

async function login() {
    // change button with spinner
    btnLogin.innerHTML = '<span class="spinner-border spinner-border-sm"></span>';
    btnLogin.disabled = true;

    const password = input.value;

    // empty error message
    const errorMessage = document.getElementById('errorMessage');
    errorMessage.innerHTML = '';

    $.ajax({
        url: `${endpointRoot}/v1/auth/login`,
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({ password: password }),
        success: function (response) {
            localStorage.setItem('jwt_token', response.token);
            window.location.href = '/';
        },
        error: function (jqXHR, textStatus, errorThrown) {
            // revert button to original
            btnLogin.innerHTML = 'Login';
            btnLogin.disabled = false;

            if (jqXHR.status == 401) {
                errorMessage.innerHTML = 'Incorrect password';
            } else {
                errorMessage.innerHTML = 'Unexpected error';
            }
            
            console.error('Error:', errorThrown);
        }
    });
}

input.addEventListener('keypress', function (event) {
    if (event.key === 'Enter' && !btnLogin.disabled) {
        event.preventDefault(); // Stop default form submission if inside a form
        login();
    }
});