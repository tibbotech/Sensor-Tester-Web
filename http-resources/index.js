var ReactRouter = window.ReactRouterDOM
var Router = ReactRouter.MemoryRouter
var Route = ReactRouter.Route
var Link = ReactRouter.Link

const AppRouter = () => (
  <Router>
    <div>
      <Route path="/" exact component={MainMenu} />
      <Route path="/setid/" component={SetID} />
      <Route path="/scan/" component={Scan} />
      <Route path="/monitor/" component={Monitor} />
      <Route path="/uploadmonitor/" render={(props) => <Upload {...props} uploadtype={"monitor"} />} />
      <Route path="/uploadfirmware/" render={(props) => <Upload {...props} uploadtype={"firmware"} />} />
      <Route path="/setupmenu/" component={SetUp} />
      <Route path="/monitormenu/" component={MonitorMenu} />
      <Route path="/viewfirmware/" component={ViewFirmware} />
    </div>
  </Router>
);

class MainMenu extends React.Component {
  constructor() {
    super();
    $.ajaxSetup({ cache: false });
    this.state = { probe: null, reading: null }
    this.updateJSON();
  }

  updateJSON() {
    var sensorTypes = ["Unknown", "BP#01 - Ambient Temperature sensor", "BP#02 - Ambient Temperature & Humidity Sensor", "BP#03 - Ambient Light sensor", "BP#04 - 3-Axis Accelerometer", "Pressure Sensor"]
    this.interval = setInterval(() => {
      $.getJSON("json.html?date=" + new Date(), (data) => {
        this.setState({ probe: sensorTypes[data.probe], reading: data.reading })
      })
    }, 500);
  }

  render() {
    if (this.state.probe === "Unknown") {
      return (
        <div>
          <div>
            <h1>No Probes Detected!</h1> <br></br> <br></br>
            <h2 class="center">Please ensure probe is connected correctly and try again!<br></br><br></br><br></br></h2>
          </div>
        </div>
      )
    }
   else {
      return (
        <div>
          <div>
            <h1>{this.state.probe}</h1> <br></br> <br></br>
            <h2 class="center">Reading : {this.state.reading} <br></br><br></br><br></br></h2>
          </div>
        </div>
      )
    }
  }
}

class SetUp extends React.Component {

  constructor() {
    super();
  }

  render() {
    return (
      <div>
        <br></br><h1>Set Up Bus Probes</h1><br></br><br></br>
        <div class="row" align="center">
          <div class="col-xs-12 col-md-4">
            <Link to="/uploadmonitor/" style={{ textDecoration: 'none' }}><button class="button">
              Upload Monitor
                  </button></Link>
          </div>
          <div class="col-xs-12 col-md-4">
            <Link to="/uploadfirmware/" style={{ textDecoration: 'none' }}><button class="button">
              Upload Firmware
                  </button></Link>
          </div>
          <div class="col-xs-12 col-md-4">
            <Link to="/setid/" style={{ textDecoration: 'none' }}><button class="button">
              Set ID
                  </button></Link>
          </div>

        </div>
        <div class="center">
          <br></br><br></br><Link to="/"><button class="smallbutton">Main Menu</button></Link>
        </div>
      </div>
    );
  }
}

class MonitorMenu extends React.Component {
  constructor() {
    super();
  }
  render() {
    return (
      <div>
        <br></br><h1>Monitor Bus Probes</h1><br></br><br></br>
        <div class="row" align="center">
          <div class="col-xs-4"></div>

          <div class="col-xs-4">
            <Link to="/scan/" style={{ textDecoration: 'none' }}><button class="button">
              Scan
              </button></Link>
          </div>
        </div>

        <br></br>
        <div class="row" align="center">
          <div class="col-xs-2"></div>

          <div class="col-xs-4">
            <Link to="/viewfirmware/" style={{ textDecoration: 'none' }}><button class="button">
              View Firmware Versions
              </button></Link>
          </div>
          <div class="col-xs-4">
            <Link to="/monitor/" style={{ textDecoration: 'none' }}> <button class="button">
              View Probe Readings
              </button></Link>
          </div>
        </div>
        <div class="center">
          <br></br><br></br><Link to="/"><button class="smallbutton">Main Menu</button></Link>
        </div>
      </div>
    );
  }
}

class SetID extends React.Component {

  constructor() {
    super();
  }

