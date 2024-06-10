
///////////////////////js to show the image selected from the computers files for the add Category modal/////////////////////////


const imageInput = document.getElementById('fileInput');
const previewImageContainer = document.getElementById('previewImage');
let cropper;
let currentPreviewElement;
let croppedImages = {}; // Object to store cropped image data URLs

imageInput.addEventListener('change', function(event) {
const files = event.target.files; // Get the selected files
previewImageContainer.innerHTML = ''; // Clear any previous images

Array.from(files).forEach((file, index) => {
  const reader = new FileReader();

  reader.onload = function(event) {
      const imageUrl = event.target.result;
      const imgElement = document.createElement('img');
      imgElement.src = imageUrl;
      imgElement.style.maxWidth = '100px';
      imgElement.style.margin = '5px';
      previewImageContainer.appendChild(imgElement);

      const cropBtn = document.createElement('button');
      cropBtn.innerText = 'Crop';
      cropBtn.classList.add('crop-btn');
      previewImageContainer.appendChild(cropBtn);

      cropBtn.addEventListener('click', function() {
          currentPreviewElement = imgElement;
          const cropImage = document.getElementById('cropImage');
          cropImage.src = imageUrl;
          document.getElementById('cropModal').style.display = 'flex';

          cropper = new Cropper(cropImage, {
              aspectRatio: 1,
              viewMode: 3,
              autoCropArea: 1,
          });
      });
  };

  reader.onerror = function(event) {
      console.error('Error reading file:', event.target.error);
  };

  reader.readAsDataURL(file);
});
});

document.getElementById('cropButton').addEventListener('click', function() {
if (cropper) {
  const canvas = cropper.getCroppedCanvas();
  const croppedImageDataURL = canvas.toDataURL(); // Convert canvas data to a Data URL
  croppedImages[currentPreviewElement.src] = croppedImageDataURL; // Store cropped image data URL
  currentPreviewElement.src = croppedImageDataURL;
  cropper.destroy();
  cropper = null;
  document.getElementById('cropModal').style.display = 'none';
}
});

document.getElementById('closeModal').addEventListener('click', function() {
if (cropper) {
  cropper.destroy();
  cropper = null;
}
document.getElementById('cropModal').style.display = 'none';
});

document.getElementById('productForm').addEventListener('submit', function(event) {
Object.keys(croppedImages).forEach((originalSrc, index) => {
  const hiddenInput = document.createElement('input');
  hiddenInput.type = 'hidden';
  hiddenInput.name = `croppedImage${index + 1}`;
  hiddenInput.value = croppedImages[originalSrc];
  document.getElementById('productForm').appendChild(hiddenInput);
});
});


//////////////add product validation///////////////
document.addEventListener('DOMContentLoaded', function () {
const form = document.getElementById('productForm');

form.addEventListener('submit', function (event) {
  event.preventDefault();

  // Reset validation feedback
  const invalidFeedbackElements = form.querySelectorAll('.invalid-feedback');
  invalidFeedbackElements.forEach(el => el.style.display = 'none');

  let isValid = true;

  // Validate Product Name
  const productName = form.name.value.trim();
  if (!productName) {
      showError(form.name, 'Product Name is required');
      isValid = false;
  }
  if(productName!==productName.trim()){
    showError(form.name, 'No spaces are not allowed before and after the category name');
      isValid = false;
  }

  // Validate Description
  const description = form.description.value.trim();
  if (!description) {
      showError(form.description, 'Description is required');
      isValid = false;
  }

  // Validate Category
  const category = form.category.value.trim();
  if (!category) {
      showError(form.category, 'Category is required');
      isValid = false;
  }

  // Validate Price
  const price = form.price.value.trim();
  if (!price || isNaN(price)) {
      showError(form.price, 'Price is required and must be a number');
      isValid = false;
  }
  if(price<=0){
    showError(form.price, 'Price must be a positive number');
      isValid = false;
  }

  // Validate Stock
  const stock = form.stock.value.trim();
  if (!stock || isNaN(stock)) {
      showError(form.stock, 'Units In Stock is required and must be a number');
      isValid = false;
  }
  if(price<=0){
    showError(form.price, 'Stock must be a positive number');
      isValid = false;
  }

  // Validate Product Images
  const fileInput = form['productImage[]'];
  if (fileInput.files.length === 0) {
      showError(fileInput, 'At least one product image is required');
      isValid = false;
  }

  if (isValid) {
      form.submit();
  }
});

function showError(inputElement, message) {
  let errorElement;
  if (inputElement.type === 'file') {
      errorElement = inputElement.closest('.custom-file').querySelector('.invalid-feedback');
  } else {
      errorElement = inputElement.closest('.form-group').querySelector('.invalid-feedback');
  }
  errorElement.textContent = message;
  errorElement.style.display = 'block';
  inputElement.classList.add('is-invalid');
}
});

