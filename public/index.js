function createInfo(text) {
  $("#infoDisplay").append("<h3 class=\"info\">" + text +"</h3>")
}

jQuery(document).ready(function() {

  document.getElementById("addressBTN").onclick = function(e) {
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
    for(let ind of forcast) {
      dayInHours = parseFloat(ind.timepoint);
      if(dayInHours%24 == 0) {
        startOfForcastDay = Math.floor(dayInHours/24);
        dayCheck = 0;
      }

      if(ind.prec_type == "rain"){
        currentForcastDay = Math.floor(dayInHours/24);
        if(currentForcastDay == startOfForcastDay && dayCheck == 0) {
          if(currentForcastDay == 0) {
            createInfo("rain will occur today");
          } else {
            createInfo("rain will occur " + currentForcastDay + " days from now");
          }
          dayCheck = 1;
        }
      }
    }
  }


});
