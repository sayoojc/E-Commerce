
  
//////////////////////resizeImage////////////////
// const widthInput = document.querySelector('[name = "width"]');
// const heightInput = document.querySelector('[name = "height"]');
// const widthValue = document.getElementById("width-value");
// const heightValue = document.getElementById("height-value");
// const resizedImage = document.getElementById("previewImage");

// function resizeImage(){
// widthValue.textContent = widthInput.value;
// heightValue.textContent = heightInput.value;
// if(resizeImage.src){
//   URL.revokeObjectURL(resizeImage.src)
// }
// const formData = new FormData();
// formData.append("width",widthInput.value)
// formData.append("height",heightInput.value);
// formData.append("image",document.querySelector('[name="image"]').files[0]);
// }

   

    /////Edit modal//////


    // Function to open the modal
    document.addEventListener("DOMContentLoaded", function() {
  const editButtons = document.querySelectorAll(".edit-btn");
  const editModal = document.querySelector(".editButton");
  const closeModalButton = document.querySelector(".editButton .close-btn");
  let modalBackground = document.getElementById('modalBackground');
  

  // Open edit modal when edit button is clicked
  editButtons.forEach(function(button) {
    button.addEventListener("click", function() {
      const categoryId = button.getAttribute("data-id");
      const categoryName = button.getAttribute("data-name");
      const imagePath = button.getAttribute("data-image");
     
  
      // Populate the input field with the category name if needed
      // For example: document.getElementById("Category").value = categoryName;
      document.getElementById("category_name").value=categoryName;
      document.getElementById("category_id").value=categoryId;

     ////////////To show the existing preview image in the  div of edit category modal form//////////
 const editImage = document.getElementById("edit_image");
      editImage.src = imagePath;
      editModal.classList.add("active");
      modalBackground.style.display = 'block';
     
    });
  });

  // Close edit modal when close button is clicked
  closeModalButton.addEventListener("click", function() {
    const previewDiv = document.getElementById("image-container");
    editModal.classList.remove("active");
    previewDiv.classList.remove('hidden');
    const errorMessageElement = document.getElementById('editCategoryError');
      errorMessageElement.innerHTML = '';
      modalBackground.style.display = 'none';
  });

});
////////////////////////////////////////////////////////////////////////////



/////////////////////////////function to replace the image in the edit category////////////////////
//////////////////////////// form preview div incase of selecting new image////////////////////////
// Check for DOMContentLoaded event
document.addEventListener("DOMContentLoaded", function() {
    // Get the file input element
    const editImageInput = document.getElementById('editImage');
    // Get the existing image element
    const editImage = document.getElementById("edit_image");

    // Add change event listener to the file input element
    editImageInput.addEventListener('change', function(event) {
        const file = event.target.files[0]; // Get the selected file

        const reader = new FileReader();
        const previewDiv = document.getElementById("image-container");
        reader.onload = function(event) {
            // Set the preview image source
            editImage.src = event.target.result;
            previewDiv.classList.remove('hidden');
        };

        reader.onerror = function(event) {
            // Log an error if reading the file fails
            console.error('Error reading file:', event.target.error);
        };

        // Read the selected file as a data URL
        reader.readAsDataURL(file);
    });

    // Get the close button for the image preview
    const previewCloseButton = document.getElementById("imagePreviewClose");
    // Add click event listener to the close button
    previewCloseButton.addEventListener('click', function() {
        // Hide the image preview div
        const previewDiv = document.getElementById("image-container");
        previewDiv.classList.add('hidden');
    });
});


   //////////////function to close the image preview div in the form of edit category//////////////
document.addEventListener("DOMContentLoaded", function() {
    const previewCloseButton = document.getElementById("imagePreviewClose");
    previewCloseButton.addEventListener('click', function() {
        const previewDiv = document.getElementById("image-container");
        previewDiv.classList.add('hidden');
    });
}); 
//// javaScript for the active and block button///

