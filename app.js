const state = {
  mode: "woven",
  measurementUnit: "cm",
  currency: "USD",
  exchangeRates: { USD: 1 },
  exchangeDate: "",
  exchangeSource: "fallback",
  fabricWidthCm: 160,
  fabricRatePerMeter: 4.75,
  fabricRatePerKg: 4.75,
  fabrics: [],
  additionalCosts: [
    { name: "Sample development", type: "indirect", unit: "pc", amount: 0.25, notes: "Amortized per garment" }
  ],
  trimsCost: 1.10,
  cmCost: 2.30,
  washCost: 0.55,
  overheadAmount: 8,
  panels: [
    { name: "Shell fabric - front", method: "dimensions", length: 74, width: 58, pieces: 1, allowance: 3, unit: "m2", usage: 0, rate: 4.75 },
    { name: "Shell fabric - back", method: "dimensions", length: 76, width: 58, pieces: 1, allowance: 3, unit: "m2", usage: 0, rate: 4.75 },
    { name: "Shell fabric - sleeves", method: "dimensions", length: 28, width: 42, pieces: 2, allowance: 4, unit: "m2", usage: 0, rate: 4.75 },
    { name: "Neck rib", method: "direct", length: 0, width: 0, pieces: 1, allowance: 5, unit: "m", usage: 0.08, rate: 3.25 }
  ]
};

const els = {
  styleName: document.querySelector("#styleName"),
  styleTitle: document.querySelector("#styleTitle"),
  orderQty: document.querySelector("#orderQty"),
  measurementUnit: document.querySelector("#measurementUnit"),
  fabricWidth: document.querySelector("#fabricWidth"),
  fabricWidthLabel: document.querySelector("#fabricWidthLabel"),
  markerEfficiency: document.querySelector("#markerEfficiency"),
  wastage: document.querySelector("#wastage"),
  fabricRate: document.querySelector("#fabricRate"),
  fabricRateLabel: document.querySelector("#fabricRateLabel"),
  gsm: document.querySelector("#gsm"),
  gsmLabel: document.querySelector("#gsmLabel"),
  currency: document.querySelector("#currency"),
  rateStatus: document.querySelector("#rateStatus"),
  trimsCost: document.querySelector("#trimsCost"),
  cmCost: document.querySelector("#cmCost"),
  washCost: document.querySelector("#washCost"),
  overheadMode: document.querySelector("#overheadMode"),
  overheadLabel: document.querySelector("#overheadLabel"),
  overheadAmountOption: document.querySelector("#overheadAmountOption"),
  overhead: document.querySelector("#overhead"),
  profit: document.querySelector("#profit"),
  panelRows: document.querySelector("#panelRows"),
  rowTemplate: document.querySelector("#panelRowTemplate"),
  fabricRows: document.querySelector("#fabricRows"),
  fabricRowTemplate: document.querySelector("#fabricRowTemplate"),
  additionalFabricRateHeader: document.querySelector("#additionalFabricRateHeader"),
  additionalFabricCostHeader: document.querySelector("#additionalFabricCostHeader"),
  additionalCostRows: document.querySelector("#additionalCostRows"),
  additionalCostRowTemplate: document.querySelector("#additionalCostRowTemplate"),
  costPreset: document.querySelector("#costPreset"),
  additionalCostAmountHeader: document.querySelector("#additionalCostAmountHeader"),
  trimsCostLabel: document.querySelector("#trimsCostLabel"),
  cmCostLabel: document.querySelector("#cmCostLabel"),
  washCostLabel: document.querySelector("#washCostLabel"),
  netArea: document.querySelector("#netArea"),
  consumption: document.querySelector("#consumption"),
  consumptionLabel: document.querySelector("#consumptionLabel"),
  totalFabric: document.querySelector("#totalFabric"),
  fabricCostLabel: document.querySelector("#fabricCostLabel"),
  fabricCost: document.querySelector("#fabricCost"),
  quotedPriceLabel: document.querySelector("#quotedPriceLabel"),
  quotedPrice: document.querySelector("#quotedPrice"),
  orderValue: document.querySelector("#orderValue"),
  techPackInput: document.querySelector("#techPackInput"),
  fileCard: document.querySelector("#fileCard"),
  fileName: document.querySelector("#fileName"),
  fileMeta: document.querySelector("#fileMeta"),
  panelLengthHeader: document.querySelector("#panelLengthHeader"),
  panelWidthHeader: document.querySelector("#panelWidthHeader"),
  panelAreaHeader: document.querySelector("#panelAreaHeader"),
  panelAverageHeader: document.querySelector("#panelAverageHeader"),
  patternRateHeader: document.querySelector("#patternRateHeader"),
  patternCostHeader: document.querySelector("#patternCostHeader"),
  netAreaLabel: document.querySelector("#netAreaLabel"),
  loginScreen: document.querySelector("#loginScreen"),
  loginForm: document.querySelector("#loginForm"),
  loginEmail: document.querySelector("#loginEmail"),
  dashboardView: document.querySelector("#dashboardView"),
  calculatorView: document.querySelector("#calculatorView"),
  savedSheetsList: document.querySelector("#savedSheetsList"),
  sheetSearch: document.querySelector("#sheetSearch"),
  savedSheetCount: document.querySelector("#savedSheetCount"),
  uniqueStyleCount: document.querySelector("#uniqueStyleCount"),
  lastSavedDate: document.querySelector("#lastSavedDate"),
  toast: document.querySelector("#toast"),
  printStyleTitle: document.querySelector("#printStyleTitle"),
  printDate: document.querySelector("#printDate"),
  printCurrency: document.querySelector("#printCurrency")
};

