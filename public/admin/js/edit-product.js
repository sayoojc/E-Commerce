
$(function() {
  $("#expire_date").datepicker({
    defaultDate: "10/22/2020"
  });
});
 // JavaScript function to validate the form
 function validateForm() {
      const name = document.getElementById('name').value.trim();
      const description = document.querySelector('textarea[name="description"]').value.trim();
      const category = document.getElementById('category').value;
      const price = document.getElementById('price').value;
      const stock = document.getElementById('stock').value;

      if(price<=0){
        alert('Please enter a positive number.');
          return false; 
      }
      if(stock<=0){
        alert('Please enter a positive number.');
          return false; 
      }

      if (!name || !description || !category || price < 0 || stock < 0) {
          alert('Please fill out all fields correctly.');
          return false;
      }

      return true;
  }

  // Function to preview the uploaded image
  function previewImage(event) {
      const reader = new FileReader();
      reader.onload = function() {
          const output = document.getElementById('productImage');
          output.src = reader.result;
      }
      reader.readAsDataURL(event.target.files[0]);
  }
