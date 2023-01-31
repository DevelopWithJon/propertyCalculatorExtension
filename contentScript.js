(() => {
    // chrome.runtime.onMessage.addListener((obj, sender, response) => {
    //     const {
    //         type,
    //         value,
    //         videoId
    //     } = obj;
    //     if (type === "NEW") {
    //         window.addEventListener('load', function() {
    //             run();
    //         });
    //     }

    // });

    chrome.runtime.onMessage.addListener((obj, sender, response) => {
        const {
            from,
            form,
            videoId
        } = obj;

        if (from === "pop-up-form") {
            run(form);
        };
    });

    const run = async (formMap) => {
        let propertyFeatureMap = {};
        let propertyEstimateMap = {};
        let calculationMap = {};
        let estimateRentResponse;
        let mortgageRateResponse;

        await new Promise(resolve => setTimeout(resolve, 1000));

        // open monthly esitmator section
        if (!Boolean(document.getElementsByClassName("mortgage-components__sc-a5j82d-4 cXbDRQ")) || document.getElementsByClassName("mortgage-components__sc-a5j82d-4 cXbDRQ").length === 0){
            if (!document.querySelectorAll('[role="button"]')[2].getAttribute("omtag") || document.querySelectorAll('[role="button"]')[2].getAttribute("omtag") !== null){
                sectionHead = document.querySelectorAll('[role="button"]')[2]
                await sectionHead.click();
                await sectionHead.focus();
                while (!Boolean(document.getElementsByClassName("mortgage-components__sc-a5j82d-4 cXbDRQ")) || document.getElementsByClassName("mortgage-components__sc-a5j82d-4 cXbDRQ").length === 0){
                    await new Promise(resolve => setTimeout(resolve, 100));
                }
                await sectionHead.click();
            }
            else{
                sectionHead = document.querySelectorAll('[role="button"]')[2]
                const sectionPos = parseInt(sectionHead.offsetTop) - parseInt(sectionHead.offsetHeight)
                window.scrollTo(0, sectionPos);
                while (!Boolean(document.getElementsByClassName("mortgage-components__sc-a5j82d-4 cXbDRQ")) || document.getElementsByClassName("mortgage-components__sc-a5j82d-4 cXbDRQ").length === 0){
                    await new Promise(resolve => setTimeout(resolve, 100));
                }
            }
        }
        window.scrollTo(0, 0);

        const featureItems = document.getElementsByClassName("Text__StyledText-rui__sc-19ei9fn-0 dEYYQ TypeInfo__StyledInfo-rui__m9gzjc-0 dvUWaJ feature-item");
        for (let j = 0; j < featureItems.length; j++) {
            const foundFeature = findFeature(featureItems[j].innerHTML)
            if (foundFeature && foundFeature.length > 0) {
                let [k, v] = foundFeature;
                propertyFeatureMap[k] = v;
            }
        }
        propertyFundamentalsMap = await scrapeFundamentals();
        propertyEstimateMap = localEstimates();

        const bedrooms = rankBedrooms(propertyFeatureMap);
        const bathrooms = rankBathrooms(propertyFeatureMap);

        do {
            await estimateRentRequest(propertyFundamentalsMap["address"]["fullAddress"], bedrooms, bathrooms);
            estimateRentResponse = await chrome.storage.local.get("data");
        }
        while (estimateRentResponse === undefined || !estimateRentResponse || Object.keys(estimateRentResponse).length === 0)
        const estimateRentMean = parseFloat(estimateRentResponse.data.mean)
    
        // const estimateRentMean = 2000;

        do {
            console.log("attampting mortgage req...")
            await mortgageRateRequest();
            mortgageRateResponse = await chrome.storage.local.get("json");
        }
        while (mortgageRateResponse === undefined || !mortgageRateResponse || Object.keys(mortgageRateResponse).length === 0)

        mortgageRate = parseFloat(mortgageRateResponse.json.observations[0].value);

        console.log("property features:", propertyFeatureMap)
        if (formMap) {
            propertyFeatureMap["expenseGrowth"] = Boolean(formMap["Expense Growth"]) ? formMap["Expense Growth"] / 100 : .02;
            propertyFeatureMap["revenueGrowth"] = Boolean(formMap["Revenue Growth"]) ? formMap["Revenue Growth"] / 100 : .03;
            propertyFeatureMap["Insurance"] = Boolean(formMap["Insurance"]) ? formMap["Insurance"] : parseFloat(propertyEstimateMap['Home Insurance'].replace(/[^0-9.-]+/g, "")) * 12;
            propertyFeatureMap["Water"] = Boolean(formMap["Water"]) ? formMap["Water"] : 100;
            propertyFeatureMap["Gas"] = Boolean(formMap["Gas"]) ? formMap["Gas"] : 100;
            propertyFeatureMap["Electricity"] = Boolean(formMap["Electricity"]) ? formMap["Electricity"] : 100;
            propertyFeatureMap["capitalEx"] = Boolean(formMap["capitalEx"]) ? formMap["capitalEx"] : 0;
            propertyFeatureMap["Utilities"] = Boolean(formMap["Utilities"]) ? formMap["Utilities"] : 0;
            propertyFeatureMap["Management"] = Boolean(formMap["Management"]) ? formMap["Management"] : 0;
            propertyFeatureMap["Disposition"] = Boolean(formMap["Disposition"]) ? formMap["Disposition"] : 10;
            propertyFeatureMap["financingLTV"] = Boolean(formMap["Financing LTV"]) ? formMap["Financing LTV"] : 70.0;
            propertyFeatureMap["revenue"] = estimateRentMean * 12;
            propertyFeatureMap["mortgageRate"] = mortgageRate / 100;
            propertyFeatureMap["vacancy"] = Boolean(formMap["Vacancy"]) ? formMap["Vacancy"] / 100 : .0625;
            propertyFeatureMap["salesCost"] = 0.05;
            propertyFeatureMap["exitCap"] = 0.07;
        }

        calc = new Calculator(propertyFeatureMap, propertyFundamentalsMap);
        console.log("Insurance:", calc.calculateAllInsurance());
        console.log("Balloon:", calc.calculateAllBalloon());
        console.log("Unlevered Cash Flow:", calc.calculateUnleveredCashFlow())
        console.log("total payment:", calc.calculateAllTotalLoanPayment())
        console.log("Levered Cash Flow:", calc.calculateLeveredCashFlow())
        console.log("COC:", calc.calculateAllCOC());
        console.log("DSCR:", calc.calculateAllDSCR());
        console.log("Debt Yield:", calc.calculateAllDebtYield());
        console.log("capex:", calc.calculateAllCapitalEx());
        console.log("Ending Balance:", calc.calculateAllEndingBalance());
        console.log("NOI:", calc.calculateAllNOI());
        console.log("NetDeposit:", calc.calculateAllNetDepositionProceeds());
        console.log("levered IRR:", calc.calculateLeveredIRR());
        console.log("leveredCF:", calc.calculateAllleveredCFGrowth());
        console.log("unleveredMoM", calc.calculateUnleveredMoM());
        console.log("Revenue", calc.calculateAllRevenue());
        console.log("Vacancy", calc.calculateAllVacancy());
        console.log("Totalex", calc.calculateAllTotalExpenses());
        console.log("TotalCost", calc.calculateAllTotalLoanPayment());

        calculationMap["capRate"] = calc.calculateYearOneCap()
        calculationMap["leveredProfit"] = calc.calculateleveredProfit();
        calculationMap["leveredMoM"] = calc.calculateleveredMoM();
        calculationMap["coc"] = calc.calculateAllCOC();
        pushToPop(calculationMap);
    }

    const pushToPop = async (calculationMap) => {
        response = await chrome.runtime.sendMessage({
            "from": "content",
            "subject": "calculation data",
            "data": calculationMap
        }, function(innerResponse) {
            console.log(innerResponse);
        });
    }

    function isNumeric(str) {
        if (typeof str != "string") return false // we only process strings!  
        return !isNaN(str) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
            !isNaN(parseFloat(str)) // ...and ensure strings of whitespace fail
    }
    const localEstimates = () => {
        const estimateMap = {};
        const monthlyEsitmates = document.getElementsByClassName("mortgage-components__sc-a5j82d-4 cXbDRQ");
        for (let i = 0; i < 5; i++) { // 5 keys and 5 values
            if (Boolean(monthlyEsitmates) && !isNumeric(monthlyEsitmates[i].innerText)) {
                estimateMap[monthlyEsitmates[i].innerText] = 0;
            }
        }
        for (let j = 0; j + 5 < 11; j++) {
            if (j + 5 < monthlyEsitmates.length) {
                estimateMap[monthlyEsitmates[j].innerText] = monthlyEsitmates[j + 5].innerText
            }
        }
        console.log(estimateMap);
        return estimateMap;
    }
    const rankBedrooms = (propertyFeatureMap) => {
        let bedrooms = 1;
        let beds = 1;

        if (propertyFeatureMap["Bedrooms"] !== undefined) {
            bedrooms = propertyFeatureMap["Bedrooms"]
        }
        if (propertyFeatureMap["Beds"] !== undefined) {
            beds = propertyFeatureMap["Beds"]
        }
        return Math.max(bedrooms, beds);
    }

    const rankBathrooms = (propertyFeatureMap) => {
        let totalBathrooms = 1
        let bathrooms = 1
        let fullBathrooms = 1

        if (propertyFeatureMap["Total Bathrooms"] !== undefined) {
            totalBathrooms = propertyFeatureMap["Total Bathrooms"]
        }
        if (propertyFeatureMap["Bathrooms"] !== undefined) {
            bathrooms = propertyFeatureMap["Bathrooms"]
        }
        if (propertyFeatureMap["Full Bathrooms"] !== undefined) {
            fullBathrooms = propertyFeatureMap["Full Bathrooms"]
        }
        return Math.max(totalBathrooms, bathrooms, fullBathrooms);
    }

    const scrapeFundamentals = async () => {
        // scrape fundamentals data
        let timeOnSite = "";
        let salesStatus = "";
        let fullAddress = "";
        let listingPrice = "";
        let sqft = "";
        let fundamentalsObj = {};
        let listingInd;

        listingPrice = document.getElementsByClassName("Price__Component-rui__x3geed-0 gipzbd").length > 0 ? document.getElementsByClassName("Price__Component-rui__x3geed-0 gipzbd")[0].textContent : "";
        salesStatus = document.getElementsByClassName("jsx-3853574337 statusText ldpPage").length > 0 ? document.getElementsByClassName("jsx-3853574337 statusText ldpPage")[0].textContent : "";
        fullAddress = document.getElementsByClassName("Text__StyledText-rui__sc-19ei9fn-0 dEYYQ TypeBody__StyledBody-rui__sc-163o7f1-0 gVxVge").length > 0 ? document.getElementsByClassName("Text__StyledText-rui__sc-19ei9fn-0 dEYYQ TypeBody__StyledBody-rui__sc-163o7f1-0 gVxVge")[0].textContent : "";
        listingInd = document.getElementsByClassName("jsx-3639022186")[0].getElementsByClassName("Text__StyledText-rui__sc-19ei9fn-0 eXfzyb TypeBody__StyledBody-rui__sc-163o7f1-0 gVxVge");

        for (let i = 0; i < listingInd.length; i++) {
            if (listingInd[i].textContent.includes("Days") || listingInd[i].textContent.includes("Hours") || listingInd[i].textContent.includes("Minutes")) {
                timeOnSite = listingInd[i].textContent;
            }
        }
        var propertyMetaData = document.getElementsByClassName("VisuallyHiddenstyles__StyledVisuallyHidden-rui__aoql8k-0 jvgWzM");

        const regex = /\d+\ssquare\sfeet/;
        for (let i = 0; i < propertyMetaData.length; i++) {
            if (regex.test(propertyMetaData[i].innerText)) {
                sqft = propertyMetaData[i].innerText;
            }
        }

        fundamentalsObj["timeOnSite"] = timeOnSite;
        fundamentalsObj["salesStatus"] = salesStatus;
        fundamentalsObj["address"] = splitAddress(fullAddress);
        fundamentalsObj["listingPrice"] = listingPrice;
        fundamentalsObj["sqft"] = sqft;

        return fundamentalsObj;
    }

    const splitAddress = (fullAddress) => {
        let streetAddress = "";
        let city = "";
        let state = "";
        let zip = "";
        let addressObj = {};

        [streetAddress, city, remainder] = fullAddress.split(",");
        [state, zip] = remainder.trim().split(" ");

        addressObj["fullAddress"] = fullAddress;
        addressObj["streetAddress"] = streetAddress;
        addressObj["city"] = city.trim();
        addressObj["state"] = convertState(state);
        addressObj["zip"] = zip;

        return addressObj;
    }

    const convertState = (state) => {
        // Convert abbreviated state to fill state name;
        stateAbbrevMap = {
            "AL": "Alabama",
            "AK": "Alaska",
            "AZ": "Arizona",
            "AR": "Arkansas",
            "CA": "California",
            "CO": "Colorado",
            "CT": "Connecticut",
            "DE": "Delaware",
            "FL": "Florida",
            "GA": "Georgia",
            "HI": "Hawaii",
            "ID": "Idaho",
            "IL": "Illinois",
            "IN": "Indiana",
            "IA": "Iowa",
            "KS": "Kansas",
            "KY": "Kentucky",
            "LA": "Louisiana",
            "ME": "Maine",
            "MD": "Maryland",
            "MA": "Massachusetts",
            "MI": "Michigan",
            "MN": "Minnesota",
            "MS": "Mississippi",
            "MO": "Missouri",
            "MT": "Montana",
            "NE": "Nebraska",
            "NV": "Nevada",
            "NH": "New Hampshire",
            "NJ": "New Jersey",
            "NM": "New Mexico",
            "NY": "New York",
            "NC": "North Carolina",
            "ND": "North Dakota",
            "OH": "Ohio",
            "OK": "Oklahoma",
            "OR": "Oregon",
            "PA": "Pennsylvania",
            "RI": "Rhode Island",
            "SC": "South Carolina",
            "SD": "South Dakota",
            "TN": "Tennessee",
            "TX": "Texas",
            "UT": "Utah",
            "VT": "Vermont",
            "VA": "Virginia",
            "WA": "Washington",
            "WV": "West Virginia",
            "WI": "Wisconsin",
            "WY": "Wyoming",
            "DC": "District of Columbia"
        }
        return stateAbbrevMap[state];
    }

    const findFeature = (feature) => {
        const featureArray = [
            "Bedrooms:",
            "Beds:",
            "Total Rooms:",
            "Rooms:",
            "Total Bathrooms:",
            "Bathrooms:",
            "Full Bathrooms:",
            "Association:",
            "Association Fee:",
            "Calculated Total Monthly Association Fees:",
            "Association Fee Frequency:",
            "Annual Tax Amount:",
            "County:",
            "Source Listing Status:",
            "Property Subtype:",
            "Year Built:",
            "Property Age:",
            "Sewer:",
            "Water Source:",
            "Heating Fuel:",
            "Gross Income:",
            "Operating Expense:",
            "Heating Features:",
            "Electric:",
            "Electric Expense:",
            "Water Sewer Expense:",
            "Net Operating Income:",
            "Insurance Expense:",
            "Trash Expense:",
            "Number of Units:",
            "Unit Type:"
        ]
        let re;

        for (let i = 0; i < featureArray.length; i++) {
            re = new RegExp("^" + featureArray[i] + "(.*)");
            const match = feature.match(re);
            if (match) {
                return [featureArray[i].slice(0, -1), match[1].trim()];
            }
        }
    }

    const getDate = () => {

        var today = new Date();
        var weekAgo = new Date();
        weekAgo.setDate(today.getDate() - 7);

        var tdd = String(today.getDate()).padStart(2, '0');
        var tmm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
        var tyyyy = today.getFullYear();

        var wdd = String(weekAgo.getDate()).padStart(2, '0');
        var wmm = String(weekAgo.getMonth() + 1).padStart(2, '0'); //January is 0!
        var wyyyy = weekAgo.getFullYear();


        const todayString = tyyyy + '-' + tmm + '-' + tdd;
        const weekAgoString = wyyyy + '-' + wmm + '-' + wdd;

        return [todayString, weekAgoString];
    }

    const formatString = (formatted, arguments) => {
        for (var arg in arguments) {
            formatted = formatted.replace("{" + arg + "}", arguments[arg]);
        }
        return formatted;
    };

    const estimateRentRequest = async (fullAddress, bedrooms, bathrooms) => {
        let bedroomsValue = parseFloat(bedrooms);
        let bathroomsValue = parseFloat(bathrooms);

        if (bedroomsValue > 4) {
            bedroomsValue = "4";
        } else if (!bedroomsValue || bedroomsValue < 0) {
            bedroomsValue = "0";
        } else {
            bathroomsValue = bathroomsValue.toString()
        }
        if (bathroomsValue > 1) {
            bathroomsValue = "1.5%2B";
        } else if (!bathroomsValue || bathroomsValue < 0) {
            bathroomsValue = "0";
        } else {
            bathroomsValue = bathroomsValue.toString()
        }
        // const API_KEY = "Is_BA8CFa3prenZvzW7Q_Q";
        const API_KEY = "JVps1Nnz_UJBCPu5_rr5dg";
        const url = formatString("https://www.rentometer.com/api/v1/summary?api_key={0}&address={1}&bedrooms={2}&baths={3}&building_type=house", [API_KEY, fullAddress, bedroomsValue, bathroomsValue])

        response = await chrome.runtime.sendMessage({
            "from": "content",
            "subject": "estimate rent requests",
            "url": url
        }, function(innerResponse) {
            console.log(innerResponse);
        });
    };
    const mortgageRateRequest = async () => {
        let [today, weekAgo] = getDate();

        const url = formatString("https://api.stlouisfed.org/fred/series/observations?series_id=MORTGAGE30US&observation_start={0}&observation_end={1}&api_key=600f4c6e14418ed1524f7668f71794a9&sort_order=desc&limit=1&file_type=json", [weekAgo, today]);
        response = await chrome.runtime.sendMessage({
            "from": "content",
            "subject": "mortgage rate requests",
            "url": url
        }, function(innerResponse) {
            console.log(innerResponse);
        });
    };

    const propertyTaxRequest = (state) => {
        const url = formatString("https://smartasset.com/taxes/{0}-property-tax-calculator", [state]);
    }

    const IRR = (values, guess) => {
        // Credits: algorithm inspired by Apache OpenOffice

        // Calculates the resulting amount
        var irrResult = function(values, dates, rate) {
            var r = rate + 1;
            var result = values[0];
            for (var i = 1; i < values.length; i++) {
                result += values[i] / Math.pow(r, (dates[i] - dates[0]) / 365);
            }
            return result;
        }

        // Calculates the first derivation
        var irrResultDeriv = function(values, dates, rate) {
            var r = rate + 1;
            var result = 0;
            for (var i = 1; i < values.length; i++) {
                var frac = (dates[i] - dates[0]) / 365;
                result -= frac * values[i] / Math.pow(r, frac + 1);
            }
            return result;
        }

        // Initialize dates and check that values contains at least one positive value and one negative value
        var dates = [];
        var positive = false;
        var negative = false;
        for (var i = 0; i < values.length; i++) {
            dates[i] = (i === 0) ? 0 : dates[i - 1] + 365;
            if (values[i] > 0) positive = true;
            if (values[i] < 0) negative = true;
        }

        // Return error if values does not contain at least one positive value and one negative value
        if (!positive || !negative) return '#NUM!';

        // Initialize guess and resultRate
        var guess = (typeof guess === 'undefined') ? 0.1 : guess;
        var resultRate = guess;

        // Set maximum epsilon for end of iteration
        var epsMax = 1e-10;

        // Set maximum number of iterations
        var iterMax = 50;

        // Implement Newton's method
        var newRate, epsRate, resultValue;
        var iteration = 0;
        var contLoop = true;
        do {
            resultValue = irrResult(values, dates, resultRate);
            newRate = resultRate - resultValue / irrResultDeriv(values, dates, resultRate);
            epsRate = Math.abs(newRate - resultRate);
            resultRate = newRate;
            contLoop = (epsRate > epsMax) && (Math.abs(resultValue) > epsMax);
        } while (contLoop && (++iteration < iterMax));

        if (contLoop) return '#NUM!';

        // Return internal rate of return
        return resultRate;
    }
    class Calculator {
        constructor(propertyFeatureMap, propertyFundamentalsMap) {
            this.propertyFeatureMap = propertyFeatureMap;
            this.propertyFundamentalsMap = propertyFundamentalsMap;
        }

        calculateAllTax() {
            let taxValue = parseFloat(this.propertyFeatureMap["Annual Tax Amount"]);
            if (taxValue) {
                const expenseGrowth = this.propertyFeatureMap["expenseGrowth"];
                let i = 9;
                const taxArray = [];
                taxArray.push(taxValue);

                do {
                    taxValue = Math.round(taxValue * (1 + expenseGrowth));
                    taxArray.push(taxValue);
                    i--;
                }
                while (i > 0);
                return taxArray;
            }
            return [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        }
        calculateAllInsurance() {
            let insuranceValue = parseFloat(this.propertyFeatureMap["Insurance"]);
            if (insuranceValue) {
                const expenseGrowth = this.propertyFeatureMap["expenseGrowth"];
                let i = 9;
                const insuranceArray = [];
                insuranceArray.push(insuranceValue);

                do {
                    insuranceValue = parseFloat(Math.round(insuranceValue * (1 + expenseGrowth)));
                    insuranceArray.push(insuranceValue);
                    i--;
                }
                while (i > 0);
                return insuranceArray;
            }
            return [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        }

        calculateAllWater() {
            let waterValue = parseFloat(this.propertyFeatureMap["Water"]);
            if (waterValue) {
                const expenseGrowth = this.propertyFeatureMap["expenseGrowth"];
                let i = 9;
                const waterArray = [];
                waterArray.push(waterValue);

                do {
                    waterValue = Math.round(waterValue * (1 + expenseGrowth));
                    waterArray.push(waterValue);
                    i--;
                }
                while (i > 0);
                return waterArray;
            }
            return [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        }

        calculateAllElectricity() {
            let electricityValue = parseFloat(this.propertyFeatureMap["Electricity"]);
            if (electricityValue) {
                const expenseGrowth = this.propertyFeatureMap["expenseGrowth"];
                let i = 9;
                const electricityArray = [];
                electricityArray.push(electricityValue);

                do {
                    electricityValue = Math.round(electricityValue * (1 + expenseGrowth));
                    electricityArray.push(electricityValue);
                    i--;
                }
                while (i > 0);
                return electricityArray;
            }
            return [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        }

        calculateAllRM() {
            let rmValue = parseFloat(this.propertyFeatureMap["RM"]);
            if (rmValue) {
                const expenseGrowth = this.propertyFeatureMap["expenseGrowth"];
                let i = 9;
                const rmArray = [];
                rmArray.push(rmValue);

                do {
                    rmValue = Math.round(rmValue * (1 + expenseGrowth));
                    rmArray.push(rmValue);
                    i--;
                }
                while (i > 0);
                return rmArray;
            }
            return [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        }

        calculateAllVacancy() {
            let revenueValue = parseFloat(this.propertyFeatureMap["revenue"]);
            let vacancyValue = revenueValue * parseFloat(this.propertyFeatureMap["vacancy"]);
            if (vacancyValue) {
                let i = 9;
                const vacancyArray = [];
                vacancyArray.push(vacancyValue);

                do {
                    vacancyArray.push(vacancyValue);
                    i--;
                }
                while (i > 0);
                return vacancyArray;
            }
            return [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        }

        calculateAllRevenue() {
            let revenueValue = parseFloat(this.propertyFeatureMap["revenue"]);
            if (revenueValue) {
                const revenueGrowth = this.propertyFeatureMap["revenueGrowth"];
                let i = 9;
                const revenueArray = [];
                revenueArray.push(revenueValue);

                do {
                    revenueValue = Math.round(revenueValue * (1 + revenueGrowth));
                    revenueArray.push(revenueValue);
                    i--;
                }
                while (i > 0);
                return revenueArray;

            }
            return [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        }

        calculateAllManagement() {

            let managementValue = parseFloat(this.propertyFeatureMap["Management"]);
            if (managementValue) {

                const expenseGrowth = this.propertyFeatureMap["expenseGrowth"];
                let i = 9;
                const managementArray = [];
                managementArray.push(managementValue);

                do {
                    managementValue = Math.round(managementValue * (1 + expenseGrowth));
                    managementArray.push(managementValue);
                    i--;
                }
                while (i > 0);
                return managementArray;
            }
            return [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        }

        calculateAllHOA() {
            let hoaValue = parseFloat(this.propertyFeatureMap["Calculated Total Monthly Association Fees"]);
            if (hoaValue) {
                hoaValue = hoaValue * 12;
                const expenseGrowth = this.propertyFeatureMap["expenseGrowth"];
                let i = 9;
                const hoaArray = [];
                hoaArray.push(hoaValue);

                do {
                    hoaValue = Math.round(hoaValue * (1 + expenseGrowth));
                    hoaArray.push(hoaValue);
                    i--;
                }
                while (i > 0);
                return hoaArray;
            }
            return [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        }

        calculateAllUtilities() {
            let utilitiesValue = parseFloat(this.propertyFeatureMap["Utilities"]);
            if (utilitiesValue) {
                const expenseGrowth = this.propertyFeatureMap["expenseGrowth"];
                let i = 9;
                const utilitiesArray = [];
                utilitiesArray.push(utilitiesValue);

                do {
                    utilitiesValue = Math.round(utilitiesValue * (1 + expenseGrowth));
                    utilitiesArray.push(utilitiesValue);
                    i--;
                }
                while (i > 0);
                return utilitiesArray;
            }
            return [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        }

        calculateAllGas() {
            let gasValue = parseFloat(this.propertyFeatureMap["Gas"]);
            if (gasValue) {
                const expenseGrowth = this.propertyFeatureMap["expenseGrowth"];
                let i = 9;
                const gasArray = [];
                gasArray.push(gasValue);

                do {
                    gasValue = Math.round(gasValue * (1 + expenseGrowth));
                    gasArray.push(gasValue);
                    i--;
                }
                while (i > 0);
                return gasArray;
            }
            return [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        }

        calculateAllCapitalEx() {
            let CapitalExValue = parseFloat(this.propertyFeatureMap["capitalEx"]);
            const expenseGrowth = this.propertyFeatureMap["expenseGrowth"];
            let i = 9;
            const CapitalExArray = [];
            CapitalExArray.push(CapitalExValue);

            do {
                CapitalExValue = Math.round(CapitalExValue * (1 + expenseGrowth));
                CapitalExArray.push(CapitalExValue);
                i--;
            }
            while (i > 0);
            return CapitalExArray;
        }
        calculateAllTotalExpenses() {
            const dispositionYear = 10;

            const taxArray = this.calculateAllTax();
            const insuranceArray = this.calculateAllInsurance();
            const waterArray = this.calculateAllWater();
            const electricityArray = this.calculateAllElectricity();
            const rmArray = this.calculateAllRM();
            const managementArray = this.calculateAllManagement();
            const capexArray = this.calculateAllCapitalEx();
            const gasArray = this.calculateAllGas();
            const hoaArray = this.calculateAllHOA();
            const utilitiesArray = this.calculateAllUtilities();

            const expenseArray = [];
            for (let i = 0; i < dispositionYear; i++) {
                let sumExpenses = Math.round(taxArray[i] +
                    insuranceArray[i] +
                    waterArray[i] +
                    electricityArray[i] +
                    rmArray[i] +
                    managementArray[i] +
                    capexArray[i] +
                    gasArray[i] +
                    hoaArray[i] +
                    utilitiesArray[i]);
                expenseArray.push(sumExpenses)
            }
            return expenseArray;
        }
        calculateLoan() {
            const listingPrice = Number(this.propertyFundamentalsMap["listingPrice"].replace(/[^0-9.-]+/g, ""));
            const financingLTV = this.propertyFeatureMap["financingLTV"] / 100;
            const loanAmount = listingPrice * financingLTV;
            return loanAmount;
        }

        calculateInterest() {
            const loanAmount = this.calculateLoan();
            const mortgageRate = this.propertyFeatureMap["mortgageRate"];
            return loanAmount * mortgageRate;
        }
        calculatePrincipal() {
            const mortgageRate = parseFloat(this.propertyFeatureMap["mortgageRate"]);
            const interest = this.calculateInterest();
            const principalPayment = interest / (Math.pow((1 + mortgageRate), 30) - 1);
            return principalPayment
        }

        calculateAllTotalLoanPayment() {
            const dispositionYear = this.propertyFeatureMap["Disposition"];
            const interestArray = this.calculateAllInterest();
            const principalPaymentsArray = this.calculateAllPrincipal();
            const balloonArray = this.calculateAllBalloon();
            const totalLoanPaymentArray = [];

            for (let i = 0; i < dispositionYear; i++) {
                totalLoanPaymentArray.push(principalPaymentsArray[i] + interestArray[i] + balloonArray[i])
            }
            return totalLoanPaymentArray;
        }

        calculateAllPrincipal() {
            let principalPayment = this.calculatePrincipal();
            const mortgageRate = this.propertyFeatureMap["mortgageRate"];
            let i = 9;
            const principalPaymentArray = [];
            principalPaymentArray.push(principalPayment);
            do {
                principalPayment = principalPayment * (1 + mortgageRate);
                principalPaymentArray.push(principalPayment);
                i--;
            }
            while (i > 0);
            return principalPaymentArray;
        }

        calculateAllInterest() {
            const dispositionYear = this.propertyFeatureMap["Disposition"];
            const initialInterest = this.calculateInterest();
            const initialPrincipalPayment = this.calculatePrincipal();
            let interest = initialInterest;
            const totalLoanPayment = initialInterest + initialPrincipalPayment;
            const principalPaymentArray = this.calculateAllPrincipal();
            const interestArray = [];
            let i = 1;
            interestArray.push(interest);

            do {
                interest = totalLoanPayment - principalPaymentArray[i];
                interestArray.push(interest);
                i++;
            }
            while (i <= dispositionYear);
            return interestArray;
        }

        calculateAllLoanBalance() {
            let loanValue = this.calculateLoan();
            const dispositionYear = this.propertyFeatureMap["Disposition"];
            const loanBalanceArray = [];
            const principalPaymentArray = this.calculateAllPrincipal();
            let i = 1;
            loanBalanceArray.push(loanValue);

            do {
                loanValue = loanValue - principalPaymentArray[i];
                loanBalanceArray.push(loanValue);
                i++;
            }
            while (i <= dispositionYear);
            return loanBalanceArray;
        }

        calculateAllBalloon() {
            const balloonArray = [];
            const dispositionYear = this.propertyFeatureMap["Disposition"];
            const loanBalanceArray = this.calculateAllLoanBalance();
            const principalPaymentArray = this.calculateAllPrincipal();
            let i = 1;
            do {
                balloonArray.push(0)
                i++;
            }
            while (i <= dispositionYear - 1);

            balloonArray.push(loanBalanceArray[dispositionYear - 1] - principalPaymentArray[dispositionYear - 1]);
            return balloonArray;

        }

        calculateAllEndingBalance() {
            const dispositionYear = this.propertyFeatureMap["Disposition"];
            const loanBalanceArray = this.calculateAllLoanBalance();
            const principalPaymentArray = this.calculateAllPrincipal();
            const balloonArray = this.calculateAllBalloon();
            const endingBalanceArray = [];
            let endingBalanceValue = 0;
            let i = 0;
            do {
                endingBalanceValue = loanBalanceArray[i] + principalPaymentArray[i] + balloonArray[i];
                endingBalanceArray.push(endingBalanceValue);
                i++;
            }
            while (i < dispositionYear);
            endingBalanceArray.push(0);
            return endingBalanceArray;
        }

        calculateAllNOI() {
            const dispositionYear = this.propertyFeatureMap["Disposition"];
            const totalExpenseArray = this.calculateAllTotalExpenses();
            const revenueArray = this.calculateAllRevenue();
            const vacancyArray = this.calculateAllVacancy();
            const noiArray = [];

            for (let i = 0; i < dispositionYear; i++) {
                let noi = revenueArray[i] -
                    totalExpenseArray[i] -
                    vacancyArray[i];
                noiArray.push(noi)
            }
            return noiArray;
        }

        calculateAllNOIMargin() {
            const dispositionYear = this.propertyFeatureMap["Disposition"];
            const noiArray = this.calculateAllNOI();
            const revenueArray = this.calculateAllRevenue();
            const noiMarginArray = [];
            for (let i = 0; i < dispositionYear; i++) {
                let noiMargin = noiArray[i] / revenueArray[i];
                noiMarginArray.push(noiMargin);
            }
            return noiMarginArray;
        }

        calculateAllNetDepositionProceeds() {
            const noiArray = this.calculateAllNOI();
            const exitCapValue = this.propertyFeatureMap["exitCap"];
            const salesCostValue = this.propertyFeatureMap["salesCost"];
            const NetDepositionProceedValue = noiArray[noiArray.length - 1] / exitCapValue * (1 - salesCostValue)
            return [0, 0, 0, 0, 0, 0, 0, 0, 0, NetDepositionProceedValue]
        }

        calculateYearOneCap() {
            const noiArray = this.calculateAllNOI();
            const listingPrice = Number(this.propertyFundamentalsMap["listingPrice"].replace(/[^0-9.-]+/g, ""));
            return noiArray[0] / listingPrice;
        }

        calculateUnleveredCashFlow() {
            const dispositionYear = this.propertyFeatureMap["Disposition"];
            const noiArray = this.calculateAllNOI();
            const listingPrice = Number(this.propertyFundamentalsMap["listingPrice"].replace(/[^0-9.-]+/g, ""));
            const netDepositionProceedArray = this.calculateAllNetDepositionProceeds();
            const unleveredCashFlowArray = [];
            unleveredCashFlowArray.push(listingPrice * -1)
            for (let i = 0; i < dispositionYear; i++) {
                unleveredCashFlowArray.push(noiArray[i] + netDepositionProceedArray[i]);
            }
            return unleveredCashFlowArray;
        }
        calculateUnleveredIRR() {
            const unleveredCashFlowArray = this.calculateUnleveredCashFlow();
            return IRR(unleveredCashFlowArray);
        }
        calculateUnleveredProfit() {
            const unleveredCashFlowArray = this.calculateUnleveredCashFlow();
            const unleveredProfit = unleveredCashFlowArray.reduce((partialSum, a) => partialSum + a, 0);
            return unleveredProfit;
        }
        calculateUnleveredMoM() {
            const unleveredCashFlowArray = this.calculateUnleveredCashFlow().slice(1);
            const unleveredSum = unleveredCashFlowArray.reduce((partialSum, a) => partialSum + a, 0);
            const initialUnleveredCashFlowValue = this.calculateUnleveredCashFlow()[0]
            const MoM = unleveredSum / (initialUnleveredCashFlowValue * -1)
            return MoM;
        }
        calculateLeveredIRR() {
            const unleveredCashFlowArray = this.calculateLeveredCashFlow();
            return IRR(unleveredCashFlowArray);
        }
        calculateleveredProfit() {
            const leveredCashFlowArray = this.calculateLeveredCashFlow();
            const leveredProfit = leveredCashFlowArray.reduce((partialSum, a) => partialSum + a, 0);
            return leveredProfit;
        }
        calculateleveredMoM() {
            const leveredCashFlowArray = this.calculateLeveredCashFlow().slice(1);
            const leveredSum = leveredCashFlowArray.reduce((partialSum, a) => partialSum + a, 0);
            const initialLeveredCashFlowValue = this.calculateLeveredCashFlow()[0]
            const MoM = leveredSum / (initialLeveredCashFlowValue * -1)
            return MoM;
        }


        calculateLeveredCashFlow() {
            const dispositionYear = this.propertyFeatureMap["Disposition"];
            const unleveredCashFlowArray = this.calculateUnleveredCashFlow();
            const totalLoanPayment = this.calculateAllTotalLoanPayment();
            const leveredCashFlowArray = [];
            let initialUnleveredCashFlowValue = this.calculateUnleveredCashFlow()[0] + this.calculateAllLoanBalance()[0];
            leveredCashFlowArray.push(initialUnleveredCashFlowValue)
            for (let i = 0; i < dispositionYear; i++) {
                leveredCashFlowArray.push(unleveredCashFlowArray[i + 1] - totalLoanPayment[i])
            }
            return leveredCashFlowArray;
        }
        calculateAllCOC() {
            const dispositionYear = this.propertyFeatureMap["Disposition"];
            const leveredCashFlowArray = this.calculateLeveredCashFlow();
            const initialLeveredCashFlowValue = leveredCashFlowArray[0];
            const cocArray = [];
            for (let i = 0; i < dispositionYear; i++) {
                cocArray.push(leveredCashFlowArray[i + 1] / (initialLeveredCashFlowValue * -1))
            }
            return cocArray;
        }
        calculateAllunleveredYield() {
            const dispositionYear = this.propertyFeatureMap["Disposition"];
            const noiArray = this.calculateAllNOI();
            const unleveredCashFlowArray = this.calculateUnleveredCashFlow();
            const initialUnleveredCashFlowValue = unleveredCashFlowArray[0];
            const unleveredYielAdrray = [];
            for (let i = 0; i < dispositionYear; i++) {
                unleveredYielAdrray.push(noiArray[i] / (initialUnleveredCashFlowValue * -1))
            }
            return unleveredYielAdrray;
        }
        calculateAllDSCR() {
            const dispositionYear = this.propertyFeatureMap["Disposition"];
            const totalLoanPaymentArray = this.calculateAllTotalLoanPayment();
            const unleveredCashFlowArray = this.calculateUnleveredCashFlow();
            const dscrArray = [];
            for (let i = 0; i < dispositionYear; i++) {
                dscrArray.push(unleveredCashFlowArray[i + 1] / (totalLoanPaymentArray[i]))
            }
            return dscrArray;
        }

        calculateAllDebtYield() {
            const dispositionYear = this.propertyFeatureMap["Disposition"];
            const unleveredCashFlowArray = this.calculateUnleveredCashFlow();
            const leveredProfit = this.calculateleveredProfit();
            const debtYieldArray = [];
            for (let i = 0; i < dispositionYear; i++) {
                debtYieldArray.push(unleveredCashFlowArray[i + 1] / leveredProfit)
            }
            return debtYieldArray;
        }
        calculateAllNoiGrowth() {
            const dispositionYear = this.propertyFeatureMap["Disposition"];
            const noiArray = this.calculateAllNOI();
            const noiGrowthArray = [];

            noiGrowthArray.push(0);
            for (let i = 1; i < dispositionYear; i++) {
                noiGrowthArray.push((noiArray[i] / noiArray[i - 1]) - 1)
            }
            return noiGrowthArray;
        }

        calculateAllleveredCFGrowth() {
            const dispositionYear = this.propertyFeatureMap["Disposition"];
            const leveredCashFlowArray = this.calculateLeveredCashFlow();
            const leveredCFGrowthArray = [];

            leveredCFGrowthArray.push(0);
            for (let i = 2; i < dispositionYear + 1; i++) {
                leveredCFGrowthArray.push((leveredCashFlowArray[i] / leveredCashFlowArray[i - 1]) - 1)
            }
            return leveredCFGrowthArray;
        }
    }

})();


const getTime = t => {
    var date = new Date(0);
    date.setSeconds(t);

    return date.toISOString().substr(11, 8);
};