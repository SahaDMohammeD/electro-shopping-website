$(document).ready(function(){
    $("#validationform").validate({
           rules:{
               Name:{
                   required:true,
                   minlength:4
               },

               Email:{
                required:true,
                email:true
               },

               Password:{
                required:true,
                minlength: 6
               },

               confirm_password: {
                required: true,
                minlength: 6,
                equalTo: "#password"
            }
            
           },
     
    })
})