document.addEventListener("DOMContentLoaded", function() {
    const blockActiveButtons = document.querySelectorAll(".block-btn");
    
    blockActiveButtons.forEach(function(button) {
        button.addEventListener('click', function(e) {
            const categoryId = e.currentTarget.getAttribute('data-id'); // Get the category ID
            console.log(categoryId)
            fetch('/admin/postblockUnblock', {
                method: 'post',
                body: JSON.stringify({ id: categoryId }), // Send the category ID in the request body
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
                window.location.href="/admin/getCategory"
            })
            .catch(error => {
                // Handle fetch errors
                console.error('Error fetching data:', error);
                console.error('Error:', error);
            });
        });
    });
});


    //add category button dom manipulations//
    document.addEventListener("DOMContentLoaded", function () {
      var addCategoryButton = document.getElementById("add");
      var addCategoryModal = document.querySelector(".addCategory");
      let modalBackground = document.getElementById('modalBackground');

      // Event listener for opening the add category modal
      addCategoryButton.addEventListener("click", function () {
        document.querySelector("#Category").value = ""; // Clear the text field
        addCategoryModal.classList.add("active");
        modalBackground.style.display = 'block';
        document.querySelector("#categoryImage").value = "";
      });

     /// Event listner for closing the category modal//////    
      document.querySelectorAll(" .addCategory .close-btn").forEach(function (closeBtn) {
        closeBtn.addEventListener("click", function () {
          this.closest(".popup, .addCategory").classList.remove("active");
          document.querySelector("#categoryImage").value = "";
          categoryNameError = document.getElementById('categoryNameError');
          categoryImageError = document.getElementById('categoryImageError');
          categoryImageError.innerHTML = '' ;
          categoryNameError.innerHTML = '';
          modalBackground.style.display = 'none';
          resizedImage.style.display = "none";
        });
      });
      //////closing the add category modal when the background modal is clicked/////
      modalBackground.addEventListener('click',function(){
        const editModal = document.querySelector(".editButton");
        addCategoryModal.classList.remove("active");
        modalBackground.style.display = 'none';
        editModal.classList.remove("active");
        resizedImage.style.display = "none";
      });
    });

//////////////////resize image////////////

const resizedImage = document.getElementById("previewImage");
const originalImageInput = document.getElementById('categoryImage');
let resizedImageBlob = null;


const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

originalImageInput.addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (file) {
        if (file.size > MAX_FILE_SIZE_BYTES) {
            document.getElementById('categoryImageError').innerText = `File size should not exceed ${MAX_FILE_SIZE_MB} MB`;
            return;
        }
        if (!['image/png', 'image/jpg', 'image/jpeg', 'image/webp'].includes(file.type)) {
            document.getElementById('categoryImageError').innerText = 'Invalid file type. Only PNG, JPG, JPEG, and WEBP are allowed.';
            return;
        }
        handleImageSelection(event);
    }
});


resizedImage.style.display = "none";

originalImageInput.addEventListener('change', handleImageSelection);

function handleImageSelection(event) {
    const file = event.target.files[0];
    if (file) {
        resizeImageForPreview(file);
        document.getElementById('categoryImageError').innerText = '';
    }else{
        console.log('error selecting the image ');
    }
}

function resizeImageForPreview(file) {
    const formData = new FormData();
    formData.append("image", file);

    fetch("/admin/previewResizeAddCategory", {
        method: 'POST',
        body: formData
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.blob();
    })
    .then(blob => {
        resizedImageBlob = blob;
        const objectUrl = URL.createObjectURL(blob);
        resizedImage.style.display = "block";
        resizedImage.src = objectUrl;
    })
    .catch(error => {
        console.error('Error resizing image for preview:', error);
    });
}
/////////add category form submission//////////////
document.getElementById("addCategoryForm").addEventListener('submit', function(event) {
    event.preventDefault();

    const formData = new FormData();
    const addCategoryName = document.querySelector('input[name="addCategoryName"]').value;
    formData.append('addCategoryName', addCategoryName);

    
        const categoryImage = originalImageInput.files[0];
        if (categoryImage) {
            formData.append('categoryImage', categoryImage);
        } else {
            document.getElementById('categoryImageError').innerText = 'Please select an image to continue';
            return;
        }
    

    fetch('/admin/postCategory', {
        method: 'POST',
        body: formData
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Server error');
        }
        return response.json();
    })
    .then(data => {
        if (data.errorMessage) {
            document.getElementById('backendError').textContent = data.errorMessage;
        } else {
            window.location.href = "/admin/getCategory";
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
});



/////fetch to send edit category data to backend/////

document.getElementById("editCategoryForm").addEventListener('submit',function(event) {
  event.preventDefault();

  const formData = new FormData();

  const editCategoryName = document.querySelector('input[name = "CategoryName" ]').value;
  formData.append('editCategoryName',editCategoryName);
  const editCategoryImage = document.querySelector('input[name="editCategoryImage"]').files[0];
  formData.append('editCategoryImage',editCategoryImage);
  const categoryId = document.querySelector('input[name = "category_id"]').value;
  formData.append('categoryId',categoryId);

  fetch('/admin//postEditCategory',{
    method: 'post',
    body:formData
  })
  .then(response => {
    console.log('the first then in the edit category fetch')
    console.log(`The response from the edit category control is :${response}`);
    if(!response.ok) {
      throw new Error('server error');
    }
    return response.json();
  })
  .then(data => {
    console.log('The second then in the edit category fetch')
    console.log('the data in the second then ',data);
    if(data.errorMessage) {
      const errorMessageElement = document.getElementById('editCategoryError');
      errorMessageElement.innerHTML = data.errorMessage;
    } else {
      window.location.href = "/admin/getCategory"
    }
  })
  .catch(error => {
    console.log('the  catch in the fetch of the edit category')
    console.error(error);
  });
});


///////////////////////js to show the image selected from the computers files for the add Category modal/////////////////////////

// const imageInput = document.getElementById('categoryImage');
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


  