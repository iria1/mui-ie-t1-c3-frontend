const input = document.getElementById('passwordInput');

async function login() {
    const password = input.value;
    const errorMessage = document.getElementById('errorMessage');

    try {
        const response = await fetch(`${endpointRoot}/v1/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ password })
        });

        if (!response.ok) {
            throw new Error('Login failed');
        }

        const data = await response.json();
        localStorage.setItem('jwt_token', data.token);
        errorMessage.classList.add('d-none');
        window.location.href = '/';
    } catch (err) {
        errorMessage.classList.remove('d-none');
        console.error(err);
    }
}

input.addEventListener('keypress', function (event) {
    if (event.key === 'Enter') {
        event.preventDefault(); // Stop default form submission if inside a form
        login();
    }
});