  render() {
    return (
      <div>
        <br></br><h1 class="center">Set Probe ID</h1><br></br>
        <h2 class="center">
          Input the new ID.<br></br>
          Press and hold the MD button on the Probe.<br></br>
          Click Set ID.<br></br>
          Release the MD button.<br></br><br></br>
          <input type="number" id="address" min="1" max="247" class="center"></input><br></br><br></br>
          <button class="smallbutton" onClick={this.sendSetIDCommand.bind(this)}>Set ID</button><br></br>
          <Link to="/setupmenu/"><button class="smallbutton">Back</button></Link><br></br>
          <Link to="/"><button class="smallbutton">Main Menu</button></Link>
        </h2>
      </div>
    );
  }

  sendSetIDCommand() {
    var value = "0"
    value = document.getElementById("address").value;
    jQuery.ajax("sendsetidcommand.html?value=" + value);
    alert("Set ID command sent");
  }
}

class Upload extends React.Component {

  constructor() {
    super();
    this.state = { percentage: 0, uploadScreen: 1, uploadSuccessful: true }
  }

  componentWillUnmount() {
    clearInterval(this.interval);
    this.stopXModem();
  }


  startUpload() {
    if (this.props.uploadtype == "firmware") {
      jQuery.ajax("senduploadfirmwarecommand.html");
    } else {
      jQuery.ajax("senduploadmonitorcommand.html");

    }
    this.setState({ uploadScreen: 2 });
    this.startUploadBar();
  }

  startUploadBar() {
    this.interval = setInterval(() => {
      $.getJSON("json.html?date=" + new Date(), (data) => {
        this.setState({ percentage: data.percentage });
        this.setState({ uploadSuccessful: data.uploadsuccessful });
        if (document.getElementById("percent") != undefined) {
          document.getElementById("percent").innerHTML = (this.state.percentage);
          document.getElementById("progbar").style.width = (this.state.percentage) + "%";
        }
        if (this.state.uploadsuccessful === 0) {
          clearInterval(this.interval);
          this.setState({ percentage: 0, uploadScreen: 3 })
        }
        if (this.state.percentage >= 100) {
          clearInterval(this.interval);
          { this.uploadComplete() }
        }
      })
    }, 200);
  }

  uploadComplete() {
    this.setState({ uploadScreen: 3 });
    $.getJSON("json.html?date=" + new Date(), (data) => {
      this.setState({ uploadSuccessful: data.uploadsuccessful });
    })
  }

  stopXModem() {
    jQuery.ajax("sendstopxmodemcommand.html");
  }

  render() {
    if (this.state.uploadSuccessful === 0) {
      clearInterval(this.interval);
      return (
        <div>
          <div>
            <h1>Upload Failed!</h1> <br></br> <br></br>
            <h2 class="center">Please try again!<br></br><br></br><br></br></h2>
          </div>
          <h2>
            <Link to="/setupmenu/"><button class="smallbutton">Back</button></Link><br></br>
            <Link to="/"><button class="smallbutton">Main Menu</button></Link>
          </h2>
        </div>
      )
    }
    else if (this.state.uploadScreen === 1) {
      return (
        <div>
          <br></br><h1 class="center">Upload {this.props.uploadtype == "firmware" ? "Firmware" : "Monitor"}</h1><br></br>
          <h2 class="center">
            Leave only one Probe connected to your TPS device.<br></br>
            Disconnect the Probe power.<br></br>
            Press and hold the MD button on the Probe.<br></br>
            Connect power without releasing the MD button.<br></br>
            Release the MD button.<br></br>
            Click Upload.<br></br><br></br>
            <button class="smallbutton" onClick={this.startUpload.bind(this)}>Upload</button><br></br>
            <Link to="/setupmenu/"><button class="smallbutton">Back</button></Link><br></br>
            <Link to="/"><button class="smallbutton">Main Menu</button></Link>
          </h2>
        </div>
      );
    } else if (this.state.uploadScreen === 2 && this.state.percentage === 0) {
      return (
        <div>
          <br></br><h1><span id="title">Uploading {this.props.uploadtype == "firmware" ? "Firmware" : "Monitor"}...</span></h1><br></br>
          <h2>
            <div id="body" align='center'>
              <div id="percentupdate"><b><span id="percent"></span>% Complete</b></div><br></br>
              <div class="progress" id="progressb">
                <div id="progbar" class="progress-bar progress-bar-success" role="progressbar" aria-valuenow="40" aria-valuemin="0" aria-valuemax="100">
                </div>
              </div><br></br>
              <Link to="/setupmenu/"><button class="smallbutton">Back</button></Link><br></br>
              <Link to="/"><button class="smallbutton">Main Menu</button></Link>
            </div>
          </h2>
        </div>
      )
    } else if (this.state.uploadScreen === 2) {
      return (
        <div>
          <br></br><h1><span id="title">Uploading {this.props.uploadtype == "firmware" ? "Firmware" : "Monitor"}...</span></h1><br></br>
          <h2>
            <div id="body" align='center'>
              <div id="percentupdate"><b><span id="percent"></span>% Complete</b></div><br></br>
              <div class="progress" id="progressb">
                <div id="progbar" class="progress-bar progress-bar-success" role="progressbar" aria-valuenow="40" aria-valuemin="0" aria-valuemax="100">
                </div>
              </div>
            </div>
          </h2>
        </div>
      )
    } else if (this.state.uploadSuccessful === 1) {
      return (
        <div>
          <div>
            <h1>Upload Successful</h1> <br></br>
            {
              (this.props.uploadtype) == "firmware" ?
                (
                  <h2>
                    You can now power-cycle the Probe.<br></br><br></br>
                  </h2>
                ) :
                (
                  <h2>
                    Power-cycle the Probe to execute the Monitor updater.<br></br>
                    The updater will self-destroy.<br></br>
                    To finish, reupload the application firmware.<br></br><br></br>
                  </h2>
                )
            }
          </div>
          <h2>
            <Link to="/setupmenu/"><button class="smallbutton">Back</button></Link><br></br>
            <Link to="/"><button class="smallbutton">Main Menu</button></Link>
          </h2>
        </div>
      )
    }
    else
      return (
        <div>
        </div>
      )
  }
}

