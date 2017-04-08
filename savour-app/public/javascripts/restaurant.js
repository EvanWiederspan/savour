﻿

//Extend the Date Function
(function () {
    var days = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

    var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    Date.prototype.getMonthName = function () {
        return months[this.getMonth()];
    };
    Date.prototype.getDayName = function () {
        return days[this.getDay()];
    };
    Date.prototype.getDayNum = function () {
        return this.getDay();
    };
})();
//get Date variales
var now = new Date();
var day = now.getDayName();
var month = now.getMonthName();
var dayValue = now.getDayNum();
var filterArray = [];

//Document Ready Function
$(function () {
    var holdURL = window.location.href;
    // Assign handlers immediately after making the request,
    // and remember the jqxhr object for this request
    var urlID = getUrlParameter('id');
    //set up the bottom center toast
    toastr.options = {
        "closeButton": true,
        "debug": false,
        "newestOnTop": false,
        "progressBar": false,
        "positionClass": "toast-bottom-center",
        "preventDuplicates": false,
        "onclick": null,
        "showDuration": "300",
        "hideDuration": "500",
        "timeOut": "2000",
        "extendedTimeOut": "1000",
        "showEasing": "swing",
        "hideEasing": "linear",
        "showMethod": "fadeIn",
        "hideMethod": "fadeOut"
    }
   
    if (urlID) {

        getRestaurantData(urlID);
        getReviewData(urlID);
        getFilterData(urlID);

    }
    else {
        //Pop Up a status message
        //redirect to home page if no ID was passed
        
        window.location.href = "/";
    }
    // Perform other work here ...
    //Testing Review Rating for Submition
    

    //options example
    var stuff = {
        max_value: 5,
        step_size: 1,
    }
    $("#review-rating").rate(stuff);
    //Test Example of Rating Stars using standard rate
    var settings = {
        max_value: 5,
        initial_value: 2,
        readonly: true,
        step_size: 0.5,
    }
    $("#restStars").rate(settings);
    //Create Div Here from Review Write One Button Slide Down and Slide Up
    $("#create-review-button").click(function () {
        if ($("#review-form").is(":hidden")) {
            $("#review-form").slideDown("slow");
        }
        else {
            $("#review-form").slideUp("slow");
        }
    });
    //Submit Form for a Creation of a review
    $("#submit-button").click(function () {
        submitform(urlID);
        return false;
    });

    //toggle Hours table
    $("#times").click(function () {
        if ($(".table-responsive").css('display') == 'none') {
            document.getElementById("times").style.display = "none";
        }
        $(".table-responsive").toggle();
    });

    $(".table-responsive").click(function() {
        if (document.getElementById("times").style.display == "none") {
            document.getElementById("times").style.display = "block";
            $(".table-responsive").toggle();
        }
    });
 });
    
//Submit Form
function submitform(urlID) {
    var rest = new reviewClass();
    console.log(rest);

    var json = $.parseJSON(JSON.stringify(rest));
    $.ajax({
        url: "./restaurant",
        type: "POST",
        data: json,
        error: function (jqXHR, textStatus, errorThrown) {
            console.log(jqXHR.status);
            console.log("Could not post data");
            window.alert("Could not add Review");
        }
    }).done(function () {
        //stay on the current page, let user know it worked, and slide up form
        //console.log(holdURL);
        //window.location = holdURL;
        $("#review-form").slideUp("slow");
        $("#comment").val("");

        getReviewData(urlID); //reload review data
    });
}

//Review class Assocation with ID from Restaurant
function reviewClass() {
    this.comment = $("#comment").val();
    this.rating = $("#review-rating").rate("getValue");
    this.id = getUrlParameter('id');
    this.name = $("#restName").text();

}

//function called getURLparameters
function getUrlParameter(sParam) {
    var sPageURL = decodeURIComponent(window.location.search.substring(1)),
        sURLVariables = sPageURL.split('&'),
        sParameterName,
        i;

    for (i = 0; i < sURLVariables.length; i++) {
        sParameterName = sURLVariables[i].split('=');

        if (sParameterName[0] === sParam) {
            return sParameterName[1] === undefined ? true : sParameterName[1];
        }
    }
};
//Create Cells for Reviews
function CreateRow(data) {
    if (data.id == null)
        data.id = "";

    var row = "<tr><td><a href=./restaurant?id=" + data.id + "><div class='col-md-10'>";
    row += data.name + "</div ></td><td><div class='col-md-2'></a><div class='rating'></div></div></td></tr>";
    row += "<tr><td colspan = '2'><div class='col-md-12'>";
    row += data.review + "</div ></td> </tr";
    //adjust the rate of it when created nvm wont work
    
    return row;
}

