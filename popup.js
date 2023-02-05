let formMap = {};

let ftvValue = document.getElementById("Financing LTV");
let loanRateValue = document.getElementById("Loan Rate");
let vacancyValue = document.getElementById("Vacancy");
let revenueGrowthValue = document.getElementById("Revenue Growth");
let expenseGrowthValue = document.getElementById("Expense Growth");
let dispositionYearValue = document.getElementById("Disposition Year");
let sellingCostValue = document.getElementById("Selling Costs");
let exitCapValue = document.getElementById("Exit Cap");
let managementFeeValue = document.getElementById("Management Fee");
let rentValue = document.getElementById("Rent Income");
let apikey;
let save_btn = document.getElementById("save-btn");
let api_field = document.getElementById("API-key-field")

window.onload = async function() {
    updateAnalysis();
    apikey = await getAPIKey();
  }


// user configurations
save_btn.addEventListener("click", (event) => {
    const data = {"APIKEY": api_field.value};
    console.log("change")
    setAPIKey(data)
})

// form scripts
ftvValue.value = 70.0;
vacancyValue.value = 6.25
sellingCostValue.value = 5.0;
exitCapValue.value = 7.0;
dispositionYearValue.value = 10;
revenueGrowthValue.value = 3.0;
expenseGrowthValue.value = 2.0;

// adding a new bookmark row to the popup

// const addNewCalculation = () => {};

// const viewCalculations = (currentPropertyData = []) => {
//     const calculatorElement = document.getElementById("calculator");
//     calculatorElement.innerHTML = "";

//     if (currentPropertyData.length > 0) {
//         for (let i = 0; 0 < currentPropertyData.length; i++) {
//             const calc = currentPropertyData[i];
//             addNewCalculation(calculatorElement, calc);
//         }
//     } else {
//         calculatorElement.innerHTML = '<i class="row">No calculations to show</i>';
//     }
// };

// const setBookmarkAttributes =  () => {};

document.addEventListener("DOMContentLoaded", async () => {
    const activeTab = await getActiveTabURL();
    const urlParams = activeTab.url.split("_M");
    const currentPropertyId = urlParams[urlParams.length-1]

    if (activeTab.url.includes("realtor.com/realestateandhomes-detail") && currentPropertyId) {
        chrome.storage.sync.get([currentPropertyId], (data) => {
            const currentPropertyData = data[currentPropertyId] ? JSON.parse(data[currentPropertyId]) : [];
            // viewCalculations(currentPropertyData);
        })
    } else {
        const container = document.getElementsByClassName("container")[0];
        container.innerHTML = '<div class="title">This is not an accepted real estate property listing.</div>';
    }
})


async function getActiveTabURL() {
    const tabs = await chrome.tabs.query({
        currentWindow: true,
        active: true
    });
    return tabs[0];
};
let calculatebtn = document.getElementById("calculate");

async function sendForm() {

    formMap["Financing LTV"] = ftvValue.value;
    formMap["Loan Rate"] = loanRateValue.value;
    formMap["Vacancy"] = vacancyValue.value;
    formMap["Revenue Growth"] = revenueGrowthValue.value;
    formMap["Expense Growth"] = expenseGrowthValue.value;
    formMap["Disposition Year"] = dispositionYearValue.value;
    formMap["Selling Costs"] = sellingCostValue.value;
    formMap["Exit Cap"] = exitCapValue.value;
    formMap["Management Fee"] = managementFeeValue.value;
    formMap["Rent Income"] = rentValue.value;

    const [tab] = await chrome.tabs.query({active: true, lastFocusedWindow: true});
    const response = await chrome.tabs.sendMessage(tab.id, {
        "from": "pop-up-form",
        "form": formMap
    });
    console.log(response);
  };


calculatebtn.addEventListener("click", () => {
    sendForm();
});

const getCalculationData = async (data) => {
    await chrome.storage.local.set({'calculationData': data});
    updateAnalysis();
}

chrome.runtime.onMessage.addListener((obj, sender, sendResponse) => {
    const { from, subject, data } = obj;
    if (from === "content" && subject == "calculation data") {
        getCalculationData(data);
    }
  });

const updateAnalysis = async () => {
    const calculationData = await chrome.storage.local.get('calculationData');
    const USDFormatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0
      });

    var option = {
    style: 'percent',
    minimumFractionDigits: 2
      
      };
      var percentFormatter = new Intl.NumberFormat("en-US", option);

    if ( Boolean(calculationData.calculationData) && calculationData.calculationData.capRate !== undefined ){
        document.getElementById('cap-rate').innerHTML = 'Cap Rate: <br>' + percentFormatter.format(calculationData.calculationData.capRate);
    }
    else {
        document.getElementById('cap-rate').innerHTML = 'Cap Rate: <br>' + percentFormatter.format(0.0);
    }
    if ( Boolean(calculationData.calculationData) && calculationData.calculationData.leveredProfit !== undefined ){
        document.getElementById('levered-profit').innerHTML = 'Levered Profit: <br>' + USDFormatter.format(calculationData.calculationData.leveredProfit);
    }
    else {
        document.getElementById('levered-profit').innerHTML = 'Levered Profit: <br>' + USDFormatter.format(0.0);
    }
    if ( Boolean(calculationData.calculationData) && calculationData.calculationData.leveredMoM !== undefined ){
        document.getElementById('levered-mom').innerHTML = 'Levered MoM: <br>' + (calculationData.calculationData.leveredMoM).toFixed(2) + 'x';
    }
    else {
        document.getElementById('levered-mom').innerHTML = 'Levered MoM: <br>' + 0.0 + 'x';
    }
    if ( Boolean(calculationData.calculationData) && calculationData.calculationData.coc !== undefined ){
        document.getElementById('coc').innerHTML = 'Cash on Cash Return: <br>' + (calculationData.calculationData.coc).toFixed(2) + '%';
    }
    else {
        document.getElementById('coc').innerHTML = 'Cash on Cash Return: <br>' + 0.0 + '%';
    }
    if ( Boolean(calculationData.calculationData) && calculationData.calculationData.Totalex !== undefined ){
        document.getElementById("total-expenses").innerHTML = 'Total Expense: <br>' + USDFormatter.format(calculationData.calculationData.Totalex);
    }
    else {
        document.getElementById("total-expenses").innerHTML = 'Total Expense: <br>' + USDFormatter.format(0.0);
    }
    if ( Boolean(calculationData.calculationData) && calculationData.calculationData.noi !== undefined ){
        document.getElementById('noi').innerHTML = 'NOI: <br>' + USDFormatter.format(calculationData.calculationData.noi);
    }
    else {
        document.getElementById('noi').innerHTML = 'NOI: <br>' + USDFormatter.format(0.0);
    }
}



var coll = document.getElementsByClassName("collapsible");
      for (var i = 0; i < coll.length; i++) {
        coll[i].addEventListener("click", function() {
          var content = this.nextElementSibling;
          if (content.style.display === "block") {
            content.style.display = "none";
            this.classList.remove("active");
          } else {
            for (var j = 0; j < coll.length; j++) {
              coll[j].nextElementSibling.style.display = "none";
              coll[j].classList.remove("active");
            }
            content.style.display = "block";
            this.classList.add("active");
          }
        });
      }



const getAPIKey = async () =>{
    const userconfigurations = await chrome.storage.sync.get('userconfigurations')
    if (Boolean(userconfigurations)){
        return await userconfigurations.userconfigurations.APIKEY;
    }
    else {
        return null;
    }
}
const setAPIKey = async (data) =>{
    await chrome.storage.sync.set({'userconfigurations': data});
}