class Scan extends React.Component {

  constructor() {
    super();
    this.state = { percentage: null, numOfSensors: null }
    this.startScan();
  }

  startScan() {
    jQuery.ajax("sendscancommand.html");
    this.interval = setInterval(() => {
      $.getJSON("json.html?date=" + new Date(), (data) => {
        this.setState({ percentage: data.percentage });
        if (document.getElementById("percent") != undefined) {
          document.getElementById("percent").innerHTML = (this.state.percentage);
          document.getElementById("progbar").style.width = (this.state.percentage) + "%";
        }
        if (this.state.percentage >= 100) {
          clearInterval(this.interval);
          { this.scanComplete() }
        }
      })
    }, 200);
  }

  scanComplete() {
    $.getJSON("json.html?date=" + new Date(), function (data) {
      this.setState({ numOfSensors: data.sensors });
    }.bind(this));
  }

  render() {
    if (this.state.numOfSensors === null) {
      return (
        <div>
          <br></br><h1><span id="title">Scanning for Probes...</span></h1><br></br>
          <h2>
            <div id="body" align='center'>
              <div id="percentupdate"><b><span id="percent"></span>% Complete</b></div><br></br>
              <div class="progress" id="progressb">
                <div id="progbar" class="progress-bar progress-bar-success" role="progressbar" aria-valuenow="40" aria-valuemin="0" aria-valuemax="100">
                </div>
              </div>
            </div>
          </h2>
        </div>
      )
    } else if (this.state.numOfSensors === 0) {
      return (
        <div>
          <h1>Scan Complete!</h1><br></br><br></br>
          <h2 class="center"><red>No Probes detected! Please ensure that the Probes are connected correctly and have been assigned UNIQUE IDs, then scan again.</red><br></br><br></br><br></br>
            <Link to="/monitormenu/"><button class="smallbutton">Back</button></Link><br></br>
            <Link to="/"><button class="smallbutton">Main Menu</button></Link></h2>
        </div>
      )
    } else if (this.state.numOfSensors > 0) {
      return (
        <div>
          <h1>Scan Complete!</h1><br></br><br></br>
          <h2 class="center"><green>{this.state.numOfSensors}</green> Probe(s) detected!<br></br><br></br><br></br>
            <Link to="/viewfirmware/"><button class="smallbutton">View Firmware Versions</button></Link><br></br>
            <Link to="/monitor/"><button class="smallbutton">View Probe Readings</button></Link><br></br>
            <Link to="/monitormenu/"><button class="smallbutton">Back</button></Link><br></br>
            <Link to="/"><button class="smallbutton">Main Menu</button></Link></h2>
        </div>
      )
    }
  }
}

class Monitor extends React.Component {