//create table body for hours
function createItem(data) {
    //console.log(data);
    var item = "<tr><td> " + data[0] + "</td><td>" + " " + data[1] + "</td></tr>";


   return item;
}

//Get the Restaurant Data through a JSON Call
function getRestaurantData(urlID) {
    $.getJSON("restaurant-data", { id: urlID })
        .done(function (parsedResponse) {
            
            var res;
            //Recievd Response Text as JSON hopefully
            if (typeof parsedResponse === 'string')
                res = parsedResponse;
            else {
                res = JSON.parse(JSON.stringify(parsedResponse)); //may be pointless operaton as its already a json object response
            }
           

            //Restaurant Image
            $('#restImage').attr('src', res.image);
            //Restaurant Name
            $("#restName").text(res.name);
            //Restuaran Rating Stars

            
            $("#restStars").rate("setValue",res.rating);
            //<a href="#serious">serious</A>
            $("#rest-link").append("<a href="+res.website+">Website</a>");
            $("#menu-link").append("<a href="+res.menu+">Menu</a>");

            var result = [];
            //convert JSON hours into array
            for (var i in res.hours)
                result.push([i, res.hours[i]]);

            console.log(result);
            $("#times").text(result[dayValue][0] + " " + result[dayValue][1]);
            $("#expanded-times").append("<tr><td style='font-weight: bold;'>" + result[dayValue][0] + "<td style='font-weight: bold;'>"
                + result[dayValue][1] + "</td></td></tr>");
            //look through all of the keys in hours
            var count = 0;
            Object.keys(res.hours).forEach(function (k) {
                if (k === day) {
                    count++;
                }
                else {
                    var item = createItem(result[count]);
                    //console.log(item);
                    $("#expanded-times").append(item);
                    count++;
                }
            });




            //Bio for restaurants
            $("#bio").text(res.desc);
            $("#address").text(res.address);
            $("#phone").text(res.phone);

        })
        .fail(function () {
            console.log("error");
        })
        .always(function () {
            console.log("complete");
        });

}
//Get the Review Data through a JSON Call
function getReviewData(urlID) {

    //Test using 58c64e8b90ffbe4bcc94080e
    $.getJSON("review-data", { id: urlID })
        .done(function (parsedResponse) {
          
            var ratings = 0;
            var sum = 0;
            var avg = 0;
            var res;
            //Recievd Response Text as JSON hopefully
            if (typeof parsedResponse === 'string')
                res = parsedResponse;
            else {
                res = JSON.parse(JSON.stringify(parsedResponse)); //may be pointless operaton as its already a json object response
            }
            
            //reload json stuff here
            var len = res.length;
            var tbl = $("#review-list");
            $("#review-list tr").remove();
            
            //Create Table of Review List
            for (var data of res) {
                ratings++;
                var row = CreateRow(data);
                tbl.append(row);
                sum += data.rating;
                $(".rating").rate({ step_size: 1, readonly: true, initial_value: data.rating, change_once: true }); //needed for each appended rating
            }

            if (len == 0) {
                if ($("#review-none").css("display") == "none") {
                    document.getElementById("review-none").style.display = "block";
                }
            }
            else {
                document.getElementById("review-none").style.display = "none";
            }

            if (ratings != 0)
                avg = sum / ratings;

            $("#restStars").rate("setValue", avg);
            

        })
        .fail(function () {
            console.log("error");
        })
        .always(function () {
            console.log("complete");
        });
}

//Get the Filter Data through a JSON Call
function getFilterData(urlID) {    
    $.getJSON("filters-get", { id: urlID })
        .done(function (data) {
            console.log(data);

            var temp;
            //For each filter, retrieve the name
            for (var i = 0; i < data.length; i++)
            {
                $.getJSON("filter-name-get", { filterID : data[i] })
                    .always(function (name) {
                        console.log(name.responseText);
                        filterArray.push(name.responseText);
                        $("#filters").append(name.responseText + " ");
                    });
            }
           
        });

}