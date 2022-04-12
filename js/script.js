function displayMintedAmount(){
  var amount;
  var paragraph = document.getElementById('mintedAmount');
  
  async function cycle(){
    amount = await window.mintContract.methods.minted().call();
   
    paragraph.innerHTML = amount + '/12200';
    
    setTimeout(cycle, 1000);
  }

  cycle();
}

async function mintWithMana(){
  var numberBox = document.getElementById("mintAmount");
  var json = await getContractsJSON();
  const accounts = await getAccounts();

  //const price = await window.mintContract.methods.manaPrice(numberBox.value);
  const price = web3.utils.toBN((100*10**18)*numberBox.value);

  await window.manaContract.methods.approve(json.mintContractAddress, price).send({ from: accounts[0] });
  await window.mintContract.methods.buyWithMana(numberBox.value).send({ from: accounts[0] });
}

async function mintWithEthereum(){
  var numberBox = document.getElementById("mintAmount");
  var json = await getContractsJSON();
  const accounts = await getAccounts();

  const price = await window.mintContract.methods.minthEthCost().call();
  price = web3.utils.toBN(price * numberBox.value);

  await window.wethContract.methods.approve(json.stakeContractAddress, price).send({ from: accounts[0] });
  await window.mintContract.methods.publicSale(numberBox.value).send({ from: accounts[0] });
}

async function getContractsJSON() {
  const response = await fetch("./ElfGame Staking Page/contract_info/contracts.json");
  const json = await response.json();
  return json;
}

async function loadMintingContract() {
  var json = await getContractsJSON();
  return await new web3.eth.Contract(json.mintContractABI, json.mintContractAddress);
}

async function loadManaContract() {
  var json = await getContractsJSON();
  return await new web3.eth.Contract(json.manaContractABI, json.manaContractAddress);
}

async function loadWethContract() {
  var json = await getContractsJSON();
  return await new web3.eth.Contract(json.wethContractABI, json.wethContractAddress);
}

function isMobileDevice() {
    return 'ontouchstart' in window || 'onmsgesturechange' in window;
}

async function connectWalletMobile() {
    if (isMobileDevice()) {
        const metamaskAppDeepLink = "https://metamask.app.link/dapp/elfgame.app/index.html";
        window.location.href = metamaskAppDeepLink;
    }
}

async function connectWalletDesktop() {
    await ethereum.request({ method: 'eth_requestAccounts' });
    displayWallet();
}

async function goToStakingPage() {
    if(window.ethereum){
        var accounts = await getAccounts();
        if(accounts.length > 0){
            window.location.href = "./ElfGame Staking Page/index.html";
            /*
            web3.eth.net.getId().then(async function(networkId) {
                if (networkId != 137) {
                    alert("Switch to Matic Mainnet first.");
                }else{
                    window.location.href = "../ElfGame Staking Page/index.html";
                }
            });
            */
        }
        else{
            alert("Can't access staking page. Not connected to wallet.");
        }
    }
}

async function getAccounts(){
    return await ethereum.request({ method: 'eth_accounts' });
}

async function updateAccounts(newText) {
    const walletHeader = document.getElementById('walletHeader');
    const walletFooter = document.getElementById('walletFooter');
    walletHeader.innerHTML = newText;
    walletFooter.innerHTML = newText;
}

async function checkNetwork() {
    web3.eth.net.getId().then(async function(networkId) {
        if (networkId != 137) {
            alert("Not on Matic Mainnet.");
            await ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: "0x89" }],
            });
        }
    });
}

async function displayWallet() {
  const connectWalletButton = document.getElementById('connect');
  
  if(window.ethereum){
    window.web3 = new Web3(window.ethereum);
    const mintDiv = document.getElementsByClassName('mintDiv');
    var accounts = await getAccounts();

    if(accounts.length>0){
        connectWalletButton.style.visibility = "hidden";

        updateAccounts("Your address  : " + accounts[0]);
        
        window.mintContract = await loadMintingContract();
        window.manaContract = await loadManaContract();
        window.wethContract = await loadWethContract();
        
        mintDiv[0].style.visibility = "visible";
        
        displayMintedAmount();
    }
    else{
        updateAccounts("");
        mintDiv[0].style.visibility = "hidden";
        connectWalletButton.style.visibility = "visible";
    }
  }
  else{
      connectWalletButton.style.visibility = "visible";
  }
}

async function checkIfWalletIsConnected() {
    if(window.ethereum){
        connectWalletDesktop();
    } 
    else{
        connectWalletMobile();
    }
}

displayWallet();
