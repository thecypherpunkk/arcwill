import * as THREE from 'three'
import { useState, useEffect, useRef } from 'react'
import { ethers } from 'ethers'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useAccount } from 'wagmi'
import './App.css'

var CONTRACT_ADDRESS = "0xe83675f6f3f2C9538171ce07bacb4f790b5Ae871"
var USDC_ADDRESS = "0x3600000000000000000000000000000000000000"
var EURC_ADDRESS = "0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a"

var CONTRACT_ABI = [
  "function createWill(address _beneficiary, address _token, uint256 _amount, uint256 _inactivityDays) external",
  "function createWillSeconds(address _beneficiary, address _token, uint256 _amount, uint256 _inactivitySeconds) external",
  "function checkIn(uint256 _willId) external",
  "function checkInAll() external",
  "function cancelWill(uint256 _willId) external",
  "function executeWill(uint256 _willId) external",
  "function withdrawPartial(uint256 _willId, uint256 _amount) external",
  "function addFunds(uint256 _willId, uint256 _amount) external",
  "function isExpired(uint256 _willId) external view returns (bool)",
  "function timeRemaining(uint256 _willId) external view returns (uint256)",
  "function getUserWills(address _user) external view returns (uint256[])",
  "function getWillDetails(uint256 _willId) external view returns (address owner, address beneficiary, address token, uint256 amount, uint256 lastCheckIn, uint256 inactivityPeriod, bool isActive)",
  "function willCount() external view returns (uint256)"
]

var ERC20_ABI = [
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function balanceOf(address account) external view returns (uint256)"
]

function ShaderBackground() {
  var containerRef = useRef(null)
  useEffect(function() {
    var container = containerRef.current
    var scene = new THREE.Scene()
    var camera = new THREE.OrthographicCamera(-1,1,1,-1,0,1)
    var renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(window.innerWidth, window.innerHeight)
    container.appendChild(renderer.domElement)
    var material = new THREE.ShaderMaterial({
      uniforms: { iTime: { value: 0 }, iResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) } },
      vertexShader: 'void main(){gl_Position=vec4(position,1.0);}',
      fragmentShader: 'uniform float iTime;uniform vec2 iResolution;float rand(vec2 n){return fract(sin(dot(n,vec2(12.9898,4.1414)))*43758.5453);}float noise(vec2 p){vec2 ip=floor(p);vec2 u=fract(p);u=u*u*(3.0-2.0*u);float res=mix(mix(rand(ip),rand(ip+vec2(1,0)),u.x),mix(rand(ip+vec2(0,1)),rand(ip+vec2(1,1)),u.x),u.y);return res*res;}float fbm(vec2 x){float v=0.0;float a=0.3;vec2 shift=vec2(100);mat2 rot=mat2(cos(0.5),sin(0.5),-sin(0.5),cos(0.5));for(int i=0;i<3;++i){v+=a*noise(x);x=rot*x*2.0+shift;a*=0.4;}return v;}void main(){vec2 shake=vec2(sin(iTime*1.2)*0.005,cos(iTime*2.1)*0.005);vec2 p=((gl_FragCoord.xy+shake*iResolution.xy)-iResolution.xy*0.5)/iResolution.y*mat2(6,-4,4,6);vec2 v;vec4 o=vec4(0);float f=2.0+fbm(p+vec2(iTime*5.0,0))*0.5;for(float i=0.0;i<35.0;i++){v=p+cos(i*i+(iTime+p.x*0.08)*0.025+i*vec2(13,11))*3.5+vec2(sin(iTime*3.0+i)*0.003,cos(iTime*3.5-i)*0.003);float tn=fbm(v+vec2(iTime*0.5,i))*0.3*(1.0-(i/35.0));vec4 ac=vec4(0.05+0.15*sin(i*0.2+iTime*0.4),0.1+0.2*cos(i*0.3+iTime*0.5),0.4+0.2*sin(i*0.4+iTime*0.3),1);vec4 cc=ac*exp(sin(i*i+iTime*0.8))/length(max(v,vec2(v.x*f*0.015,v.y*1.5)));float tf=smoothstep(0.0,1.0,i/35.0)*0.6;o+=cc*(1.0+tn*0.8)*tf;}o=tanh(pow(o/100.0,vec4(1.6)));gl_FragColor=o*0.8;}'
    })
    var geometry = new THREE.PlaneGeometry(2,2)
    var mesh = new THREE.Mesh(geometry, material)
    scene.add(mesh)
    var frameId
    var animate = function() { material.uniforms.iTime.value += 0.016; renderer.render(scene, camera); frameId = requestAnimationFrame(animate) }
    animate()
    var handleResize = function() { renderer.setSize(window.innerWidth, window.innerHeight); material.uniforms.iResolution.value.set(window.innerWidth, window.innerHeight) }
    window.addEventListener('resize', handleResize)
    return function() { cancelAnimationFrame(frameId); window.removeEventListener('resize', handleResize); if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement); geometry.dispose(); material.dispose(); renderer.dispose() }
  }, [])
  return <div ref={containerRef} className="shader-bg" />
}

