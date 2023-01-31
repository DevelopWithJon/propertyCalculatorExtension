window.onload = function() {
    updateAnalysis()
  }
// form scripts
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

ftvValue.value = 70.0;

// adding a new bookmark row to the popup

const addNewCalculation = () => {};

const viewCalculations = (currentPropertyData = []) => {
    const calculatorElement = document.getElementById("calculator");
    calculatorElement.innerHTML = "";

    if (currentPropertyData.length > 0) {
        for (let i = 0; 0 < currentPropertyData.length; i++) {
            const calc = currentPropertyData[i];
            addNewCalculation(calculatorElement, calc);
        }
    } else {
        calculatorElement.innerHTML = '<i class="row">No calculations to show</i>';
    }
};

// const setBookmarkAttributes =  () => {};

document.addEventListener("DOMContentLoaded", async () => {
    const activeTab = await getActiveTabURL();
    const urlParams = activeTab.url.split("_M");
    const currentPropertyId = urlParams[urlParams.length-1]
    
    if (activeTab.url.includes("realtor.com/realestateandhomes-detail") && currentPropertyId) {
        chrome.storage.sync.get([currentPropertyId], (data) => {
            const currentPropertyData = data[currentPropertyId] ? JSON.parse(data[currentPropertyId]) : [];
            viewCalculations(currentPropertyData);
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
let calculatebtn = document.getElementById("Calculator-btn");

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
        document.getElementById('cap-rate').innerHTML = 'Cap Rate: ' + percentFormatter.format(calculationData.calculationData.capRate);
    }
    else {
        document.getElementById('cap-rate').innerHTML = 0;
    }
    if ( Boolean(calculationData.calculationData) && calculationData.calculationData.leveredProfit !== undefined ){
        document.getElementById('levered-profit').innerHTML = 'Levered Profit: ' + USDFormatter.format(calculationData.calculationData.leveredProfit);
    }
    else {
        document.getElementById('levered-profit').innerHTML = 0;
    }
    if ( Boolean(calculationData.calculationData) && calculationData.calculationData.leveredMoM !== undefined ){
        document.getElementById('levered-mom').innerHTML = 'Levered MoM: ' + (calculationData.calculationData.leveredMoM).toFixed(2) + 'x';
    }
    else {
        document.getElementById('levered-mom').innerHTML = 0;
    }
    if ( Boolean(calculationData.calculationData) && calculationData.calculationData.coc !== undefined ){
        document.getElementById('coc').innerHTML = 'Cash on Cash Return: ' + (calculationData.calculationData.coc).toFixed(2);
    }
    else {
        document.getElementById('coc').innerHTML = 0;
    }
}

// Only on callapsible open at a time;

var coll = document.getElementsByClassName("collapsible");
var i;

for (i = 0; i < coll.length; i++) {
    coll[i].addEventListener("click", function() {
      var content = this.nextElementSibling;
      if (content.style.display === "block") {
        content.style.display = "none";
        this.classList.remove("active");
      } else {
        var coll_content = document.getElementsByClassName("content");
        var j;
        for (j = 0; j < coll_content.length; j++) {
          coll_content[j].style.display = "none";
          coll[j].classList.remove("active");
        }
        content.style.display = "block";
        this.classList.add("active");
      }
    });
}