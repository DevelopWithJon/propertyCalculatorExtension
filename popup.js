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

formMap["Financing LTV"] = ftvValue.value;
formMap["Loan Rate"] = loanRateValue.value;
formMap["Vacancy"] = vacancyValue.value;
formMap["Revenue Growth"] = revenueGrowthValue.value;
formMap["Expense Growth"] = expenseGrowthValue.value;
formMap["Disposition Year"] = dispositionYearValue.value;
formMap["Selling Costs"] = sellingCostValue.value;
formMap["Exit Cap"] = exitCapValue.value;
formMap["Management Fee"] = managementFeeValue.value;

ftvValue.value = 70;


// adding a new bookmark row to the popup




const addNewCalculation = () => {};

const viewCalculations = (currentPropertyData = []) => {
    const calculatorElement = document.getElementById("calculator");
    calculatorElement.innerHTML = "";
    console.log(currentPropertyData);

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
    const queryParameters = activeTab.url.split("?")[1];
    const urlParameters = new URLSearchParams(queryParameters);

    const currentPropertyId = urlParameters.get("property_id");
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
calculatebtn = document.getElementById("Calculator-btn");

calculatebtn.addEventListener("click", function() {
    const [tab] = await chrome.tabs.query({
        active: true,
        lastFocusedWindow: true
    });
    chrome.tabs.sendMessage(
        tab.id, {
            "form": formMap
        }
    )
})