const costPresets = {
  embroidery: { name: "Embroidery", type: "direct", unit: "pc", notes: "Per garment embroidery cost" },
  printing: { name: "Printing", type: "direct", unit: "pc", notes: "Per garment print cost" },
  packing: { name: "Packing", type: "direct", unit: "pc", notes: "Polybag, carton and packing" },
  testing: { name: "Testing / compliance", type: "indirect", unit: "fixed", notes: "Amortized laboratory and compliance cost" },
  freight: { name: "Freight / logistics", type: "indirect", unit: "pc", notes: "Allocated logistics cost" },
  commission: { name: "Commission", type: "indirect", unit: "percent", notes: "Enter converted per-garment amount" },
  development: { name: "Product development", type: "indirect", unit: "fixed", notes: "Amortized sampling and development" },
  other: { name: "Other cost", type: "direct", unit: "pc", notes: "" }
};

let currentUser = "";
let toastTimer;
let duplicateWarningStyle = "";

function isEditableField(field) {
  return field instanceof HTMLTextAreaElement
    || (field instanceof HTMLInputElement && !["file", "hidden", "checkbox", "radio", "button", "submit"].includes(field.type));
}

function configureNumericFields(root = document) {
  const fields = root.matches?.('input[type="number"]') ? [root] : root.querySelectorAll('input[type="number"]');
  fields.forEach((field) => {
    field.type = "text";
    field.inputMode = "decimal";
    field.dataset.numeric = "true";
    field.autocomplete = "off";
  });
}

function markDemoFields(root = document) {
  const fields = root.matches?.("input, textarea") ? [root] : root.querySelectorAll("input, textarea");
  fields.forEach((field) => {
    if (!isEditableField(field) || field.value === "") return;
    field.dataset.demoValue = field.value;
    field.dataset.demoPending = "true";
  });
}

function selectDemoField(field) {
  if (!isEditableField(field) || field.dataset.demoPending !== "true" || field.value !== field.dataset.demoValue) return;

  field.dataset.demoPending = "false";
  setTimeout(() => {
    try {
      field.select();
    } catch {
      // Some browser-managed input types do not expose a selectable text range.
    }
  }, 0);
}

document.addEventListener("focusin", (event) => {
  selectDemoField(event.target);
});

document.addEventListener("click", (event) => {
  selectDemoField(event.target);
});

document.addEventListener("input", (event) => {
  const field = event.target;
  if (!isEditableField(field)) return;
  field.dataset.demoPending = "false";
  if (field.dataset.numeric === "true") {
    const raw = field.value.replace(/[^\d.-]/g, "").replace(/(?!^)-/g, "");
    const [whole, ...fraction] = raw.split(".");
    const cleaned = fraction.length ? `${whole}.${fraction.join("")}` : whole;
    if (cleaned !== field.value) field.value = cleaned;
  }
});