function UsdcIcon() { return <svg width="18" height="18" viewBox="0 0 32 32"><circle cx="16" cy="16" r="16" fill="#2775CA"/><path d="M21.2 18.2c0-2.2-1.3-2.9-3.8-3.2-1.8-.3-2.2-.7-2.2-1.5s.6-1.3 1.8-1.3c1.1 0 1.6.4 1.9 1.2.1.2.3.3.5.3h1.1c.3 0 .5-.2.5-.5v-.1c-.3-1.2-1.1-2.1-2.5-2.4v-1.4c0-.3-.2-.5-.5-.5h-1c-.3 0-.5.2-.5.5v1.3c-1.7.3-2.8 1.4-2.8 2.8 0 2.1 1.3 2.8 3.8 3.2 1.7.3 2.2.8 2.2 1.6s-.8 1.4-1.9 1.4c-1.5 0-2-.6-2.2-1.3-.1-.2-.3-.4-.5-.4h-1.2c-.3 0-.5.2-.5.5v.1c.3 1.3 1.3 2.2 2.9 2.5v1.4c0 .3.2.5.5.5h1c.3 0 .5-.2.5-.5v-1.4c1.8-.2 2.9-1.4 2.9-2.9z" fill="#fff"/></svg> }
function EurcIcon() { return <svg width="18" height="18" viewBox="0 0 32 32"><circle cx="16" cy="16" r="16" fill="#2775CA"/><text x="16" y="21" textAnchor="middle" fill="#fff" fontSize="16" fontWeight="700" fontFamily="Arial">€</text></svg> }

