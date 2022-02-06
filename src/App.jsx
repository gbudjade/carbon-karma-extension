    /*global chrome*/
    /*global browser*/
import React, {useEffect, useState} from 'react';
import { bytesToCo2 } from "bytes-to-co2";
import './App.css';

const getRegion = async () => {
  const response = await fetch('http://ip-api.com/json');
  const res = await response.json();

  return res.countryCode;
}

const App = () => {

    const [countryCode, setCountryCode] = useState('');
    const totalBytes = localStorage.getItem('totalBytes') || 0;
    const stats = localStorage.getItem('stats');
    const statsJson = null === stats ? {} : JSON.parse(stats);
    const keys = Object.keys(statsJson);

    useEffect(async () => {
      const code = await getRegion();
      // console.log(code);
      setCountryCode(code);
    });

    const startTracking = () => {
      chrome.runtime.sendMessage({ action: 'start' });
    }

    const stopTracking = () => {
      chrome.runtime.sendMessage({ action: 'stop' });
    }

    // console.log(statsJson);
    // console.log(totalBytes);

    const totalEmissions = bytesToCo2({byteSize: totalBytes, country: countryCode});

    return (
      <div className="App">
        <header className="App-header">
          Track your website data
        </header>
        <section className="app-graph-section">
          <button onClick={startTracking}>Start tracking</button>
          <button onClick={stopTracking}>Stop tracking</button>
          <div>
          <h2>{`Total emissions: ${totalEmissions.toFixed(4)}`}</h2>
          <table>
            {/* <th>
              <td>Website</td>
              <td>CO2 emissions</td>
            </th> */}
            {keys && keys.length && keys.reverse().map(key => {
              // console.log(countryCode);
              const emissions = bytesToCo2({byteSize: statsJson[key], country: countryCode});
              return <tr>
                <td>{key}</td>
                <td>{emissions.toFixed(4)}</td>
              </tr>
            })}
          </table>
          </div>
          
        </section>
        {/* <section className="app-lower-section">
          Add lower section here
        </section>
        <footer className="app-footer">
          Add footer here
        </footer> */}
      </div>
    );
}

export default App;