const currencyOptions = [
  ["AED", "UAE Dirham"], ["AFN", "Afghan Afghani"], ["ALL", "Albanian Lek"], ["AMD", "Armenian Dram"],
  ["ANG", "Netherlands Antillean Guilder"], ["AOA", "Angolan Kwanza"], ["ARS", "Argentine Peso"], ["AUD", "Australian Dollar"],
  ["AWG", "Aruban Florin"], ["AZN", "Azerbaijani Manat"], ["BAM", "Bosnia-Herzegovina Convertible Mark"], ["BBD", "Barbadian Dollar"],
  ["BDT", "Bangladeshi Taka"], ["BGN", "Bulgarian Lev"], ["BHD", "Bahraini Dinar"], ["BIF", "Burundian Franc"],
  ["BMD", "Bermudian Dollar"], ["BND", "Brunei Dollar"], ["BOB", "Bolivian Boliviano"], ["BRL", "Brazilian Real"],
  ["BSD", "Bahamian Dollar"], ["BTN", "Bhutanese Ngultrum"], ["BWP", "Botswana Pula"], ["BYN", "Belarusian Ruble"],
  ["BZD", "Belize Dollar"], ["CAD", "Canadian Dollar"], ["CDF", "Congolese Franc"], ["CHF", "Swiss Franc"],
  ["CLP", "Chilean Peso"], ["CNY", "Chinese Yuan"], ["COP", "Colombian Peso"], ["CRC", "Costa Rican Colon"],
  ["CUP", "Cuban Peso"], ["CVE", "Cape Verdean Escudo"], ["CZK", "Czech Koruna"], ["DJF", "Djiboutian Franc"],
  ["DKK", "Danish Krone"], ["DOP", "Dominican Peso"], ["DZD", "Algerian Dinar"], ["EGP", "Egyptian Pound"],
  ["ERN", "Eritrean Nakfa"], ["ETB", "Ethiopian Birr"], ["EUR", "Euro"], ["FJD", "Fijian Dollar"],
  ["FKP", "Falkland Islands Pound"], ["GBP", "British Pound"], ["GEL", "Georgian Lari"], ["GHS", "Ghanaian Cedi"],
  ["GIP", "Gibraltar Pound"], ["GMD", "Gambian Dalasi"], ["GNF", "Guinean Franc"], ["GTQ", "Guatemalan Quetzal"],
  ["GYD", "Guyanese Dollar"], ["HKD", "Hong Kong Dollar"], ["HNL", "Honduran Lempira"], ["HRK", "Croatian Kuna"],
  ["HTG", "Haitian Gourde"], ["HUF", "Hungarian Forint"], ["IDR", "Indonesian Rupiah"], ["ILS", "Israeli New Shekel"],
  ["INR", "Indian Rupee"], ["IQD", "Iraqi Dinar"], ["IRR", "Iranian Rial"], ["ISK", "Icelandic Krona"],
  ["JMD", "Jamaican Dollar"], ["JOD", "Jordanian Dinar"], ["JPY", "Japanese Yen"], ["KES", "Kenyan Shilling"],
  ["KGS", "Kyrgyzstani Som"], ["KHR", "Cambodian Riel"], ["KMF", "Comorian Franc"], ["KRW", "South Korean Won"],
  ["KWD", "Kuwaiti Dinar"], ["KYD", "Cayman Islands Dollar"], ["KZT", "Kazakhstani Tenge"], ["LAK", "Lao Kip"],
  ["LBP", "Lebanese Pound"], ["LKR", "Sri Lankan Rupee"], ["LRD", "Liberian Dollar"], ["LSL", "Lesotho Loti"],
  ["LYD", "Libyan Dinar"], ["MAD", "Moroccan Dirham"], ["MDL", "Moldovan Leu"], ["MGA", "Malagasy Ariary"],
  ["MKD", "Macedonian Denar"], ["MMK", "Myanmar Kyat"], ["MNT", "Mongolian Tugrik"], ["MOP", "Macanese Pataca"],
  ["MRU", "Mauritanian Ouguiya"], ["MUR", "Mauritian Rupee"], ["MVR", "Maldivian Rufiyaa"], ["MWK", "Malawian Kwacha"],
  ["MXN", "Mexican Peso"], ["MYR", "Malaysian Ringgit"], ["MZN", "Mozambican Metical"], ["NAD", "Namibian Dollar"],
  ["NGN", "Nigerian Naira"], ["NIO", "Nicaraguan Cordoba"], ["NOK", "Norwegian Krone"], ["NPR", "Nepalese Rupee"],
  ["NZD", "New Zealand Dollar"], ["OMR", "Omani Rial"], ["PAB", "Panamanian Balboa"], ["PEN", "Peruvian Sol"],
  ["PGK", "Papua New Guinean Kina"], ["PHP", "Philippine Peso"], ["PKR", "Pakistani Rupee"], ["PLN", "Polish Zloty"],
  ["PYG", "Paraguayan Guarani"], ["QAR", "Qatari Riyal"], ["RON", "Romanian Leu"], ["RSD", "Serbian Dinar"],
  ["RUB", "Russian Ruble"], ["RWF", "Rwandan Franc"], ["SAR", "Saudi Riyal"], ["SBD", "Solomon Islands Dollar"],
  ["SCR", "Seychellois Rupee"], ["SDG", "Sudanese Pound"], ["SEK", "Swedish Krona"], ["SGD", "Singapore Dollar"],
  ["SHP", "Saint Helena Pound"], ["SLE", "Sierra Leonean Leone"], ["SOS", "Somali Shilling"], ["SRD", "Surinamese Dollar"],
  ["SSP", "South Sudanese Pound"], ["STN", "Sao Tome and Principe Dobra"], ["SYP", "Syrian Pound"], ["SZL", "Eswatini Lilangeni"],
  ["THB", "Thai Baht"], ["TJS", "Tajikistani Somoni"], ["TMT", "Turkmenistani Manat"], ["TND", "Tunisian Dinar"],
  ["TOP", "Tongan Paanga"], ["TRY", "Turkish Lira"], ["TTD", "Trinidad and Tobago Dollar"], ["TWD", "New Taiwan Dollar"],
  ["TZS", "Tanzanian Shilling"], ["UAH", "Ukrainian Hryvnia"], ["UGX", "Ugandan Shilling"], ["USD", "US Dollar"],
  ["UYU", "Uruguayan Peso"], ["UZS", "Uzbekistani Som"], ["VES", "Venezuelan Bolivar"], ["VND", "Vietnamese Dong"],
  ["VUV", "Vanuatu Vatu"], ["WST", "Samoan Tala"], ["XAF", "Central African CFA Franc"], ["XCD", "East Caribbean Dollar"],
  ["XOF", "West African CFA Franc"], ["XPF", "CFP Franc"], ["YER", "Yemeni Rial"], ["ZAR", "South African Rand"],
  ["ZMW", "Zambian Kwacha"], ["ZWL", "Zimbabwean Dollar"]
];

const units = {
  cm: { label: "cm", name: "Centimetre", toCm: 1, linearOutput: "cm", outputFactor: 1, areaLabel: "cm²", areaFactor: 10000, decimals: 1, areaDecimals: 1 },
  in: { label: "in", name: "Inches", toCm: 2.54, linearOutput: "in", outputFactor: 2.54, areaLabel: "in²", areaFactor: 1550.0031, decimals: 2, areaDecimals: 2 },
  yd: { label: "yd", name: "Yards", toCm: 91.44, linearOutput: "yd", outputFactor: 91.44, areaLabel: "yd²", areaFactor: 1.19599, decimals: 3, areaDecimals: 3 }
};

const num = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

function quoteMoney(value) {
  const converted = value * activeFx();
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: state.currency,
      currencyDisplay: "narrowSymbol",
      maximumFractionDigits: converted >= 1000 ? 0 : 2
    }).format(converted);
  } catch {
    return `${state.currency} ${converted.toFixed(2)}`;
  }
}

const activeUnit = () => units[state.measurementUnit];

const activeFx = () => state.exchangeRates[state.currency] || 1;

const fromCm = (value) => num(value) / activeUnit().toCm;

const toCm = (value) => num(value) * activeUnit().toCm;

const formatMeasurement = (value) => {
  const decimals = activeUnit().decimals;
  return Number(fromCm(value).toFixed(decimals)).toString();
};

function syncFabricWidthFromInput() {
  state.fabricWidthCm = Math.max(0.01, toCm(els.fabricWidth.value));
}

function syncFabricRateFromInput() {
  const rate = num(els.fabricRate.value) / activeFx();
  if (state.mode === "knit") {
    state.fabricRatePerKg = rate;
  } else {
    state.fabricRatePerMeter = rate * (100 / activeUnit().outputFactor);
  }
}

function syncCommercialInputs() {
  const fx = activeFx();
  state.trimsCost = num(els.trimsCost.value) / fx;
  state.cmCost = num(els.cmCost.value) / fx;
  state.washCost = num(els.washCost.value) / fx;
  if (els.overheadMode.value === "amount") {
    state.overheadAmount = num(els.overhead.value) / fx;
  }
}

function formatCurrencyInput(value) {
  return Number((value * activeFx()).toFixed(4)).toString();
}

