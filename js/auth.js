(async function verifyAuth() {
    const token = localStorage.getItem('jwt_token');

    if (!token) {
        window.location.href = '/login.html';
        return;
    }

    try {
        const response = await fetch(`${endpointRoot}/v1/auth/verify`, {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + token
            }
        });

        if (!response.ok) {
            // Invalid or expired token
            localStorage.removeItem('jwt_token');
            window.location.href = '/login.html';
        }

        // Token is valid; do nothing and allow the page to load

    } catch (error) {
        console.error('Authentication check failed:', error);
        window.location.href = '/login.html';
    }
})();
