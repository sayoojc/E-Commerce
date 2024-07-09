document.addEventListener('scroll', function () {
    const scrollableElement = document.getElementById('yourCartDiv');
    const placeOrderButtonDiv = document.getElementById('placeOrderButtonDiv');
    var scrollPosition = window.scrollY || window.pageYOffset;
    var triggerPosition = 870; // The scroll position at which to toggle

    if (scrollPosition > triggerPosition) {
      scrollableElement.style.position = 'absolute';
      scrollableElement.style.top = triggerPosition + 'px'; // Set top position to the trigger point
    } else if (scrollPosition <= triggerPosition) {
      scrollableElement.style.position = 'fixed';
      scrollableElement.style.top = '40px'; // Reset top position to initial fixed value
    }
  });


  //////////////////////////post addresss//////////////////////////
  document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('addAddressForm');
    const modal = document.getElementById('staticBackdrop');

    // Clear error messages and reset form when modal is hidden
    modal.addEventListener('hidden.bs.modal', () => {
      document.getElementById('nameError').innerHTML = '';
      document.getElementById('addressError1').innerHTML = '';
      document.getElementById('addressError2').innerHTML = '';
      document.getElementById('phoneError').innerHTML = '';
      document.getElementById('localityError').innerHTML = '';
      document.getElementById('pinCodeError').innerHTML = '';
      document.getElementById('stateError').innerHTML = '';
      document.getElementById('cityError').innerHTML = '';
      form.reset();
    });

    form.addEventListener('submit', async (event) => {
      event.preventDefault();

      const name = document.getElementById('name').value.trim();
      const address1 = document.getElementById('address1').value.trim();
      const address2 = document.getElementById('address2').value.trim();
      const phone = document.getElementById('phone').value.trim();
      const locality = document.getElementById('locality').value.trim();
      const pincode = document.getElementById('pincode').value.trim();
      const state = document.getElementById('state').value.trim();
      const city = document.getElementById('city').value.trim();

      const nameError = document.getElementById('nameError');
      const addressError1 = document.getElementById('addressError1');
      const addressError2 = document.getElementById('addressError2');
      const phoneError = document.getElementById('phoneError');
      const localityError = document.getElementById('localityError');
      const pinCodeError = document.getElementById('pinCodeError');
      const stateError = document.getElementById('stateError');
      const cityError = document.getElementById('cityError');

      const phonePattern = /^[0-9]{10}$/;
      const pincodePattern = /^[0-9]{6}$/;

      let isValid = true;

      // Clear previous errors
      nameError.innerHTML = '';
      addressError1.innerHTML = '';
      addressError2.innerHTML = '';
      phoneError.innerHTML = '';
      localityError.innerHTML = '';
      pinCodeError.innerHTML = '';
      stateError.innerHTML = '';
      cityError.innerHTML = '';

      // Validate fields
      if (!name) {
        nameError.innerHTML = 'Please add a name to continue.';
        isValid = false;
      }
      if (!address1) {
        addressError1.innerHTML = 'Please fill the Address1 field to continue.';
        isValid = false;
      }
      if (!address2) {
        addressError2.innerHTML = 'Please fill the Address2 field to continue.';
        isValid = false;
      }
      if (!phone || !phonePattern.test(phone)) {
        phoneError.innerHTML = 'Please add a valid phone number to continue.';
        isValid = false;
      }
      if (!locality) {
        localityError.innerHTML = 'Please add a locality to continue.';
        isValid = false;
      }
      if (!pincode || !pincodePattern.test(pincode)) {
        pinCodeError.innerHTML = 'Please add a valid pincode to continue.';
        isValid = false;
      }
      if (!city) {
        cityError.innerHTML = 'Please add a city to continue.';
        isValid = false;
      }
      if (!state) {
        stateError.innerHTML = 'Please add a state to continue.';
        isValid = false;
      }

      if (isValid) {
        const formData = {
          name,
          address1,
          address2,
          phone,
          locality,
          pincode,
          state,
          city
        };

        try {
          const response = await fetch('/postAddress', {
            method: 'POST',
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify(formData),
          });

          if (!response.ok) {
            throw new Error('Server error');
          }

          const data = await response.json();

          if (data.errorMessage) {
            document.getElementById('backendError').textContent = data.errorMessage;
          } else {
            showToast('Success', 'Address added successfully.');
            window.location.reload();
          }
        } catch (error) {
          console.error('Error:', error);
        }
      }
    });

    // Function to show toast
    function showToast(title, message) {
      const toastContainer = document.getElementById('toast-container');
      const toastTemplate = document.getElementById('toast-template');

      const newToast = toastTemplate.cloneNode(true);
      newToast.id = ''; // Reset ID to avoid duplicates
      newToast.querySelector('.toast-title').textContent = title;
      newToast.querySelector('.toast-body').textContent = message;
      newToast.classList.add('bg-success'); // Add success class

      toastContainer.appendChild(newToast);
      new bootstrap.Toast(newToast).show(); // Initialize and show the toast

      // Remove the toast from DOM after it hides
      newToast.addEventListener('hidden.bs.toast', () => {
        newToast.remove();
      });
    }
  });


  //////////////////////////////////////////////////////////////////////////

  document.addEventListener('DOMContentLoaded', function () {
    const selectButtons = document.querySelectorAll('.select-address-btn');

    selectButtons.forEach(button => {
      button.addEventListener('click', function () {
        const addressId = this.getAttribute('data-id');
        document.getElementById('selectedAddressId').value = addressId;

        // Send the selected address ID via an AJAX request
        submitAddressSelection(addressId);
      });
    });
  });

  function submitAddressSelection(addressId) {
    fetch('/changeAddress', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ selectedAddressId: addressId })
    })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          // Handle success, perhaps close the modal and update the UI
          console.log('Address selected successfully');
          // Close the modal
          document.querySelector('.btn-close').click();

          window.location.href = '/getCart';
        } else {
          document.getElementById('backend-error').textContent = data.error || 'An error occurred.';
        }

      })
      .catch(error => {
        console.error('Error:', error);
        document.getElementById('backend-error').textContent = 'An error occurred.';
      });
  }


  ///////////////fetch to remove product from cart//////////////////

  document.addEventListener('DOMContentLoaded', function () {
    const productRemoveButton = document.querySelectorAll('#productRemoveButton');

    productRemoveButton.forEach(button => {
      const productId = button.getAttribute('data-productId');
      button.addEventListener('click', function () {
        Swal.fire({
          title: 'Are you sure?',
          text: "Do you really want to remove this product from the cart?",
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          confirmButtonText: 'Yes, remove it!'
        }).then((result) => {
          if (result.isConfirmed) {
            fetch(`/removeFromCart/${productId}`, {
              method: 'DELETE',
            })
              .then(response => response.json())
              .then(data => {
                if (data.message) {
                  // Handle success, perhaps close the modal and update the UI
                  Swal.fire({
                    title: 'Removed!',
                    text: 'The product has been removed from your cart.',
                    icon: 'success'
                  }).then(() => {
                    window.location.href = '/getCart';
                  });
                } else {
                  Swal.fire({
                    title: 'Error',
                    text: data.error || 'An error occurred when deleting the product from the cart.',
                    icon: 'error'
                  });
                }
              })
              .catch(error => {
                console.error('Error:', error);
                Swal.fire({
                  title: 'Error',
                  text: 'An error occurred.',
                  icon: 'error'
                });
              });
          }
        });
      });
    });
  });

  ///////////////////fetch to  add to wish list////////////////////////////


  const addToWishlistButton = document.querySelectorAll('#addToWishlistButton');

    addToWishlistButton.forEach(button => {
      const productId = button.getAttribute('data-productId');
      button.addEventListener('click', function () {
        Swal.fire({
          title: 'Are you sure?',
          text: 'Do you want to add this product to your wishlist?',
          icon: 'question',
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          confirmButtonText: 'Yes, add it!'
        }).then((result) => {
          if (result.isConfirmed) {
            fetch(`/addToWishlist/${productId}`, {
              method: 'POST'
            })
              .then(response => response.json())
              .then(data => {
                if (data.message) {
                  // Handle success, perhaps close the modal and update the UI
                  console.log('product added');

                  Swal.fire({
                    title: 'Added!',
                    text: 'The product has been added to your wishlist.',
                    icon: 'success'
                  }).then(() => {
                    window.location.href = '/getCart';
                  });

                } else {
                  Swal.fire({
                    title: 'Error',
                    text: data.error || 'An error occurred when adding the product to the wishlist.',
                    icon: 'error'
                  });
                }
              })
              .catch(error => {
                console.error('Error:', error);
                Swal.fire({
                  title: 'Error',
                  text: 'An error occurred.',
                  icon: 'error'
                });
              });
          }
        });
      });
    });


  ///////////////////////remove from wish list//////////////////////


  document.addEventListener('DOMContentLoaded', function () {
    const productRemoveFromWishlistButton = document.querySelectorAll('.remove-from-wishlist');

    productRemoveFromWishlistButton.forEach(button => {
      const productId = button.getAttribute('data-productId');
      button.addEventListener('click', function () {
        Swal.fire({
          title: 'Are you sure?',
          text: 'Do you really want to remove this product from your wishlist?',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          confirmButtonText: 'Yes, remove it!'
        }).then((result) => {
          if (result.isConfirmed) {
            fetch('/removeFromWishlist', {
              method: 'DELETE',
              body: JSON.stringify({ productId }),
              headers: {
                'Content-Type': 'application/json'
              }
            })
              .then(response => response.json())
              .then(data => {
                if (data.message) {
                  // Handle success, perhaps close the modal and update the UI
                  Swal.fire({
                    title: 'Removed!',
                    text: 'The product has been removed from your wishlist.',
                    icon: 'success'
                  }).then(() => {
                    window.location.reload();
                  });
                } else {
                  Swal.fire({
                    title: 'Error',
                    text: data.error || 'An error occurred when removing the product from the wishlist.',
                    icon: 'error'
                  });
                }
              })
              .catch(error => {
                console.error('Error:', error);
                Swal.fire({
                  title: 'Error',
                  text: 'An error occurred.',
                  icon: 'error'
                });
              });
          }
        });
      });
    });
  });