function renderCommercialInputs() {
  els.trimsCost.value = formatCurrencyInput(state.trimsCost);
  els.cmCost.value = formatCurrencyInput(state.cmCost);
  els.washCost.value = formatCurrencyInput(state.washCost);
  if (els.overheadMode.value === "amount") {
    els.overhead.value = formatCurrencyInput(state.overheadAmount);
  }
}

function formatFabricRate() {
  if (state.mode === "knit") {
    return formatCurrencyInput(state.fabricRatePerKg);
  }
  return formatCurrencyInput(state.fabricRatePerMeter / (100 / activeUnit().outputFactor));
}

function formatLinearConsumption(cmValue) {
  const unit = activeUnit();
  return `${(cmValue / unit.outputFactor).toFixed(unit.decimals)} ${unit.linearOutput}`;
}

function formatArea(m2Value) {
  const unit = activeUnit();
  return `${(m2Value * unit.areaFactor).toFixed(unit.areaDecimals)} ${unit.areaLabel}`;
}

function populateCurrencyOptions() {
  els.currency.innerHTML = "";
  currencyOptions.forEach(([code, name]) => {
    const option = document.createElement("option");
    option.value = code;
    option.textContent = `${code} - ${name}`;
    els.currency.append(option);
  });
  els.currency.value = state.currency;
}

function cacheExchangeRates() {
  localStorage.setItem("garmentCostingExchangeRates", JSON.stringify({
    date: state.exchangeDate,
    rates: state.exchangeRates,
    savedAt: new Date().toISOString(),
    source: state.exchangeSource
  }));
}

function readCachedExchangeRates() {
  try {
    const cached = JSON.parse(localStorage.getItem("garmentCostingExchangeRates") || "null");
    if (cached && cached.rates && cached.rates.USD) {
      state.exchangeRates = cached.rates;
      state.exchangeDate = cached.date || cached.savedAt || "";
      state.exchangeSource = "cached";
      return true;
    }
  } catch {
    return false;
  }
  return false;
}

function updateRateStatus() {
  const code = state.currency;
  const hasRate = Boolean(state.exchangeRates[code]);
  const label = state.exchangeSource === "live" ? "Live" : state.exchangeSource === "cached" ? "Offline cached" : "USD fallback";
  const date = state.exchangeDate ? ` · ${state.exchangeDate}` : "";
  const coverage = hasRate ? "" : ` · ${code} unavailable`;
  els.rateStatus.textContent = `Quote exchange rate: ${label}${date}${coverage}`;
}

async function fetchExchangeRates() {
  const primaryUrl = "https://open.er-api.com/v6/latest/USD";
  const secondaryUrl = "https://api.frankfurter.dev/v1/latest?base=USD";

  try {
    const response = await fetch(primaryUrl, { cache: "no-store" });
    if (!response.ok) throw new Error("Primary rate feed unavailable");
    const data = await response.json();
    if (!data.rates || !data.rates.USD) throw new Error("Primary rate feed returned no rates");
    state.exchangeRates = data.rates;
    state.exchangeDate = data.time_last_update_utc || new Date().toISOString();
    state.exchangeSource = "live";
    cacheExchangeRates();
  } catch {
    try {
      const response = await fetch(secondaryUrl, { cache: "no-store" });
      if (!response.ok) throw new Error("Secondary rate feed unavailable");
      const data = await response.json();
      state.exchangeRates = { USD: 1, ...(data.rates || {}) };
      state.exchangeDate = data.date || new Date().toISOString();
      state.exchangeSource = "live";
      cacheExchangeRates();
    } catch {
      if (!readCachedExchangeRates()) {
        state.exchangeRates = { USD: 1 };
        state.exchangeDate = "";
        state.exchangeSource = "fallback";
      }
    }
  }

  renderCurrencyValues();
}

function panelArea(panel) {
  const base = (num(panel.length) * num(panel.width) * num(panel.pieces)) / 10000;
  return base * (1 + num(panel.allowance) / 100);
}

function panelAverage(panel) {
  return (num(panel.length) * num(panel.width)) / 10000;
}

function panelUsage(panel) {
  if (panel.method === "direct") {
    return num(panel.usage) * Math.max(1, num(panel.pieces, 1)) * (1 + num(panel.allowance) / 100);
  }
  return panelAverage(panel) * Math.max(1, num(panel.pieces, 1)) * (1 + num(panel.allowance) / 100);
}

function panelBaseUsage(panel) {
  if (panel.method === "direct") {
    return num(panel.usage) * Math.max(1, num(panel.pieces, 1));
  }
  return panelAverage(panel) * Math.max(1, num(panel.pieces, 1));
}

function panelLineCost(panel) {
  return panelUsage(panel) * num(panel.rate);
}

function fabricLineCost(fabric) {
  return num(fabric.usage) * (1 + num(fabric.wastage) / 100) * num(fabric.rate);
}

function additionalCostTotal() {
  return state.additionalCosts.reduce((sum, cost) => sum + num(cost.amount), 0);
}

