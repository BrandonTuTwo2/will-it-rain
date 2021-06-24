function createInfo(text) {
  $("#infoDisplay").append("<h3 class=\"info\">" + text +"</h3>")
}

function createSubInfo(text) {
  $("#infoDisplay").append("<h3 class=\"subInfo\">" + text +"</h3>")
}

jQuery(document).ready(function() {

  document.getElementById("addressBTN").onclick = function(e) {
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
    console.log("search button clicked!");
    address = document.getElementById("addressInput").value;
    console.log(address);

    jQuery.ajax({
      type: 'get',
      dataType: 'json',
      url: '/getAddressData',
      data: {
        address:address
      },
      success: function (data) {
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
      async:false
    });

    if(length == 0) {
      alert("sorry no such place could be found");
    } else {
      jQuery.ajax({
        type: 'get',
        dataType: 'json',
        url: '/getForcast',
        data: {
          lat:lat,
          lon:lon
        },
        success: function (data) {
          console.log(data);
          forcast = data["dataseries"];
        },
        fail: function(error) {
          console.log(error);
        },
        async:false
      });
    }
    for(var i = 0; i < forcast.length;i++) {
      var ind = forcast[i]
      dayInHours = parseFloat(ind.timepoint);
      if(dayInHours%24 == 0) {
        startOfForcastDay = Math.floor(dayInHours/24);
        dayCheck = 0;
      }

      analogTime = ind.timepoint%24;
      console.log(analogTime);
      amOrPm = "am";
      if(analogTime > 12) {
        analogTime -= 12;
        amOrPm = "pm"
      }else if(analogTime == 0) {
        analogTime = 12;
      }

      if(ind.prec_type == "rain"){
        currentForcastDay = Math.floor(dayInHours/24);
        if(currentForcastDay == startOfForcastDay && dayCheck == 0) {
          if(currentForcastDay == 0) {
            createInfo("it will rain today");
          } else {
            createInfo("it will rain " + currentForcastDay + " days from now");
          }
          dayCheck = 1;
        }
      }

      if(i != 0 && i != 64) {
        if(ind.timepoint%24 == 21 && ind.prec_type == "rain") {
          createSubInfo("rain will continue to the day after");
          stillRaining = true;
        }
        if((forcast[i-1].prec_type != "rain" && ind.prec_type == "rain") || (ind.timepoint%24 == 0 && ind.prec_type == "rain") && !stillRaining) {
          createSubInfo("start of rain: " + analogTime + amOrPm);
        } else if((forcast[i-1].prec_type == "rain" && ind.prec_type == "none")) {
          createSubInfo("end of rain: " + analogTime + amOrPm);
          stillRaining = false;
        }
      }


    }
  }


});
