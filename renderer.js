// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are not available in this process.
$(document).ready(function () {
  // Initiate variables used
  var devicePort = "";
  var baudRate = 9600;
  var serialPortLists = [];
  var serialPortPathSelected = null;
  var preferences = {};
  var elDetached = null;
  var numberOfSensor = 0;
  var sensor = [];
  var dataTemp = [];
  var dataRegXY = [];
  var regX = [];
  var regY = [];
  var sbx = [];
  var sby = [];
  // Showing up about window and hiding main window app
  $("#about-modal").show();
  $("#window-app").hide();
  $("#container-experiment").hide();
  $("#container-preferences").hide();
  // Window ready to send to main process
  window.api.send("toMain", { state: "window is ready" });
  // Receive data event from main process
  window.api.receive("fromMain", (data) => {
    if (data.elementid) {
      console.log("Received from main process");
      // Checking data receiver handler
      if (data.elementid === "serialport-list") {
        if (data.value.length > 0) {
          // Serialport lists for experiment
          $("#serialport-list").html("<li class=\"list-group-header\"><input id=\"serialport-search\" class=\"form-control\" type=\"text\" placeholder=\"Filter Path\"></li>");
          $("#serialport").html("");
          serialPortLists = data.value;
          data.value.forEach((item, idx) => {
            console.log(item);
            if (item.manufacturer) {
              // var o = new Option(item.manufacturer + "(" + item.path + ")", item.path);
              /// jquerify the DOM object "o" so we can use the html method
              // $(o).html(item.manufacturer + "(" + item.path + ")");
              // $("#serialport").append(o);
              if (item.manufacturer.toLowerCase().includes("arduino")) {
                $("#" + data.elementid).append("<li class=\"list-group-item\"><img class=\"img-circle media-object pull-left\" src=\"./assets/img/arduino-icon.png\" width=\"32\" height=\"32\"><div class=\"media-body\"><strong>" + item.manufacturer + "</strong><p>" + item.path + "</p></div></li>");
              } else {
                $("#" + data.elementid).append("<li class=\"list-group-item\"><img class=\"img-circle media-object pull-left\" src=\"./assets/img/serialport-icon.png\" width=\"32\" height=\"32\"><div class=\"media-body\"><strong>" + item.manufacturer + "</strong><p>" + item.path + "</p></div></li>");
              }
            } else {
              // var o = new Option("- (" + item.path + ")", item.path);
              /// jquerify the DOM object 'o' so we can use the html method
              // $(o).html("- (" + item.path + ")");
              // $("#serialport").append(o);
              $("#" + data.elementid).append("<li class=\"list-group-item\"><img class=\"img-circle media-object pull-left\" src=\"./assets/img/serialport-icon.png\" width=\"32\" height=\"32\"><div class=\"media-body\"><strong>-</strong><p>" + item.path + "</p></div></li>")
            }
          })
          elDetached = $("#serialport-list .list-group-item");
          // Serialport lists for preferences
          serialPortPathSelected = null;
          $("#serialport-list .list-group-item").each(function () {
            console.log($(this).html().substring($(this).html().indexOf("<p>") + 3, $(this).html().indexOf("</p>")));
            $(this).removeClass("active");
            if ($(this).html().substring($(this).html().indexOf("<p>") + 3, $(this).html().indexOf("</p>")) === preferences.serialport) {
              console.log(true);
              $(this).addClass("active");
              serialPortPathSelected = $(this).html().substring($(this).html().indexOf("<p>") + 3, $(this).html().indexOf("</p>"));
            }
          });
          // Serialport selection handler
          $("#serialport-list .list-group-item").click(function (evt) {
            // console.log($(this));
            console.log($(this)[0].innerHTML.substring($(this).html().indexOf("<p>") + 3, $(this).html().indexOf("</p>")));
            $(".list-group-item").each(function () {
              $(this).removeClass("active");
            });
            $(this).addClass("active");
            serialPortPathSelected = $(this)[0].innerHTML.substring($(this).html().indexOf("<p>") + 3, $(this).html().indexOf("</p>"));
          });
          // Filtering serialport
          $("#serialport-search").keyup(function () {
            serialPortPathSelected = null;
            $("#serialport-list .list-group-item").detach();
            // console.log(elDetached);
    				if ($(this).val().length > 0) {
              serialPortLists.map((item, idx) => {
                console.log(item);
                if (item.path.toLowerCase().includes($(this).val().toLowerCase())) {
                  if (item.manufacturer) {
                    if (item.manufacturer.toLowerCase().includes("arduino")) {
                      $("#serialport-list").append("<li class=\"list-group-item\"><img class=\"img-circle media-object pull-left\" src=\"./assets/img/arduino-icon.png\" width=\"32\" height=\"32\"><div class=\"media-body\"><strong>" + item.manufacturer + "</strong><p>" + item.path + "</p></div></li>");
                    } else {
                      $("#serialport-list").append("<li class=\"list-group-item\"><img class=\"img-circle media-object pull-left\" src=\"./assets/img/serialport-icon.png\" width=\"32\" height=\"32\"><div class=\"media-body\"><strong>" + item.manufacturer + "</strong><p>" + item.path + "</p></div></li>");
                    }
                  } else {
                    $("#serialport-list").append("<li class=\"list-group-item\"><img class=\"img-circle media-object pull-left\" src=\"./assets/img/serialport-icon.png\" width=\"32\" height=\"32\"><div class=\"media-body\"><strong>-</strong><p>" + item.path + "</p></div></li>")
                  }
                }
              })
            } else {
              elDetached.appendTo("#serialport-list");
            }
            // Serialport lists for preferences
            $("#serialport-list .list-group-item").each(function () {
              console.log($(this).html().substring($(this).html().indexOf("<p>") + 3, $(this).html().indexOf("</p>")));
              $(this).removeClass("active");
              if ($(this).html().substring($(this).html().indexOf("<p>") + 3, $(this).html().indexOf("</p>")) === preferences.serialport) {
                console.log(true);
                $(this).addClass("active");
                serialPortPathSelected = $(this).html().substring($(this).html().indexOf("<p>") + 3, $(this).html().indexOf("</p>"));
              }
            });
            // Serialport selection handler
            $("#serialport-list .list-group-item").click(function (evt) {
              // console.log($(this));
              console.log($(this)[0].innerHTML.substring($(this).html().indexOf("<p>") + 3, $(this).html().indexOf("</p>")));
              $(".list-group-item").each(function () {
                $(this).removeClass("active");
              });
              $(this).addClass("active");
              serialPortPathSelected = $(this)[0].innerHTML.substring($(this).html().indexOf("<p>") + 3, $(this).html().indexOf("</p>"));
            });
          });
        }
      } else if (data.elementid === "container-preferences") {
        console.log(data.value);
        preferences = data.value;
        $("#baudrate").val(data.value.baudrate);
      } else if (data.elementid === "notification") {
        console.log(data.value);
        document.getElementById("modal-notification").close();
        $("#notification-content").html(data.value);
        document.getElementById("modal-notification").showModal();
      } else if (data.elementid === "sensor-stat") {
        console.log(data.value);
        if (isNaN(data.value)) {
          document.getElementById("modal-notification").close();
          $("#notification-content").html(data.value);
          document.getElementById("modal-notification").showModal();
        } else {
          sensor.forEach((item, idx) => {
            if (Number(data.value) === Number(item.signal)) {
              console.log("Index: ", idx);
              $("#" + (idx + 1).toString() + "stat").html("<span class=\"icon icon-check\"></span>");
            }
          })
        }
      } else if (data.elementid === "experiment-data") {
        console.log("Signal Data: ", data.value);
        if (isNaN(data.value)) {
          document.getElementById("modal-notification").close();
          $("#notification-content").html(data.value);
          document.getElementById("modal-notification").showModal();
        } else {
          dataTemp.push({
            timestamp: new Date(),
            signal: Number(data.value)
          });
          console.log("Sensor: ", sensor);
          console.log("Data Temp: ", dataTemp);
          if (sensor.length > 0) {
            var reference = dataTemp.filter((elem) => Number(sensor.find((el) => el.name === "1").signal) === Number(elem.signal));
            var r = sensor.filter((elem) => Number(elem.signal) === Number(data.value));
            var s = dataTemp.filter((elem) => Number(elem.signal) === Number(data.value));
            console.log("Ref: ", reference);
            console.log("Prop: ", r);
            console.log("Data: ", s);
            if (r.length > 0) {
              var tempDataXY = [];
              sbx.push((new Date(s[0].timestamp).getTime() - new Date(reference[0].timestamp).getTime())/1000.);
              sby.push(Number(r[0].dist));
              tempDataXY.push((new Date(s[0].timestamp).getTime() - new Date(reference[0].timestamp).getTime())/1000.);
              tempDataXY.push(Number(r[0].dist));
              console.log("Sb.X: ", sbx);
              console.log("Sb.Y: ", sby);
              console.log("TempXY: ", tempDataXY);
              dataRegXY.push(tempDataXY);
              // Create a Plot
              var trace = {
                x: sbx,
                y: sby,
                mode: "markers",
                type: "scatter",
                name: "Data",
                marker: { size: 8 }
              };
              var layout = {
                xaxis: {
                  title: {
                    text: "t (s)"
                  }
                },
                yaxis: {
                  title: {
                    text: "s (cm)"
                  }
                },
              };
              Plotly.newPlot("plot-data", [trace], layout);
            }
          } else {
            document.getElementById("modal-notification").close();
            $("#notification-content").html("Please Prepare Sensor Data Used in Preparation First");
            document.getElementById("modal-notification").showModal();
          }
        }
      }
    }
  });
  // Button event to show about window
  $("#get-about").click(function (evt) {
    $("#about-modal").show();
    $("#window-app").hide();
  });
  // Button event to show main window app
  $("#get-started").click(function (evt) {
    $("#about-modal").hide();
    $("#window-app").show();
    window.api.send("toMain", { state: "callibrating sensor" });
  });
  // Button event to submit preferences
  $("#submit-preferences").click(function (evt) {
    evt.preventDefault();
    console.log(serialPortPathSelected);
    console.log($("#baudrate").val());
    if (serialPortPathSelected && $("#baudrate").val()) {
      window.api.send("toMain", { state: "preferences val", val: { serialport: serialPortPathSelected, baudrate: Number($("#baudrate").val()) } });
    } else {
      console.log("Please, at least select one preferences");
      document.getElementById("modal-notification").close();
      $("#notification-content").html("Please, at Least Select One Preferences");
      document.getElementById("modal-notification").showModal();
    }
  });
  // Button event to navigate between menu list
  $(".nav-group-item").click(function (evt) {
    console.log($(this));
    $("#footer-toolbar").html("");
    $(".list-group-item").each(function () {
      $(this).removeClass("active");
    });
    $(".nav-group-item").each(function () {
      $(this).removeClass("active");
      $("#container-" + $(this)[0].id.split("-")[1]).hide();
    });
    $(this).addClass("active");
    $("#container-" + $(this)[0].id.split("-")[1]).show();
    if ($(this)[0].id.split("-")[1] === "preparation") {
      dataTemp = [];
      window.api.send("toMain", { state: "callibrating sensor" });
      $("#footer-toolbar").html("<button id=\"sensor-open\" class=\"btn btn-default active\"><span class=\"icon icon-list-add\"></span></button>");
      // Open modal for adding sensor
      $("#sensor-open").click(function (evt) {
        document.getElementById("modal-sensor").showModal();
      });
    } else if ($(this)[0].id.split("-")[1] === "experiment") {
      window.api.send("toMain", { state: "experiment data" });
      $("#footer-toolbar").html("<button class=\"btn btn-negative\">Reset</button>");
    } else if ($(this)[0].id.split("-")[1] === "preferences") {
      dataTemp = [];
      window.api.send("toMain", { state: "reload list" });
      window.api.send("toMain", { state: "check preferences" });
    }
  });
  // Open modal for adding sensor
  $("#sensor-open").click(function (evt) {
    document.getElementById("modal-sensor").showModal();
  });
  // Close modal for adding sensor
  $(".modal-exit").click(function (evt) {
    evt.preventDefault();
    // console.log(document.querySelectorAll("dialog"));
    document.querySelectorAll("dialog").forEach((item, idx) => {
      item.close();
    })
  });
  // Submit modal for adding sensor
  $("#sensor-submit").click(function (evt) {
    evt.preventDefault();
    console.log(numberOfSensor);
		console.log($("#sensor-num").val());
    console.log($("#sensor-signal").val());
		console.log($("#sensor-dist").val());
    // window.api.send("toMain", { state: "cookies store" });
    sensor.push({
      name: $("#sensor-num").val(),
      signal: $("#sensor-signal").val(),
      dist: $("#sensor-dist").val()
    })
    $("#sensor-prop tbody").append("<tr><td>" + (numberOfSensor + 1).toString() + "</td><td>" + sensor[numberOfSensor].signal.toString() + "</td><td>" + sensor[numberOfSensor].dist.toString() + "</td><td id=\"" + (numberOfSensor + 1).toString() + "stat\" class=\"text-center\"><span class=\"icon icon-minus\"></span></td><td class=\"text-center\"><span id=\"" + (numberOfSensor + 1).toString() + "del\" class=\"icon icon-trash\" title=\"Remove Sensor\"></span>&nbsp;<span id=\"" + (numberOfSensor + 1).toString() + "modify\" class=\"icon icon-pencil\" title=\"Edit Sensor Properties\"></span></td></tr>");
    numberOfSensor = sensor.length;
    $("#sensor-num").val(numberOfSensor + 1);
    // Remove listener for sensor
    $("#" + numberOfSensor.toString() + "del").click(function (evt) {
      if (Number(this.id.replace("del", "")) == numberOfSensor) {
        console.log($(this).closest("tr"));
        sensor.pop();
        numberOfSensor = sensor.length;
        $("#sensor-num").val(numberOfSensor + 1);
        $(this).closest("tr").remove();
      } else {
        document.getElementById("modal-notification").close();
        $("#notification-content").html("Cannot be Removed");
        document.getElementById("modal-notification").showModal();
      }
    });
    document.getElementById("modal-sensor").close();
  });
});
