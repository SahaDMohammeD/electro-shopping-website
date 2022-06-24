$(document).ready(function () {
  $("#productValidation").validate({
    rules: {
      name: {
        required: true,
      },

      price: {
        required: true,
      },

      description: {
        required: true,
        minlength: 8,
      },

      stock: {
        required: true,
      },

      discount: {
        required: true,
      },

      subCategory: {
        required: true,
      },

      images: {
        required: true,
      },
    },
  });
});