  constructor() {
    super();
    this.startPoll();
    this.state = { dataList: [], sensors: null }
    var sensorTypes = ["Unknown", "BP#01 - Ambient temperature sensor", "BP#02 - Ambient temperature & humidity sensor", "BP#03 - Ambient light sensor", "BP#04 - 3-axis accelerometer"]
    this.interval = setInterval(() => {
      $.getJSON("json.html?date=" + new Date(), (data) => {
        var dataList = [];
        for (let i = 0; i < data.id.length; i++) {
          dataList.push({
            id: data.id[i],
            type: sensorTypes[data.type[i]],
            data: data.data[i],
          })
        }
        this.setState({
          dataList: dataList,
          sensors: data.sensors
        })
      })
    }, 500);
  }

  stopPoll() {
    jQuery.ajax("sendstoppollcommand.html");
  }

  startPoll() {
    jQuery.ajax("sendstartpollcommand.html");
  }

  createHeaders() {
    //    createHeaders = () => {
    var names = ['ID', 'Type', 'Data'];
    var namesList = names.map(function (name) {
      return <th class="readingstableth">{name}</th>;
    })
    return <tr>{namesList}</tr>
  }

  //  renderDataList = () => {
  renderDataList() {
    return this.state.dataList.map(function (item) {
      return (
        <tr>
          <td style={{ width: '10%' }}>{item.id}</td>
          <td style={{ width: '45%' }}>{item.type}</td>
          <td style={{ width: '45%' }}>{item.data}</td>
        </tr>
      )
    })
  }

  componentWillUnmount() {
    clearInterval(this.interval);
    this.stopPoll();
  }

  render() {
    if (this.state.sensors === null) {
      return (
        <div>
        </div>
      )
    }
    else if (this.state.sensors === 0) {
      return (
        <div><br></br>
          <h2 class="center"><red>The Probe list is empty. Please Scan for connected probes before accessing this screen.</red><br></br><br></br>
            <Link to="/monitormenu/"><button class="smallbutton">Back</button></Link><br></br>
            <Link to="/"><button class="smallbutton">Main Menu</button></Link><br></br><br></br></h2>
        </div>
      )
    } else if (this.state.sensors > 0) {
      return (
        <h2><br></br><table align='center'>
          {this.createHeaders()}
          {this.renderDataList()}
        </table>
          <br></br><br></br>
          <Link to="/monitormenu/"><button class="smallbutton">Back</button></Link><br></br>
          <Link to="/"><button class="smallbutton">Main Menu</button></Link><br></br><br></br></h2>
      )
    }
  }
}

class ViewFirmware extends React.Component {

  constructor() {
    super();
    this.state = { dataList: [], sensors: null }
    var sensorTypes = ["Unknown", "BP#01 - Ambient temperature sensor", "BP#02 - Ambient temperature & humidity sensor", "BP#03 - Ambient light sensor", "BP#04 - 3-axis accelerometer"]
    $.getJSON("json.html?date=" + new Date(), (data) => {
      var dataList = [];
      for (let i = 0; i < data.id.length; i++) {
        dataList.push({
          id: data.id[i],
          type: sensorTypes[data.type[i]],
          monitor: data.monitor[i],
          firmware: data.firmware[i],
        })
      }
      this.setState({
        dataList: dataList,
        sensors: data.sensors
      })
    })
  }

  createHeaders = () => {
    var names = ['ID', 'Type', 'Monitor', 'Firmware'];
    var namesList = names.map(function (name) {
      return <th>{name}</th>;
    })
    return <tr>{namesList}</tr>
  }

  renderDataList = () => {
    return this.state.dataList.map(function (item) {
      return (
        <tr>
          <td>{item.id}</td>
          <td>{item.type}</td>
          <td>{item.monitor}</td>
          <td>{item.firmware}</td>
        </tr>
      )
    })
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  render() {
    if (this.state.sensors === null) {
      return (
        <div>
        </div>
      )
    }
    else if (this.state.sensors === 0) {
      return (
        <div><br></br>
          <h2 class="center"><red>The Probe list is empty. Please Scan for connected probes before accessing this screen.</red><br></br><br></br>
            <Link to="/monitormenu/"><button class="smallbutton">Back</button></Link><br></br>
            <Link to="/"><button class="smallbutton">Main Menu</button></Link><br></br><br></br>
          </h2>
        </div>
      )
    } else if (this.state.sensors > 0) {
      return (
        <h2><br></br><table align='center'>
          {this.createHeaders()}
          {this.renderDataList()}
        </table>
          <br></br><br></br>
          <Link to="/monitormenu/"><button class="smallbutton">Back</button></Link><br></br>
          <Link to="/"><button class="smallbutton">Main Menu</button></Link><br></br><br></br>
        </h2>

      )
    }
  }
}

ReactDOM.render(
  <AppRouter />,
  document.getElementById('root')
);