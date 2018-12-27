class MainMenu extends React.Component {
  constructor() {
    super();
    $.ajaxSetup({ cache: false });
    this.state = { probetype: null, probename: null, reading: null }
    this.updateJSON();
  }

  updateJSON() {
    var sensorTypes = [
      ["Unknown",""], 
      ["BP#01 or Tibbit 29", "Ambient Temperature Sensor"],
      ["BP#02 or Tibbit 30","Ambient Temperature & Humidity Sensor"],
      ["BP#03 or Tibbit 28","Ambient Light Sensor"],
      ["Tibbit 36","3-Axis Accelerometer"],
      ["Tibbit 35","Barometric Pressure Sensor"]
    ]
    this.interval = setInterval(() => {
      $.getJSON("json.html?date=" + new Date(), (data) => {
        this.setState({ probetype: sensorTypes[data.probe][0], probename: sensorTypes[data.probe][1], reading: data.reading })
      })
    }, 500);
  }

  render() {
    if (this.state.probetype === "Unknown") {
      return (
        <div>
          <br></br><h1>No Probe Detected!</h1> <br></br>
          <h2>Please ensure probe is connected correctly</h2>
        </div>
      )
    }
    else {
      return (
        <div>
          <br></br><h1>{this.state.probetype}<br></br><br></br>
          {this.state.probename}<br></br><br></br>
          <green>{this.state.reading}</green></h1>
        </div>
      )
    }
  }
}
ReactDOM.render(
  <MainMenu />,
  document.getElementById('root')
);