function calculate() {
  syncCommercialInputs();
  const qty = Math.max(1, num(els.orderQty.value, 1));
  const dimensionalArea = state.panels.filter((panel) => panel.method !== "direct").reduce((sum, panel) => sum + panelUsage(panel), 0);
  const directCost = state.panels.filter((panel) => panel.method === "direct").reduce((sum, panel) => sum + panelLineCost(panel), 0);
  const allowanceCost = state.panels.reduce((sum, panel) => sum + (panelUsage(panel) - panelBaseUsage(panel)) * num(panel.rate), 0);
  const fabricCost = state.panels.reduce((sum, panel) => sum + panelLineCost(panel), 0);
  const baseCost = fabricCost + state.trimsCost + state.cmCost + state.washCost + additionalCostTotal();
  const overheadAmount = els.overheadMode.value === "amount" ? state.overheadAmount : baseCost * num(els.overhead.value) / 100;
  const withOverhead = baseCost + overheadAmount;
  const quoted = withOverhead * (1 + num(els.profit.value) / 100);

  els.netArea.textContent = formatArea(dimensionalArea);
  els.consumption.textContent = quoteMoney(directCost);
  els.totalFabric.textContent = quoteMoney(allowanceCost);
  els.fabricCost.textContent = quoteMoney(fabricCost);
  els.quotedPrice.textContent = quoteMoney(quoted);
  els.orderValue.textContent = `Order value: ${quoteMoney(quoted * qty)}`;
  els.styleTitle.textContent = `Style: ${els.styleName.value || "Untitled"}`;
  els.printStyleTitle.textContent = `${els.styleName.value || "Untitled"} Cost Sheet`;
  els.printDate.textContent = `Prepared: ${new Date().toLocaleDateString()}`;
  els.printCurrency.textContent = `Currency: ${state.currency} · Order: ${qty.toLocaleString()} pcs`;

  document.querySelectorAll("#panelRows tr").forEach((row, index) => {
    const panel = state.panels[index];
    row.querySelector(".panel-average").textContent = panel.method === "direct" ? "Direct" : formatArea(panelAverage(panel));
    row.querySelector(".panel-line-cost").textContent = quoteMoney(panelLineCost(panel));
  });
}

function renderPanels() {
  els.panelRows.innerHTML = "";
  state.panels.forEach((panel, index) => {
    const row = els.rowTemplate.content.firstElementChild.cloneNode(true);
    row.classList.toggle("direct-consumption-row", panel.method === "direct");
    row.querySelector(".panel-name").value = panel.name;
    row.querySelector(".panel-method").value = panel.method || "dimensions";
    row.querySelector(".panel-length").value = panel.method === "direct" ? "" : formatMeasurement(panel.length);
    row.querySelector(".panel-width").value = panel.method === "direct" ? "" : formatMeasurement(panel.width);
    row.querySelector(".panel-pieces").value = panel.pieces;
    row.querySelector(".panel-allowance").value = panel.allowance;
    row.querySelector(".panel-unit").value = panel.unit || "m2";
    row.querySelector(".panel-usage").value = panel.method === "direct" ? panel.usage : Number(panelUsage(panel).toFixed(4));
    row.querySelector(".panel-rate").value = formatCurrencyInput(panel.rate);
    row.querySelector(".panel-usage").placeholder = panel.method === "direct" ? "Usage per garment" : "Calculated";
    row.querySelector(".panel-rate").placeholder = "Rate per selected unit";
    row.querySelector(".panel-usage").disabled = panel.method !== "direct";
    row.querySelector(".panel-length").disabled = panel.method === "direct";
    row.querySelector(".panel-width").disabled = panel.method === "direct";
    row.querySelector(".panel-unit").disabled = panel.method !== "direct";

    row.querySelectorAll("input, select").forEach((control) => {
      const update = () => {
        const method = row.querySelector(".panel-method").value;
        state.panels[index] = {
          name: row.querySelector(".panel-name").value,
          method,
          length: toCm(row.querySelector(".panel-length").value),
          width: toCm(row.querySelector(".panel-width").value),
          pieces: num(row.querySelector(".panel-pieces").value, 1),
          allowance: num(row.querySelector(".panel-allowance").value),
          unit: method === "dimensions" ? "m2" : row.querySelector(".panel-unit").value,
          usage: num(row.querySelector(".panel-usage").value),
          rate: num(row.querySelector(".panel-rate").value) / activeFx()
        };
        if (control.classList.contains("panel-method")) {
          renderPanels();
        } else {
          calculate();
          if (method === "dimensions") row.querySelector(".panel-usage").value = Number(panelUsage(state.panels[index]).toFixed(4));
        }
      };
      control.addEventListener("input", update);
      control.addEventListener("change", update);
    });

    row.querySelector(".delete-panel").addEventListener("click", () => {
      state.panels.splice(index, 1);
      renderPanels();
      calculate();
    });

    els.panelRows.append(row);
    configureNumericFields(row);
  });
  calculate();
}

function addPanel(panel = { name: "New panel", length: 20, width: 20, pieces: 1, allowance: 3 }) {
  state.panels.push({ method: "dimensions", unit: "m2", usage: 0, rate: 1, ...panel });
  renderPanels();
  markDemoFields(els.panelRows.lastElementChild);
  els.panelRows.lastElementChild.querySelector(".panel-name").focus();
}

function renderFabrics() {
  els.fabricRows.innerHTML = "";
  state.fabrics.forEach((fabric, index) => {
    const row = els.fabricRowTemplate.content.firstElementChild.cloneNode(true);
    row.querySelector(".fabric-name").value = fabric.name;
    row.querySelector(".fabric-usage").value = fabric.usage;
    row.querySelector(".fabric-unit").value = fabric.unit;
    row.querySelector(".fabric-wastage").value = fabric.wastage;
    row.querySelector(".fabric-rate").value = formatCurrencyInput(fabric.rate);

    row.querySelectorAll("input, select").forEach((control) => {
      control.addEventListener("input", () => {
        state.fabrics[index] = {
          name: row.querySelector(".fabric-name").value,
          usage: num(row.querySelector(".fabric-usage").value),
          unit: row.querySelector(".fabric-unit").value,
          wastage: num(row.querySelector(".fabric-wastage").value),
          rate: num(row.querySelector(".fabric-rate").value) / activeFx()
        };
        calculate();
      });
      control.addEventListener("change", () => calculate());
    });

    row.querySelector(".delete-fabric").addEventListener("click", () => {
      state.fabrics.splice(index, 1);
      renderFabrics();
      calculate();
    });

    els.fabricRows.append(row);
    configureNumericFields(row);
  });
  calculate();
}

