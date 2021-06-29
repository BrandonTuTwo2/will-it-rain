//creates a header that displays the date and if it will rain
function createInfo(text) {
    $("#infoDisplay").append("<h3 class=\"info\">" + text + "</h3>")
}

//creates the sub header that displays what time it will rain and till when
function createSubInfo(text) {
    $("#infoDisplay").append("<h3 class=\"subInfo\">" + text + "</h3>")
}

//removes the headers and sub headers
function removeInfo() {
    $("#infoDisplay h3").remove();

}

//reminder to check for leap years
//calculate the new date based on the days apart from the current date
function calcDate(day, month, year, daysApart) {
    var newDate = "";
    var newDay = day;
    var newMonth = month;
    var newYear = year;
    const monthLimit = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    console.log("day is " + day + " month is " + month + "year is " + year + "daysapart is " + daysApart);
    newDay = day + daysApart
    if (newDay >= monthLimit[month - 1]) {
        newMonth += 1;

        newDay = -((monthLimit[month - 1] - day) - daysApart) + 1;
        if (newMonth > 12) {
            newMonth = 1;
            newYear += 1;
        }
    }

    newDate = newDay.toString() + "/" + newMonth.toString() + "/" + newYear.toString();
    return newDate;
}

jQuery(document).ready(function() {
    var popUp = document.getElementById("popUp");
    var close = document.getElementsByClassName("close")[0];

    /*basically once the user enters an address we use the nominatim api to convert the addess into latitude and longitude
    which we then plug into the 7Timer api which returns a 7 day forcast of the weather counted by numbers divisble by 3*/
    document.getElementById("addressBTN").onclick = function(e) {
        var today = new Date();
        let isRain = false;
        let newDate = "";
        let analogTime = 0;
        let amOrPm = "";
        let stillRaining = false;
        let currentForcastDay = 0;
        let startOfForcastDay = 0;
        let dayCheck = 0;
        let dayInHours = 0;
        let address = "";
        let lon = "";
        let lat = "";
        let length = 0;
        let forcast = [];

        //clears the previous info and grabs the data from the input line
        removeInfo();
        console.log("search button clicked!");
        address = document.getElementById("addressInput").value;
        console.log(address);

        //ajax call to conver the addess to latitude and longitude
        jQuery.ajax({
            type: 'get',
            dataType: 'json',
            url: '/getAddressData',
            data: {
                address: address
            },
            success: function(data) {
                console.log(data);

                lon = data[0].lon;
                lat = data[0].lat;
                length = data["length"]
                console.log("lon is " + lon);
                console.log("lat is " + lat);
            },
            fail: function(error) {
                console.log(error);
            },
            async: false
        });

        //if the retuned JSON object has the length of 0 then it probably isn't a valid address so it alerts the user
        if (length == 0) {
            console.log("invalid location");
            popUp.style.display = "block";
        } else {
            //second ajax call that gets the forcast given the latitude and longitude
            jQuery.ajax({
                type: 'get',
                dataType: 'json',
                url: '/getForcast',
                data: {
                    lat: lat,
                    lon: lon
                },
                success: function(data) {
                    console.log(data);
                    forcast = data["dataseries"];
                },
                fail: function(error) {
                    console.log(error);
                },
                async: false
            });
        }

        for (var i = 0; i < forcast.length; i++) {
            var ind = forcast[i]
            dayInHours = parseFloat(ind.timepoint);

            if (dayInHours % 24 == 0) {
                startOfForcastDay = Math.floor(dayInHours / 24);
                dayCheck = 0;
            }

            //converts the timepoint into normal time
            analogTime = ind.timepoint % 24;
            amOrPm = "am";
            if (analogTime > 12) {
                analogTime -= 12;
                amOrPm = "pm"
            } else if (analogTime == 0) {
                analogTime = 12;
            }

            //finds the date of the day
            newDate = calcDate(today.getDate(), today.getMonth(), today.getFullYear(), currentForcastDay);

            //if its a rainy day then it will dispaly the appropriate
            if (ind.prec_type == "rain" && currentForcastDay != 7) {
                isRain = true;
                currentForcastDay = Math.floor(dayInHours / 24);
                if (currentForcastDay == startOfForcastDay && dayCheck == 0) {
                    if (currentForcastDay == 0) {
                        createInfo("it will rain today (" + newDate + " )");
                    } else {
                        console.log(newDate);
                        createInfo("it will rain " + currentForcastDay + " days from now (" + newDate + ")");
                    }
                    dayCheck = 1;
                }
            }

            //if it continues to the next day then it will display as such and it will display if it stop raining on a differnt day
            if (i != 0 && i != 64) {
                if (ind.timepoint % 24 == 21 && ind.prec_type == "rain") {
                    createSubInfo("rain will continue to the day after");
                    stillRaining = true;
                }
                if ((forcast[i - 1].prec_type != "rain" && ind.prec_type == "rain") || (ind.timepoint % 24 == 0 && ind.prec_type == "rain") && !stillRaining) {
                    createSubInfo("it will start raining around: " + analogTime + amOrPm);
                } else if ((forcast[i - 1].prec_type == "rain" && ind.prec_type == "none")) {
                    createSubInfo("it will stop raining around: " + analogTime + amOrPm);
                    stillRaining = false;
                }
            }

            //if there is no rain for the entire day then it will display as such
            if (ind.prec_type != "rain" && !isRain) {
                createInfo("there is no rain " + currentForcastDay + " days from now (" + newDate + ")");
            }
        }
        isRain = false;
    }

    //makes it so that it will close the modal/popup if they click somewhere else
    window.onclick = function(event) {
        if (event.target == popUp) {
            popUp.style.display = "none";
        }
    }

    //closes the modal/popUp
    close.onclick = function(e) {
        popUp.style.display = "none";
    }
});
