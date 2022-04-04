/*global chrome*/
/*global browser*/
import React, { useEffect, useState } from 'react';
import Switch from '@mui/material/Switch';
import { bytesToCo2 } from "bytes-to-co2";
import './App.css';
import { ProgressBar } from './ProgressBar';

const getRegion = async () => {
  const response = await fetch('http://ip-api.com/json');
  const res = await response.json();

  return res.countryCode;
}

const label = { inputProps: { 'aria-label': 'Switch demo' }, label: 'Show website data' };

const YEARLY_NUM_TREES = 15;
// 22kgs of C02 translate to 1 tree
// an individual can emit 330kgs of CO2 a year
const YEARLY_EMISSIONS = 330000;
const PER_TREE_CO2 = 22000;

const App = () => {
  const [treeViewVer, setTreeViewVer] = useState(0);
  const [showWebsiteData, setShowWebsiteData] = useState(false);
  const [countryCode, setCountryCode] = useState('');
  const [stats, setStats] = useState(null);
  const [bytesPerYear, setBytesPerYear] = useState(null);
  const [totalBytes, setTotalBytes] = useState(0);


  // const [numTrees, setNumTrees] = useState(YEARLY_NUM_TREES);
  const year = new Date().getFullYear();
  const bytesPerYearJson = null === bytesPerYear ? {} : JSON.parse(bytesPerYear);
  const currentYearBytes = undefined === bytesPerYearJson[year] ? 0 : parseInt(bytesPerYearJson[year]);

  const statsJson = null === stats ? {} : JSON.parse(stats);
  const keys = Object.keys(statsJson);

  // Mock data for running locally
  // const statsJson = {
  //   'youtube': 778,
  //   'google': 234,
  //   'twitter': 541,
  //   'supersupersupersupserupser': 1000,
  // }
  // const keys = ['youtube', 'google', 'twitter', 'supersupersupersupserupser'];

  // returns amount of Co2 in grams
  const totalEmissions = bytesToCo2({ byteSize: currentYearBytes, country: countryCode });

  // const remainingTrees = Math.floor(((YEARLY_EMISSIONS - totalEmissions) / YEARLY_EMISSIONS) * YEARLY_NUM_TREES);
  const remainingTrees = Math.ceil((YEARLY_EMISSIONS - totalEmissions) / PER_TREE_CO2);
  const deadTrees = YEARLY_NUM_TREES - remainingTrees;

  useEffect(async () => {
    chrome.runtime.sendMessage({ action: 'start' });
    const code = await getRegion();
    // const code = "USA"  // hard code to USA for running locally

    // console.log(code);
    setCountryCode(code);
    const items = await chrome.storage.local.get(['stats', 'bytesPerYear', 'totalBytes']);
    debugger;
    setStats(items.stats);
    setBytesPerYear(items.bytesPerYear);
    setTotalBytes(items.totalBytes);
  },[]);

  // useEffect(() => {
  //   if (remainingTrees !== numTrees) {
  //     setNumTrees(remainingTrees);
  //   }
  //   const remTrees = Math.floor(((YEARLY_EMISSIONS - totalEmissions) / YEARLY_EMISSIONS) * YEARLY_NUM_TREES);
  //   if (remTrees !== numTrees) {
  //     setNumTrees(remTrees)
  //   }
  // }, [totalEmissions, remainingTrees, numTrees])

  const startTracking = () => {
    chrome.runtime.sendMessage({ action: 'start' });
  }

  const stopTracking = () => {
    chrome.runtime.sendMessage({ action: 'stop' });
  }

  const renderTrees = () => {
    let treeImages = []
    // for-loop because can't do inline functions D: 
    for (let i = 0; i < remainingTrees; i++) {
      treeImages.push(<img src={"tree_art.png"} alt="tree" className="tree" />)
    }
    for (let i = 0; i < deadTrees; i++) {
      treeImages.push(<img src={"tree_art_2.png"} alt="tree" className="tree" />)
    }
    return treeImages
  }

  const toggleTreeViewVer = () => {
    setTreeViewVer((treeViewVer + 1) % 4)
  }

  const onSwitchChange = () => {
    setShowWebsiteData(!showWebsiteData);
  }

  // console.log(statsJson);
  // console.log(totalBytes);


  return (
    <div className="App">
      <button className="toggle-view-btn" onClick={toggleTreeViewVer}>V</button>
      <header className="App-header">
        Track your website data
      </header>
      <section className="app-graph-section">
        <div className="monthly-budget-header">Yearly budget</div>


        <div className="trees-section">

          {treeViewVer === 0 &&
            <div className="all-trees-section">
              <div className="trees">
                {renderTrees()}
              </div>
              <span>{`Trees remaining: ${remainingTrees}`}</span>
            </div>}

          {treeViewVer === 1 &&
            <div className="two-tree-counters view-one">
              <div className="trees-counter">
                <img src={"tree_art.png"} alt="tree" className="counter-icon" />
                <span className="counter-num">{remainingTrees}</span>
                <span className="counter-text">Trees remaining</span>
              </div>
              <div className="trees-counter">
                <img src={"tree_art_2.png"} alt="tree" className="counter-icon" />
                <span className="counter-num">{totalEmissions.toFixed(4)}</span>
                <span className="counter-text">Total emissions</span>
              </div>
            </div>

          }

          {treeViewVer === 2 &&
            <div className="two-tree-counters">
              <div className="trees-counter">
                <img src={"tree_art.png"} alt="tree" className="counter-icon" />
                <span className="counter-num">{remainingTrees}</span>
                <span className="counter-text">Trees remaining</span>
              </div>
              <div className="trees-counter">
                <img src={"tree_art_2.png"} alt="tree" className="counter-icon" />
                <span className="counter-num">{17 - remainingTrees}</span>
                <span className="counter-text">Trees killed</span>
              </div>
            </div>
          }

          {treeViewVer === 3 &&
            <ProgressBar treeBudget={YEARLY_NUM_TREES} remainingTrees={remainingTrees} />
          }
        </div>

        {treeViewVer !== 1  && 
          <div style={{display: 'flex'}}>
              <p className="emissions-table-header">
                {`Total emissions: ${(totalEmissions / 1000).toFixed(2)} kgs`}
              </p>
              <p className="emissions-switch-label"><Switch {...label} checked={showWebsiteData} onClick={onSwitchChange} onChange={onSwitchChange} /> Show website data</p>
          </div>
          }
        {showWebsiteData && <div className={`emissions-table-section ${treeViewVer=== 1 ? 'view-one' : '' }`}>
          <table>
            <thead>
              <tr>
                <th>WEBSITE</th>
                <th>CO2 (g)</th>
              </tr>
            </thead>
            {keys && keys.length && keys.reverse().map(key => {
              // console.log(countryCode);
              const emissions = bytesToCo2({ byteSize: statsJson[key], country: countryCode });
              return <tr>
                <td className="emissions-cell emissions-site-name">{key}</td>
                <td className="emissions-cell">{emissions.toFixed(4)}</td>
              </tr>
            })}
          </table>
        </div>}
        <div className="buttons-wrapper">
          {/* <button onClick={startTracking}>Start tracking</button> */}
          {/* <button className="stop-tracking-btn" onClick={stopTracking}>Stop tracking</button> */}
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