function addFabric() {
  state.panels.push({ name: "New direct-use fabric", method: "direct", length: 0, width: 0, pieces: 1, allowance: 5, unit: "m", usage: 0.1, rate: 1 });
  renderPanels();
  markDemoFields(els.panelRows.lastElementChild);
  els.panelRows.lastElementChild.querySelector(".panel-name").focus();
}

function renderAdditionalCosts() {
  els.additionalCostRows.innerHTML = "";
  state.additionalCosts.forEach((cost, index) => {
    const row = els.additionalCostRowTemplate.content.firstElementChild.cloneNode(true);
    row.querySelector(".additional-cost-name").value = cost.name;
    row.querySelector(".additional-cost-type").value = cost.type;
    row.querySelector(".additional-cost-unit").value = cost.unit || "pc";
    row.querySelector(".additional-cost-amount").value = formatCurrencyInput(cost.amount);
    row.querySelector(".additional-cost-notes").value = cost.notes;

    row.querySelectorAll("input, select").forEach((control) => {
      const update = () => {
        state.additionalCosts[index] = {
          name: row.querySelector(".additional-cost-name").value,
          type: row.querySelector(".additional-cost-type").value,
          unit: row.querySelector(".additional-cost-unit").value,
          amount: num(row.querySelector(".additional-cost-amount").value) / activeFx(),
          notes: row.querySelector(".additional-cost-notes").value
        };
        calculate();
      };
      control.addEventListener("input", update);
      control.addEventListener("change", update);
    });

    row.querySelector(".delete-additional-cost").addEventListener("click", () => {
      state.additionalCosts.splice(index, 1);
      renderAdditionalCosts();
      calculate();
    });

    els.additionalCostRows.append(row);
    configureNumericFields(row);
  });
  calculate();
}

function addAdditionalCost() {
  const preset = costPresets[els.costPreset.value] || costPresets.other;
  state.additionalCosts.push({ ...preset, amount: 0 });
  renderAdditionalCosts();
  markDemoFields(els.additionalCostRows.lastElementChild);
  els.additionalCostRows.lastElementChild.querySelector(".additional-cost-amount").focus();
}

function updateOverheadMode() {
  const fixed = els.overheadMode.value === "amount";
  els.overheadLabel.textContent = fixed ? `Overhead amount (${state.currency})` : "Overhead %";
  els.overhead.step = fixed ? "0.01" : "0.01";
  if (fixed) els.overhead.value = formatCurrencyInput(state.overheadAmount);
  calculate();
}

function updateCurrencyLabels() {
  const currency = state.currency;
  els.additionalFabricRateHeader.textContent = `Rate / unit (${currency})`;
  els.additionalFabricCostHeader.textContent = `Cost / garment (${currency})`;
  els.patternRateHeader.textContent = `Rate / unit (${currency})`;
  els.patternCostHeader.textContent = `Cost / garment (${currency})`;
  els.trimsCostLabel.textContent = `Trims / garment (${currency})`;
  els.cmCostLabel.textContent = `CM / garment (${currency})`;
  els.washCostLabel.textContent = `Wash / process (${currency})`;
  els.overheadAmountOption.textContent = `Fixed amount (${currency})`;
  els.overheadLabel.textContent = els.overheadMode.value === "amount" ? `Overhead amount (${currency})` : "Overhead %";
  els.additionalCostAmountHeader.textContent = `Amount / garment (${currency})`;
  els.fabricCostLabel.textContent = `Fabric cost / garment (${currency})`;
  els.quotedPriceLabel.textContent = `Quoted price / garment (${currency})`;
}

function userSheetsKey() {
  return `garmentCostingSheets:${currentUser || "demo"}`;
}

function getSavedSheets() {
  try {
    return JSON.parse(localStorage.getItem(userSheetsKey()) || "[]");
  } catch {
    return [];
  }
}

function setSavedSheets(sheets) {
  localStorage.setItem(userSheetsKey(), JSON.stringify(sheets));
}

function showToast(message) {
  clearTimeout(toastTimer);
  els.toast.textContent = message;
  els.toast.classList.remove("hidden");
  toastTimer = setTimeout(() => els.toast.classList.add("hidden"), 4200);
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  })[character]);
}

function showView(view) {
  els.loginScreen.classList.toggle("hidden", view !== "login");
  els.dashboardView.classList.toggle("hidden", view !== "dashboard");
  els.calculatorView.classList.toggle("hidden", view !== "calculator");
  if (view === "dashboard") renderDashboard();
}

function serializeSheet() {
  return {
    id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
    styleName: els.styleName.value.trim() || "Untitled",
    updatedAt: new Date().toISOString(),
    state: {
      mode: state.mode,
      measurementUnit: state.measurementUnit,
      currency: state.currency,
      fabricWidthCm: state.fabricWidthCm,
      fabricRatePerMeter: state.fabricRatePerMeter,
      fabricRatePerKg: state.fabricRatePerKg,
      trimsCost: state.trimsCost,
      cmCost: state.cmCost,
      washCost: state.washCost,
      overheadAmount: state.overheadAmount,
      panels: structuredClone(state.panels),
      fabrics: structuredClone(state.fabrics),
      additionalCosts: structuredClone(state.additionalCosts)
    },
    inputs: {
      orderQty: els.orderQty.value,
      markerEfficiency: els.markerEfficiency.value,
      wastage: els.wastage.value,
      gsm: els.gsm.value,
      overheadMode: els.overheadMode.value,
      overhead: els.overheadMode.value === "percent" ? els.overhead.value : "",
      profit: els.profit.value
    },
    quote: els.quotedPrice.textContent
  };
}

function saveCurrentSheet() {
  const sheets = getSavedSheets();
  const styleName = els.styleName.value.trim() || "Untitled";
  const existingIndex = sheets.findIndex((sheet) => sheet.styleName.toLowerCase() === styleName.toLowerCase());
  const sheet = serializeSheet();

  if (existingIndex >= 0) {
    sheet.id = sheets[existingIndex].id;
    sheets[existingIndex] = sheet;
    showToast(`Updated existing style "${styleName}".`);
  } else {
    sheets.unshift(sheet);
    showToast(`Saved "${styleName}" to your dashboard.`);
  }

  setSavedSheets(sheets);
}

