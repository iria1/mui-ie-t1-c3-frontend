(async function verifyAuth() {
    const token = localStorage.getItem('jwt_token');

    if (!token) {
        return;
    }

    try {
        const response = await fetch(`${window.location.origin}/api/v1/auth/verify`, {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + token
            }
        });

        if (!response.ok) {
            // Invalid or expired token
            localStorage.removeItem('jwt_token');
        }

        // Token is valid; redirect to index
        window.location.href = '/';
    } catch (error) {
        console.error('Authentication check failed:', error);
    }
})();