function App() {
  var { address, isConnected } = useAccount()
  var [contract, setContract] = useState(null)
  var [usdcContract, setUsdcContract] = useState(null)
  var [eurcContract, setEurcContract] = useState(null)
  var [usdcBalance, setUsdcBalance] = useState("0")
  var [eurcBalance, setEurcBalance] = useState("0")
  var [wills, setWills] = useState([])
  var [loading, setLoading] = useState(false)
  var [status, setStatus] = useState("")
  var [activeTab, setActiveTab] = useState("create")
  var [beneficiary, setBeneficiary] = useState("")
  var [amount, setAmount] = useState("")
  var [timeValue, setTimeValue] = useState("")
  var [timeUnit, setTimeUnit] = useState("days")
  var [selectedToken, setSelectedToken] = useState("USDC")
  var [withdrawAmounts, setWithdrawAmounts] = useState({})
  var [addAmounts, setAddAmounts] = useState({})
  var [openPanel, setOpenPanel] = useState({})
  var [expandedWill, setExpandedWill] = useState(null)
  var [claimResult, setClaimResult] = useState(null)
  var [claimLoading, setClaimLoading] = useState(false)
  var [incomingCount, setIncomingCount] = useState(0)

  function showStatus(msg) { setStatus(msg); setTimeout(function() { setStatus("") }, 8000) }
  function getTokenSymbol(addr) { if (addr && addr.toLowerCase() === EURC_ADDRESS.toLowerCase()) return "EURC"; return "USDC" }

  useEffect(function() {
    if (isConnected && address && window.ethereum) { initContracts() }
    else { setContract(null); setUsdcContract(null); setEurcContract(null); setUsdcBalance("0"); setEurcBalance("0"); setWills([]); setClaimResult(null); setIncomingCount(0) }
  }, [isConnected, address])

  async function initContracts() {
    try {
      var prov = new ethers.BrowserProvider(window.ethereum)
      var sign = await prov.getSigner()
      var cont = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, sign)
      var usdc = new ethers.Contract(USDC_ADDRESS, ERC20_ABI, sign)
      var eurc = new ethers.Contract(EURC_ADDRESS, ERC20_ABI, sign)
      setContract(cont); setUsdcContract(usdc); setEurcContract(eurc)
      await fetchBalances(usdc, eurc, address)
      await loadWills(cont, address)
      await searchClaimAuto(cont, address)
    } catch (e) { console.error("Init:", e) }
  }

  async function fetchBalances(usdc, eurc, addr) {
    try { setUsdcBalance(ethers.formatUnits(await usdc.balanceOf(addr), 6)) } catch (e) { setUsdcBalance("0") }
    try { setEurcBalance(ethers.formatUnits(await eurc.balanceOf(addr), 6)) } catch (e) { setEurcBalance("0") }
  }
  async function refreshBalances() { if (address && usdcContract && eurcContract) await fetchBalances(usdcContract, eurcContract, address) }

  async function loadWills(cont, addr) {
    try {
      var ids = await cont.getUserWills(addr); var list = []
      for (var i = 0; i < ids.length; i++) {
        try {
          var d = await cont.getWillDetails(ids[i]); if (!d[6]) continue
          var rem = 0, exp = false; try { rem = Number(await cont.timeRemaining(ids[i])); exp = await cont.isExpired(ids[i]) } catch (e) {}
          var ps = Number(d[5]); var pd; if (ps<3600) pd=Math.floor(ps/60)+"m"; else if (ps<86400) pd=Math.floor(ps/3600)+"h"; else pd=Math.floor(ps/86400)+"d"
          list.push({ id: Number(ids[i]), owner: d[0], beneficiary: d[1], token: d[2], tokenSymbol: getTokenSymbol(d[2]), amount: ethers.formatUnits(d[3],6), lastCheckIn: new Date(Number(d[4])*1000).toLocaleString('en-US'), inactivityPeriod: pd, isActive: d[6], timeRemaining: rem, isExpired: exp })
        } catch (e) {}
      }
      setWills(list)
    } catch (e) {}
  }

  async function searchClaimAuto(cont, addr) {
    try {
      var total = Number(await cont.willCount()); var found = []
      for (var i = 0; i < total; i++) {
        try {
          var d = await cont.getWillDetails(i); if (!d[6]) continue
          if (d[1].toLowerCase() === addr.toLowerCase()) {
            var rem = 0, exp = false; try { rem = Number(await cont.timeRemaining(i)); exp = await cont.isExpired(i) } catch (e) {}
            var ps = Number(d[5]); var pd; if (ps<3600) pd=Math.floor(ps/60)+"m"; else if (ps<86400) pd=Math.floor(ps/3600)+"h"; else pd=Math.floor(ps/86400)+"d"
            found.push({ id: i, owner: d[0], beneficiary: d[1], token: d[2], tokenSymbol: getTokenSymbol(d[2]), amount: ethers.formatUnits(d[3],6), lastCheckIn: new Date(Number(d[4])*1000).toLocaleString('en-US'), inactivityPeriod: pd, isActive: d[6], timeRemaining: rem, isExpired: exp })
          }
        } catch (e) {}
      }
      setClaimResult(found); setIncomingCount(found.length)
    } catch (e) {}
  }

  async function refreshClaims() { if (contract && address) { setClaimLoading(true); await searchClaimAuto(contract, address); setClaimLoading(false) } }
  async function doClaimWill(id) { try { setClaimLoading(true); var tx = await contract.executeWill(id); await tx.wait(); showStatus("Will claimed successfully!"); await refreshBalances(); await searchClaimAuto(contract, address); setClaimLoading(false) } catch (e) { showStatus("Error: "+(e.reason||e.message)); setClaimLoading(false) } }

  async function createWill() {
    try {
      if (!isConnected) { showStatus("Please connect your wallet first!"); return }
      if (!beneficiary||!amount||!timeValue) { showStatus("Please fill all fields!"); return }
      if (!ethers.isAddress(beneficiary)) { showStatus("Invalid address!"); return }
      var tokenAddr = selectedToken==="USDC" ? USDC_ADDRESS : EURC_ADDRESS
      var tokenContract = selectedToken==="USDC" ? usdcContract : eurcContract
      setLoading(true); showStatus("Approving "+selectedToken+"...")
      var amt = ethers.parseUnits(amount, 6)
      var tx1 = await tokenContract.approve(CONTRACT_ADDRESS, amt); await tx1.wait()
      showStatus("Creating will...")
      var tx2; if (timeUnit==="minutes") tx2 = await contract.createWillSeconds(beneficiary, tokenAddr, amt, parseInt(timeValue)*60); else tx2 = await contract.createWill(beneficiary, tokenAddr, amt, parseInt(timeValue))
      await tx2.wait(); showStatus("Will created successfully!"); setBeneficiary(""); setAmount(""); setTimeValue("")
      await loadWills(contract, address); await refreshBalances(); setActiveTab("wills"); setLoading(false)
    } catch (error) { var msg = error.reason||error.message||"Error"; if (msg.includes("insufficient")) msg="Insufficient "+selectedToken+" balance!"; if (msg.includes("user rejected")) msg="Transaction cancelled."; showStatus(msg); setLoading(false) }
  }

  async function doCheckIn(id) { try { setLoading(true); var tx = await contract.checkIn(id); await tx.wait(); showStatus("Check-in successful!"); await loadWills(contract, address); setLoading(false) } catch(e) { showStatus("Error: "+(e.reason||e.message)); setLoading(false) } }
  async function doCheckInAll() { try { setLoading(true); var tx = await contract.checkInAll(); await tx.wait(); showStatus("All check-ins successful!"); await loadWills(contract, address); setLoading(false) } catch(e) { showStatus("Error: "+(e.reason||e.message)); setLoading(false) } }
  async function doCancelWill(id) { try { setLoading(true); var tx = await contract.cancelWill(id); await tx.wait(); showStatus("Will cancelled!"); setExpandedWill(null); await loadWills(contract, address); await refreshBalances(); setLoading(false) } catch(e) { showStatus("Error: "+(e.reason||e.message)); setLoading(false) } }
  async function doWithdrawPartial(id) { try { var amt=withdrawAmounts[id]; if(!amt||parseFloat(amt)<=0){showStatus("Enter amount!");return} setLoading(true); var tx=await contract.withdrawPartial(id,ethers.parseUnits(amt,6)); await tx.wait(); showStatus("Withdrawn!"); setWithdrawAmounts(Object.assign({},withdrawAmounts,{[id]:""})); setOpenPanel({}); await loadWills(contract,address); await refreshBalances(); setLoading(false) } catch(e){showStatus("Error: "+(e.reason||e.message));setLoading(false)} }
  async function doAddFunds(id,tokenAddr) { try { var amt=addAmounts[id]; if(!amt||parseFloat(amt)<=0){showStatus("Enter amount!");return} setLoading(true); var amtU=ethers.parseUnits(amt,6); var tc=tokenAddr&&tokenAddr.toLowerCase()===EURC_ADDRESS.toLowerCase()?eurcContract:usdcContract; var tx1=await tc.approve(CONTRACT_ADDRESS,amtU); await tx1.wait(); var tx2=await contract.addFunds(id,amtU); await tx2.wait(); showStatus("Funds added!"); setAddAmounts(Object.assign({},addAmounts,{[id]:""})); setOpenPanel({}); await loadWills(contract,address); await refreshBalances(); setLoading(false) } catch(e){showStatus("Error: "+(e.reason||e.message));setLoading(false)} }

  function togglePanel(id,panel) { var np=Object.assign({},openPanel); np[id]=openPanel[id]===panel?null:panel; setOpenPanel(np) }
  function formatTime(s) { if(s<=0) return "Expired!"; var d=Math.floor(s/86400),h=Math.floor((s%86400)/3600),m=Math.floor((s%3600)/60),sc=s%60; if(d>0) return d+"d "+h+"h"; if(h>0) return h+"h "+m+"m"; if(m>0) return m+"m "+sc+"s"; return sc+"s" }
  function shortAddr(a) { return a ? a.slice(0,6)+"..."+a.slice(-4) : "Not Connected" }
  var activeWills = wills.filter(function(w){return w.isActive})

  return (
    <div className="app">
      <ShaderBackground />
      <div className="app-content">
        <header className="header">
          <div className="header-content">
            <div className="header-row">
              <div className="logo">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><rect x="3" y="11" width="18" height="11" rx="2" stroke="#6366f1" strokeWidth="2"/><path d="M7 11V7a5 5 0 0110 0v4" stroke="#6366f1" strokeWidth="2" strokeLinecap="round"/></svg>
                <h1>ArcWill</h1>
                <span className="badge">TESTNET</span>
              </div>
              <div className="header-links">
                <a href="https://faucet.circle.com" target="_blank" rel="noopener noreferrer" className="header-link">Faucet</a>
                <a href="https://docs.arc.network" target="_blank" rel="noopener noreferrer" className="header-link">Docs</a>
                <a href="https://testnet.arcscan.app" target="_blank" rel="noopener noreferrer" className="header-link">Explorer</a>
              </div>
              <ConnectButton />
            </div>
          </div>
        </header>

        <main className="main">
            <>
              <div className="info-cards">
                <div className="info-card glass"><span className="info-label">Wallet</span><span className="info-value">{shortAddr(address)}</span></div>
                <div className="info-card glass"><span className="info-label"><UsdcIcon /> USDC</span><span className="info-value">{isConnected ? parseFloat(usdcBalance).toFixed(2) : "0.00"}</span></div>
                <div className="info-card glass"><span className="info-label"><EurcIcon /> EURC</span><span className="info-value">{isConnected ? parseFloat(eurcBalance).toFixed(2) : "0.00"}</span></div>
                <div className="info-card glass"><span className="info-label">Active Wills</span><span className="info-value">{isConnected ? activeWills.length : "0"}</span></div>
              </div>
              <div className="tabs">
                <button className={activeTab==="create"?"tab active":"tab"} onClick={function(){setActiveTab("create")}}>Create Will</button>
                <button className={activeTab==="wills"?"tab active":"tab"} onClick={function(){setActiveTab("wills")}}>My Wills {isConnected ? "("+activeWills.length+")" : "(0)"}</button>
                <button className={activeTab==="claim"?"tab active":"tab"} onClick={function(){setActiveTab("claim"); refreshClaims()}}>Incoming Wills {incomingCount>0?"("+incomingCount+")":""}</button>
              </div>

              {activeTab==="create" && (
                <div className="card glass">
                  <h2>Create New Will</h2>
                  <div className="form-group"><label>Beneficiary Address</label><input type="text" placeholder="0x..." value={beneficiary} onChange={function(e){setBeneficiary(e.target.value)}} /><span className="hint">The wallet address that will receive your funds</span></div>
                  <div className="form-group"><label>Token</label><div className="token-select-row"><button className={selectedToken==="USDC"?"token-btn active":"token-btn"} onClick={function(){setSelectedToken("USDC")}}><UsdcIcon /> USDC</button><button className={selectedToken==="EURC"?"token-btn active":"token-btn"} onClick={function(){setSelectedToken("EURC")}}><EurcIcon /> EURC</button></div></div>
                  <div className="form-group"><label>{selectedToken} Amount</label><input type="number" placeholder="100" value={amount} onChange={function(e){setAmount(e.target.value)}} /><span className="hint">Balance: {isConnected ? (selectedToken==="USDC"?parseFloat(usdcBalance).toFixed(2)+" USDC":parseFloat(eurcBalance).toFixed(2)+" EURC") : "0.00"}</span></div>
                  <div className="form-group"><label>Inactivity Period</label><div className="time-input-row"><select className="time-select" value={timeUnit} onChange={function(e){setTimeUnit(e.target.value);setTimeValue("")}}><option value="days">Days</option><option value="minutes">Minutes (Test)</option></select><input type="number" placeholder={timeUnit==="days"?"180":"5"} value={timeValue} onChange={function(e){setTimeValue(e.target.value)}} /></div><span className="hint">{timeUnit==="days"?"If you don't check in within this period, funds go to beneficiary":"TEST: Duration in minutes (min 1 min)"}</span></div>
                  <button className="btn btn-glow" onClick={createWill} disabled={loading}>{loading?"Processing...": (isConnected ? "Create Will with "+selectedToken : "Connect Wallet to Create")}</button>
                </div>
              )}

              {activeTab==="wills" && (
                <div className="card glass">
                  {!isConnected ? (
                    <div className="empty"><p>Connect your wallet to view your wills.</p><div style={{display:'flex', justifyContent:'center', marginTop:'10px'}}><ConnectButton /></div></div>
                  ) : (
                    <>
                      <div className="wills-header"><h2>My Wills</h2>{activeWills.length>1&&<button className="btn btn-ghost" onClick={doCheckInAll} disabled={loading}>Check-in All</button>}</div>
                      {activeWills.length===0?(<div className="empty"><p>No active wills.</p><button className="btn btn-glow" onClick={function(){setActiveTab("create")}}>Create Will</button></div>):(
                        <div className="wills-list">
                          {activeWills.map(function(w,index){return(
                            <div key={w.id} className={"will-card glass"+(w.isExpired?" expired":"")}>
                              {expandedWill!==w.id?(
                                <div className="will-preview" onClick={function(){setExpandedWill(w.id)}}>
                                  <div className="preview-left"><span className="will-id">#{index+1}</span>{w.tokenSymbol==="USDC"?<UsdcIcon/>:<EurcIcon/>}<span className="preview-amount">{w.amount} {w.tokenSymbol}</span><span className="preview-arrow">→</span><span className="preview-addr">{shortAddr(w.beneficiary)}</span></div>
                                  <div className="preview-right"><span className={w.isExpired?"text-danger":"text-success"}>{formatTime(w.timeRemaining)}</span><span className={"will-status "+(w.isExpired?"status-expired":"status-active")}>{w.isExpired?"EXPIRED":"ACTIVE"}</span></div>
                                </div>
                              ):(
                                <div className="will-expanded">
                                  <div className="will-exp-header" onClick={function(){setExpandedWill(null)}}><span className="will-id">Will #{index+1}</span></div>
                                  <div className="will-details">
                                    <div className="will-row"><span>Beneficiary:</span><span>{shortAddr(w.beneficiary)}</span></div>
                                    <div className="will-row"><span>Token:</span><span style={{display:'flex',alignItems:'center',gap:'6px'}}>{w.tokenSymbol==="USDC"?<UsdcIcon/>:<EurcIcon/>}{w.tokenSymbol}</span></div>
                                    <div className="will-row"><span>Locked Amount:</span><div className="row-right-group">
                                      {openPanel[w.id]==="withdraw"?(<div className="inline-fund"><input type="number" placeholder="Amount" value={withdrawAmounts[w.id]||""} onChange={function(e){setWithdrawAmounts(Object.assign({},withdrawAmounts,{[w.id]:e.target.value}))}} /><button className="btn-mini-action" onClick={function(){doWithdrawPartial(w.id)}}>Withdraw</button><button className="btn-mini-close" onClick={function(){togglePanel(w.id,"withdraw")}}>✕</button></div>)
                                      :openPanel[w.id]==="add"?(<div className="inline-fund"><input type="number" placeholder="Amount" value={addAmounts[w.id]||""} onChange={function(e){setAddAmounts(Object.assign({},addAmounts,{[w.id]:e.target.value}))}} /><button className="btn-mini-action" onClick={function(){doAddFunds(w.id,w.token)}}>Add</button><button className="btn-mini-close" onClick={function(){togglePanel(w.id,"add")}}>✕</button></div>)
                                      :(<><button className="btn-mini" onClick={function(){togglePanel(w.id,"withdraw")}}>Withdraw</button><button className="btn-mini" onClick={function(){togglePanel(w.id,"add")}}>Add Funds</button><span>{w.amount} {w.tokenSymbol}</span></>)}
                                    </div></div>
                                    <div className="will-row"><span>Last Check-in:</span><span>{w.lastCheckIn}</span></div>
                                    <div className="will-row"><span>Period:</span><span>{w.inactivityPeriod}</span></div>
                                    <div className="will-row"><span>Remaining:</span><span className={w.isExpired?"text-danger":"text-success"}>{formatTime(w.timeRemaining)}</span></div>
                                  </div>
                                  <div className="will-actions"><button className="btn btn-success" onClick={function(){doCheckIn(w.id)}} disabled={loading}>Check-in</button><button className="btn btn-danger" onClick={function(){doCancelWill(w.id)}} disabled={loading}>Cancel</button></div>
                                </div>
                              )}
                            </div>
                          )})}
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              {activeTab==="claim" && (
                <div className="card glass">
                  {!isConnected ? (
                    <div className="empty"><p>Connect your wallet to view incoming wills.</p><div style={{display:'flex', justifyContent:'center', marginTop:'10px'}}><ConnectButton /></div></div>
                  ) : (
                    <>
                      <div className="wills-header"><h2>Incoming Wills</h2><button className="btn btn-ghost" onClick={refreshClaims} disabled={claimLoading}>{claimLoading?"Searching...":"Refresh"}</button></div>
                      <p className="claim-desc">Wills assigned to your wallet will appear here.</p>
                      {claimResult&&claimResult.length===0&&(<div className="empty"><p>No incoming wills found.</p></div>)}
                      {claimResult&&claimResult.length>0&&(
                        <div className="wills-list" style={{marginTop:'16px'}}>
                          {claimResult.map(function(w){return(
                            <div key={w.id} className={"will-card glass"+(w.isExpired?" expired":"")}>
                              <div className="will-expanded">
                                <div className="will-details">
                                  <div className="will-row"><span>From:</span><span>{shortAddr(w.owner)}</span></div>
                                  <div className="will-row"><span>Amount:</span><span style={{display:'flex',alignItems:'center',gap:'6px'}}>{w.tokenSymbol==="USDC"?<UsdcIcon/>:<EurcIcon/>}{w.amount} {w.tokenSymbol}</span></div>
                                  <div className="will-row"><span>Period:</span><span>{w.inactivityPeriod}</span></div>
                                  <div className="will-row"><span>Status:</span><span className={w.isExpired?"text-danger":"text-success"}>{w.isExpired?"Ready to claim!":formatTime(w.timeRemaining)+" remaining"}</span></div>
                                </div>
                                <div className="will-actions">{w.isExpired?(<button className="btn btn-glow" onClick={function(){doClaimWill(w.id)}} disabled={claimLoading} style={{width:'100%'}}>{claimLoading?"Claiming...":"Claim "+w.amount+" "+w.tokenSymbol}</button>):(<div className="claim-waiting">Sender is still active</div>)}</div>
                              </div>
                            </div>
                          )})}
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </>
          {status&&<div className="status-bar glass">{status}</div>}
        </main>
        <footer className="footer"><p>ArcWill — USDC & EURC Digital Asset Vault on Arc Network</p></footer>
      </div>
    </div>
  )
}

export default App