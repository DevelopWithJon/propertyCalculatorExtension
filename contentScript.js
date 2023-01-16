(() => {
  chrome.runtime.onMessage.addListener((obj, sender, response) => {
      const {
          type,
          value,
          videoId
      } = obj;

      if (type === "NEW") {
          console.log(document.readyState);
          window.addEventListener('load', function() {
              run();
          });
      }

  });


  const run = async () => {
      let propertyFeatureMap = {};

      await new Promise(resolve => setTimeout(resolve, 2500));
      console.log("scraping..")
      const featureItems = document.getElementsByClassName("Text__StyledText-rui__sc-19ei9fn-0 dEYYQ TypeInfo__StyledInfo-rui__m9gzjc-0 dvUWaJ feature-item");
      for (let j = 0; j < featureItems.length; j++) {
          const foundFeature = findFeature(featureItems[j].innerHTML)
          if (foundFeature && foundFeature.length > 0) {
              let [k, v] = foundFeature;
              propertyFeatureMap[k] = v;
          }
      }
      propertyFundamentalsMap = await scrapeFundamentals();

      await mortgageRateRequest();
      const mortgageRateResponse = await chrome.storage.local.get("data");
      mortgageRate = parseFloat(mortgageRateResponse.data.observations[0].value);

      propertyFeatureMap["mortgageRate"] = mortgageRate;
      propertyFeatureMap["expenseGrowth"] = .02;
      propertyFeatureMap["Insurance"] = 1200;
      propertyFeatureMap["Water"] = 1200;
      propertyFeatureMap["Gas"] = 1200;
      propertyFeatureMap["Electricity"] = 1200;
      propertyFeatureMap["capitalEx"] = 1200;
      propertyFeatureMap["Utilities"] = 1200;
      propertyFeatureMap["Management"] = 0;
      propertyFeatureMap["Disposition"] = 10;
      // const propertyTax = parseFloat(propertyTaxRequest(propertyFundamentalsMap.address.state))
      // propertyFeatureMap["propertyTax"] = propertyTax;

      calc = new Calculator(propertyFeatureMap, propertyFundamentalsMap);
      console.log(calc.calculateAllTax());
      console.log("HOA")
      console.log(calc.calculateAllHOA());
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
          "Trash Expense:"
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

  const mortgageRateRequest = async () => {
      let [today, weekAgo] = getDate();

      const url = formatString("https://api.stlouisfed.org/fred/series/observations?series_id=MORTGAGE30US&observation_start={0}&observation_end={1}&api_key=600f4c6e14418ed1524f7668f71794a9&sort_order=desc&limit=1&file_type=json", [weekAgo, today]);
      response = await chrome.runtime.sendMessage({
          "from": "content",
          "subject": "test",
          "url": url
      }, function(innerResponse) {
          console.log(innerResponse)
      });
  };

  const propertyTaxRequest = (state) => {
      const url = formatString("https://smartasset.com/taxes/{0}-property-tax-calculator", [state]);
  }


  class Calculator {
      constructor(propertyFeatureMap, propertyFundamentalsMap) {
          this.propertyFeatureMap = propertyFeatureMap;
          this.propertyFundamentalsMap = propertyFundamentalsMap;
      }

      calculateAllTax() {
          let taxValue = parseFloat(this.propertyFeatureMap["Annual Tax Amount"]);
          const expenseGrowth = this.propertyFeatureMap["expenseGrowth"];
          let i = 9;
          const taxArray = [];
          taxArray.push(taxValue);

          do {
              taxValue = Math.round(taxValue * (1 + expenseGrowth)).toFixed(2);
              taxArray.push(taxValue);
              i--;
          }
          while (i > 0);
          return taxArray;
      }
      calculateAllInsurance() {

          let insuranceValue = parseFloat(this.propertyFeatureMap["Insurance"]);
          const expenseGrowth = this.propertyFeatureMap["expenseGrowth"];
          let i = 9;
          const insuranceArray = [];
          insuranceArray.push(insuranceValue);

          do {
              insuranceArray.push(insuranceValue * (1 + expenseGrowth));
              i--;
          }
          while (i > 0);
          return insuranceArray;
      }

      calculateAllWater() {
          let waterValue = parseFloat(this.propertyFeatureMap["Water"]);
          const expenseGrowth = this.propertyFeatureMap["expenseGrowth"];
          let i = 9;
          const waterArray = [];
          waterArray.push(waterValue);

          do {
              waterArray.push(waterValue * (1 + expenseGrowth));
              i--;
          }
          while (i > 0);
          return waterArray;
      }

      calculateAllElectricity() {
          let electricityValue = parseFloat(this.propertyFeatureMap["Electricity"]);
          const expenseGrowth = this.propertyFeatureMap["expenseGrowth"];
          let i = 9;
          const electricityArray = [];
          electricityArray.push(electricityValue);

          do {
              electricityArray.push(electricityValue * (1 + expenseGrowth));
              i--;
          }
          while (i > 0);
          return electricityArray;
      }

      calculateAllRM() {
          let rmValue = parseFloat(this.propertyFeatureMap["RM"]);
          const expenseGrowth = this.propertyFeatureMap["expenseGrowth"];
          let i = 9;
          const rmArray = [];
          rmArray.push(rmValue);

          do {
              rmArray.push(rmValue * (1 + expenseGrowth));
              i--;
          }
          while (i > 0);
          return rmArray;
      }

      calculateAllVacancy() {
          let revenueValue = parseFloat(this.propertyFeatureMap["Revenue"]);
          let vacancyValue = revenueValue - parseFloat(this.propertyFeatureMap["vacancy"]);

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

      calculateAllRevenue() {
          let revenueValue = parseFloat(this.propertyFeatureMap["Revenue"]);
          const expenseGrowth = this.propertyFeatureMap["expenseGrowth"];
          let i = 9;
          const revenueArray = [];
          revenueArray.push(revenueValue);

          do {
              revenueArray.push(revenueValue * (1 + expenseGrowth));
              i--;
          }
          while (i > 0);
          return revenueArray;
      }

      calculateAllManagement() {
          let managementValue = parseFloat(this.propertyFeatureMap["Management"]);
          const expenseGrowth = this.propertyFeatureMap["expenseGrowth"];
          let i = 9;
          const managementArray = [];
          managementArray.push(managementValue);

          do {
              managementArray.push(managementValue * (1 + expenseGrowth));
              i--;
          }
          while (i > 0);
          return managementArray;
      }

      calculateAllHOA() {
          let hoaValue = parseFloat(this.propertyFeatureMap["Calculated Total Monthly Association Fees"]);
          if (hoaValue){
            hoaValue = hoaValue * 12;
            const expenseGrowth = this.propertyFeatureMap["expenseGrowth"];
            let i = 9;
            const hoaArray = [];
            hoaArray.push(hoaValue);

            do {
                hoaValue = Math.round(hoaValue * (1 + expenseGrowth))
                hoaArray.push(hoaValue);
                i--;
            }
            while (i > 0);
            return hoaArray;
        }
        return [0,0,0,0,0,0,0,0,0,0];
      }

      calculateAllUtilities() {
          let utilitiesValue = parseFloat(this.propertyFeatureMap["Utilities"]);
          const expenseGrowth = this.propertyFeatureMap["expenseGrowth"];
          let i = 9;
          const utilitiesArray = [];
          utilitiesArray.push(utilitiesValue);

          do {
              utilitiesArray.push(utilitiesValue * (1 + expenseGrowth));
              i--;
          }
          while (i > 0);
          return utilitiesArray;
      }

      calculateAllGas() {
          let gasValue = parseFloat(this.propertyFeatureMap["Gas"]);
          const expenseGrowth = this.propertyFeatureMap["expenseGrowth"];
          let i = 9;
          const gasArray = [];
          gasArray.push(gasValue);

          do {
              gasArray.push(gasValue * (1 + expenseGrowth));
              i--;
          }
          while (i > 0);
          return gasArray;
      }

      calculateAllCapitalEx() {
          let CapitalExValue = parseFloat(this.propertyFeatureMap["capitalEx"]);
          const expenseGrowth = this.propertyFeatureMap["expenseGrowth"];
          let i = 9;
          const CapitalExArray = [];
          CapitalExArray.push(CapitalExValue);

          do {
              CapitalExArray.push(CapitalExValue * (1 + expenseGrowth));
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
              let sumExpenses = taxArray[i] +
                  insuranceArray[i] +
                  waterArray[i] +
                  electricityArray[i] +
                  rmArray[i] +
                  managementArray[i] +
                  capexArray[i] +
                  gasArray[i] +
                  hoaArray[i] +
                  utilitiesArray[i];
              expenseArray.push(sumExpenses)
          }
          return expenseArray;
      }
      calculateLoan() {
          const listingPrice = this.propertyFundamentalsMap["listingPrice"];
          const financingLTV = this.propertyFeatureMap["financingLTV"];
          const loanAmount = listingPrice * financingLTV;
          return loanAmount;
      }

      calculateAllNOI() {
          const dispositionYear = 10;
          const totalExpenseArray = this.calculateAllTotalExpenses();
          const revenueArray = this.calculateAllRevenue();
          const vacancyArray = this.calculateAllVacancy();

          const noiArray = [];

          for (let i = 0; i < dispositionYear; i++) {
              let noi = totalExpenseArray[i] +
                  revenueArray +
                  vacancyArray;
                  noiArray.push(noi)
          }
          return noiArray;
      }
  }
  run();

})();


const getTime = t => {
  var date = new Date(0);
  date.setSeconds(t);

  return date.toISOString().substr(11, 8);
};