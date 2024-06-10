////////////Fetch to pass the block and unblock data to backend///////////
document.addEventListener("DOMContentLoaded", function() {
    const blockActiveButtons = document.querySelectorAll(".block-btn");
    
    blockActiveButtons.forEach(function(button) {
        button.addEventListener('click', function(e) {
            const userId = e.currentTarget.getAttribute('data-id'); // Get the category ID
            console.log(userId)
            fetch('/admin/postblockUnblockUser', {
                method: 'post',
                body: JSON.stringify({ id: userId }), // Send the category ID in the request body
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                // Handle successful response (if needed)
                return response.json();
            })
            .then(data => {
                // Handle response data (if needed)
                console.log('Response from server:', data);
                window.location.href="/admin/getUserDetail"
            })
            .catch(error => {
                // Handle fetch errors
                console.error('Error fetching data:', error);
                console.error('Error:', error);
            });
        });
    });
});