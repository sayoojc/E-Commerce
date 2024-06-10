
    //add product button dom manipulations//
   //  document.addEventListener("DOMContentLoaded", function () {
   //       var addProductButton = document.getElementById("add");
   //       var addProductModal = document.querySelector(".addProduct");
   
   //       // Event listener for opening the add product modal
   //       addProductButton.addEventListener("click", function () {
   //         document.querySelector("#Product").value = ""; // Clear the text field
   //         addProductModal.classList.add("active");
   //       });
   
   //      /// Event listner for closing the product modal//////    
   //       document.querySelectorAll(" .addProduct .close-btn").forEach(function (closeBtn) {
   //         closeBtn.addEventListener("click", function () {
   //           this.closest(".popup, .addProduct").classList.remove("active");
   //         });
   //       });
   //     });
   // ///////////////////////////function with fetch to add product////////////////////////////
   // document.getElementById("addProductForm").addEventListener('submit', function(event) {
   //     event.preventDefault();
   
   //     const formData = new FormData();
   
   //     const addProductName = document.querySelector('input[name="addProductName"]').value;
   //     formData.append('addProductName', addProductName);
   //     const categoryName = document.querySelector('input[name="categoryName"]').value;
   //     formData.append('categoryName', categoryName);
   //     const actualPrice = document.querySelector('input[name="actualPrice"]').value;
   //     formData.append('actualPrice', actualPrice);
   //     const sellingPrice = document.querySelector('input[name="sellingPrice"]').value;
   //     formData.append('sellingPrice', sellingPrice);
   //     const stock = document.querySelector('input[name="stock"]').value;
   //     formData.append('stock', stock);
   //     const description = document.querySelector('input[name="description"]').value;
   //     formData.append('description', description);
   //     const addedDate = document.querySelector('input[name="addedDate"]').value;
   //     formData.append('addedDate', addedDate);
   
   //     const productImage = document.querySelector('input[name="productImage"]').files[0];
   //     formData.append('productImage', productImage);
   
   //     fetch('/admin/postProducts', {
   //         method: 'post',
   //         body: formData
   //     })
   //     .then(response => {
   //       console.log('first then hits');
   //       if (!response.ok) {
   //             throw new Error('server error response not ok');
   //         }
   //         // Redirect to the category page after successful form submission
   //         return response.json();
   //     })
   //     .then(data => {
   //       console.log('second then hits');
   //       if(data.errorMessage) {
   //         const errorMessageElement = document.getElementById('categoryImageError');
   //         errorMessageElement.textContent = data.errorMessage;
   //       }else {
   //         window.location.href = "/admin/getProducts"
   //       }
   //     })
   //     .catch(error => {
   //         console.error(error);
           
   //     });
   // });
   // ////////////////////////Function to show selected images in the preview//////////////////////
   // const imageInput = document.getElementById('productImage');
   // const previewImage = document.getElementById('previewImage');
   
   // imageInput.addEventListener('change', function(event) {
   //   const file = event.target.files[0]; // Get the selected file
   
   //   const reader = new FileReader();
   
   //   reader.onload = function(event) {
   //     // This event is triggered when the file has been successfully read
   //     const imageUrl = event.target.result;
   //     previewImage.src = imageUrl; // Set the preview image source
   //   };
   
   //   reader.onerror = function(event) {
   //     // This event is triggered if an error occurs while reading the file
   //     console.error('Error reading file:', event.target.error);
   //   };
   
   //   // Read the selected file as a data URL
   //   reader.readAsDataURL(file);
   // });
   
   
   ////////////// javaScript for the active and block button//////////////////
   
   document.addEventListener("DOMContentLoaded", function() {
       const blockActiveButtons = document.querySelectorAll(".block-btn");
       
       blockActiveButtons.forEach(function(button) {
           button.addEventListener('click', function(e) {
               const productId = e.currentTarget.getAttribute('data-id'); // Get the category ID
               console.log(productId);
               fetch('/admin/postblockUnblockProduct', {
                   method: 'post',
                   body: JSON.stringify({ id: productId }), // Send the category ID in the request body
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
                   window.location.href="/admin/getProducts"
               })
               .catch(error => {
                   // Handle fetch errors
                   console.error('Error fetching data:', error);
                   console.error('Error:', error);
               });
           });
       });
   });