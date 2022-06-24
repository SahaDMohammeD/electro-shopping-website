$(document).ready(function () {
    $("#checkout-validation").validate({
        rules: {
            Name: {
                required: true,
                minlength: 4
            },

            Email: {
                required: true,
                email: true
            },

            Address: {
                required: true,
                minlength: 10
            },

            City: {
                required: true,
                minlength: 6,
            },

            State: {
                required: true,
                minlength: 6,
            },

            Country: {
                required: true,
                minlength: 6,
            },

            Pincode: {
                required: true,
                minlength: 6,
                maxlength: 6,
            },

            Number: {
                required: true,
                minlength: 10,
                maxlength: 12,
            }

        },

    })
})