function loadSheet(id) {
  const sheet = getSavedSheets().find((item) => item.id === id);
  if (!sheet) return;
  Object.assign(state, sheet.state);
  state.panels = (state.panels || []).map((panel) => ({
    method: "dimensions",
    unit: "m2",
    usage: 0,
    rate: 1,
    ...panel
  }));
  if (state.fabrics?.length) {
    state.panels.push(...state.fabrics.map((fabric) => ({
      name: fabric.name,
      method: "direct",
      length: 0,
      width: 0,
      pieces: 1,
      allowance: fabric.wastage,
      unit: fabric.unit,
      usage: fabric.usage,
      rate: fabric.rate
    })));
    state.fabrics = [];
  }
  els.styleName.value = sheet.styleName;
  Object.entries(sheet.inputs).forEach(([key, value]) => {
    if (els[key]) els[key].value = value;
  });
  els.measurementUnit.value = state.measurementUnit;
  els.currency.value = state.currency;
  updateMeasurementLabels();
  renderCommercialInputs();
  renderPanels();
  renderFabrics();
  renderAdditionalCosts();
  updateCurrencyLabels();
  updateOverheadMode();
  showView("calculator");
  showToast(`Loaded "${sheet.styleName}".`);
}

function deleteSheet(id) {
  setSavedSheets(getSavedSheets().filter((sheet) => sheet.id !== id));
  renderDashboard();
}

function renderDashboard() {
  const query = els.sheetSearch.value.trim().toLowerCase();
  const sheets = getSavedSheets();
  const visibleSheets = sheets.filter((sheet) => sheet.styleName.toLowerCase().includes(query));
  els.savedSheetCount.textContent = sheets.length;
  els.uniqueStyleCount.textContent = new Set(sheets.map((sheet) => sheet.styleName.toLowerCase())).size;
  els.lastSavedDate.textContent = sheets[0] ? new Date(sheets[0].updatedAt).toLocaleDateString() : "No sheets yet";
  els.savedSheetsList.innerHTML = "";

  if (!visibleSheets.length) {
    els.savedSheetsList.innerHTML = '<div class="empty-state">No saved cost sheets found.</div>';
    return;
  }

  visibleSheets.forEach((sheet) => {
    const row = document.createElement("article");
    row.className = "saved-sheet-row";
    row.innerHTML = `
      <div><p>${escapeHtml(sheet.styleName)}</p><small>Updated ${new Date(sheet.updatedAt).toLocaleString()}</small></div>
      <span>${sheet.state.panels?.length || 0} material rows</span>
      <strong>${escapeHtml(sheet.quote)}</strong>
      <div class="saved-sheet-actions">
        <button class="primary-btn load-sheet" type="button">Open</button>
        <button class="secondary-light-btn delete-sheet" type="button">Delete</button>
      </div>`;
    row.querySelector(".load-sheet").addEventListener("click", () => loadSheet(sheet.id));
    row.querySelector(".delete-sheet").addEventListener("click", () => deleteSheet(sheet.id));
    els.savedSheetsList.append(row);
  });
}

function checkDuplicateStyle() {
  const styleName = els.styleName.value.trim();
  if (!styleName || styleName === duplicateWarningStyle) return;
  const duplicate = getSavedSheets().some((sheet) => sheet.styleName.toLowerCase() === styleName.toLowerCase());
  if (duplicate) {
    duplicateWarningStyle = styleName;
    showToast(`A saved cost sheet already uses the style name "${styleName}". Saving will update it.`);
  }
}

function resetNewSheet() {
  els.styleName.value = "New Style";
  duplicateWarningStyle = "";
  showView("calculator");
  calculate();
  markDemoFields(els.styleName);
}

function setMeasurementUnit(unit) {
  state.measurementUnit = unit;
  updateMeasurementLabels();
  renderPanels();
}

function updateMeasurementLabels() {
  const unit = activeUnit();
  els.panelLengthHeader.textContent = `Length ${unit.label}`;
  els.panelWidthHeader.textContent = `Width ${unit.label}`;
  els.panelAverageHeader.textContent = `Average / piece (${unit.areaLabel})`;
  els.panelAreaHeader.textContent = "Total usage incl. allowance";
  els.netAreaLabel.textContent = `Dimensional usage (${unit.areaLabel})`;
}

function setMode(mode) {
  syncFabricRateFromInput();
  state.mode = mode;
  document.querySelectorAll(".mode-btn").forEach((button) => {
    const active = button.dataset.mode === mode;
    button.classList.toggle("active", active);
    button.setAttribute("aria-selected", String(active));
  });
  els.gsmLabel.classList.toggle("hidden", mode !== "knit");
  updateMeasurementLabels();
  els.fabricRate.value = formatFabricRate();
  calculate();
}

function renderCurrencyValues() {
  updateRateStatus();
  updateCurrencyLabels();
  renderCommercialInputs();
  renderPanels();
  renderFabrics();
  renderAdditionalCosts();
  calculate();
}

function setCurrency(currency) {
  syncCommercialInputs();
  state.currency = currency;
  renderCurrencyValues();
}

function inferPanelsFromText(text) {
  const lower = text.toLowerCase();
  const inferred = [];
  const keywords = [
    ["front", "Front body"],
    ["back", "Back body"],
    ["sleeve", "Sleeve"],
    ["collar", "Collar"],
    ["pocket", "Pocket"],
    ["cuff", "Cuff"],
    ["hood", "Hood"]
  ];

  keywords.forEach(([needle, label]) => {
    if (lower.includes(needle) && !state.panels.some((panel) => panel.name.toLowerCase().includes(needle))) {
      inferred.push({ name: label, method: "dimensions", length: 20, width: 20, pieces: needle === "sleeve" || needle === "cuff" ? 2 : 1, allowance: 3, unit: "m2", usage: 0, rate: 1 });
    }
  });

  if (inferred.length) {
    state.panels.push(...inferred);
    renderPanels();
  }
}

function handleTechPack(file) {
  if (!file) return;
  els.fileCard.classList.remove("hidden");
  els.fileName.textContent = file.name;
  els.fileMeta.textContent = `${(file.size / 1024).toFixed(1)} KB · ${file.type || "attached"}`;

  const readableTypes = ["text/plain", "text/csv", "application/json"];
  const readableExtension = /\.(txt|csv|json)$/i.test(file.name);

  if (readableTypes.includes(file.type) || readableExtension) {
    file.text().then((text) => {
      inferPanelsFromText(text);
      els.fileMeta.textContent = `${(file.size / 1024).toFixed(1)} KB · text scanned for panel names`;
    });
  }
}

function exportCsv() {
  const unit = activeUnit();
  const rows = [
    ["Style", els.styleName.value],
    ["Measurement unit", activeUnit().name],
    ["Currency", state.currency],
    ["Exchange rate source", els.rateStatus.textContent],
    ["Order quantity", els.orderQty.value],
    [],
    ["Materials & pattern pieces"],
    ["Fabric / pattern", "Method", `Length ${unit.label}`, `Width ${unit.label}`, "Pieces", `Average / piece ${unit.areaLabel}`, "Allowance %", "Usage unit", "Usage incl allowance", `Rate / unit ${state.currency}`, `Cost / garment ${state.currency}`],
    ...state.panels.map((panel) => [
      panel.name,
      panel.method,
      panel.method === "direct" ? "" : formatMeasurement(panel.length),
      panel.method === "direct" ? "" : formatMeasurement(panel.width),
      panel.pieces,
      panel.method === "direct" ? "" : formatArea(panelAverage(panel)),
      panel.allowance,
      panel.unit,
      panelUsage(panel).toFixed(4),
      formatCurrencyInput(panel.rate),
      formatCurrencyInput(panelLineCost(panel))
    ]),
    [],
    ["Additional costs"],
    ["Cost item", "Classification", "Cost basis", `Amount / garment ${state.currency}`, "Notes"],
    ...state.additionalCosts.map((cost) => [cost.name, cost.type, cost.unit || "pc", formatCurrencyInput(cost.amount), cost.notes]),
    [`Additional cost total ${state.currency}`, formatCurrencyInput(additionalCostTotal())],
    ["Overhead method", els.overheadMode.value],
    ["Overhead value", els.overheadMode.value === "amount" ? formatCurrencyInput(state.overheadAmount) : els.overhead.value],
    [],
    ["Dimensional usage", els.netArea.textContent],
    ["Direct-use material cost", els.consumption.textContent],
    ["Allowance cost impact", els.totalFabric.textContent],
    ["Fabric cost", els.fabricCost.textContent],
    ["Quoted price", els.quotedPrice.textContent]
  ];

  const csv = rows.map((row) => row.map((cell) => `"${String(cell ?? "").replaceAll('"', '""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${(els.styleName.value || "garment-costing").replace(/[^\w-]+/g, "-").toLowerCase()}-costing.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

document.querySelector("#addPanelBtn").addEventListener("click", () => addPanel());
document.querySelector("#addFabricBtn").addEventListener("click", addFabric);
document.querySelector("#addCostBtn").addEventListener("click", addAdditionalCost);
document.querySelector("#saveSheetBtn").addEventListener("click", saveCurrentSheet);
document.querySelector("#dashboardBtn").addEventListener("click", () => showView("dashboard"));
document.querySelector("#newSheetBtn").addEventListener("click", resetNewSheet);
document.querySelector("#logoutBtn").addEventListener("click", () => {
  localStorage.removeItem("garmentCostingCurrentUser");
  currentUser = "";
  showView("login");
});
document.querySelector("#exportBtn").addEventListener("click", exportCsv);
document.querySelector("#printBtn").addEventListener("click", () => window.print());
document.querySelector("#clearFileBtn").addEventListener("click", () => {
  els.techPackInput.value = "";
  els.fileCard.classList.add("hidden");
});

document.querySelectorAll(".mode-btn").forEach((button) => {
  button.addEventListener("click", () => setMode(button.dataset.mode));
});

function handleMeasurementUnitChange() {
  setMeasurementUnit(els.measurementUnit.value);
}

els.measurementUnit.addEventListener("change", handleMeasurementUnitChange);
els.measurementUnit.addEventListener("input", handleMeasurementUnitChange);

els.currency.addEventListener("change", () => {
  setCurrency(els.currency.value);
});

els.overheadMode.addEventListener("change", updateOverheadMode);
els.sheetSearch.addEventListener("input", renderDashboard);
els.styleName.addEventListener("input", checkDuplicateStyle);

els.loginForm.addEventListener("submit", (event) => {
  event.preventDefault();
  currentUser = els.loginEmail.value.trim().toLowerCase();
  localStorage.setItem("garmentCostingCurrentUser", currentUser);
  showView("dashboard");
});

Object.values(els).forEach((element) => {
  if (element instanceof HTMLInputElement && element.id !== "techPackInput") {
    element.addEventListener("input", calculate);
  }
});

els.techPackInput.addEventListener("change", (event) => {
  handleTechPack(event.target.files[0]);
});

populateCurrencyOptions();
updateMeasurementLabels();
els.fabricWidth.value = formatMeasurement(state.fabricWidthCm);
els.fabricRate.value = formatFabricRate();
renderPanels();
renderFabrics();
renderAdditionalCosts();
renderCommercialInputs();
updateCurrencyLabels();
updateOverheadMode();
configureNumericFields();
markDemoFields();
fetchExchangeRates();

currentUser = localStorage.getItem("garmentCostingCurrentUser") || "";
showView(currentUser ? "dashboard" : "login");
