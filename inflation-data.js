// Historical Inflation Data for India (1960-2024)
// Source: World Bank, Reserve Bank of India, Ministry of Statistics and Programme Implementation
const indiaInflationData = {
  1960: 1.7,
  1961: 1.8,
  1962: 2.0,
  1963: 1.9,
  1964: 10.7,
  1965: 7.7,
  1966: 13.9,
  1967: 11.0,
  1968: 0.6,
  1969: 2.4,
  1970: 5.6,
  1971: 3.0,
  1972: 8.1,
  1973: 16.2,
  1974: 28.6,
  1975: -1.1,
  1976: -7.6,
  1977: 8.3,
  1978: 2.5,
  1979: 6.3,
  1980: 11.4,
  1981: 13.1,
  1982: 7.9,
  1983: 11.9,
  1984: 8.3,
  1985: 5.6,
  1986: 8.7,
  1987: 8.8,
  1988: 9.4,
  1989: 6.2,
  1990: 9.0,
  1991: 13.9,
  1992: 11.8,
  1993: 6.4,
  1994: 10.2,
  1995: 10.2,
  1996: 9.0,
  1997: 7.2,
  1998: 13.2,
  1999: 4.7,
  2000: 4.0,
  2001: 3.8,
  2002: 4.3,
  2003: 3.8,
  2004: 3.8,
  2005: 4.2,
  2006: 5.8,
  2007: 6.4,
  2008: 8.3,
  2009: 10.9,
  2010: 12.0,
  2011: 8.9,
  2012: 9.3,
  2013: 10.9,
  2014: 6.4,
  2015: 4.9,
  2016: 4.5,
  2017: 3.6,
  2018: 3.4,
  2019: 4.8,
  2020: 6.2,
  2021: 5.1,
  2022: 6.7,
  2023: 5.4,
  2024: 4.9
};

// Calculate average inflation for different periods
const inflationPeriods = {
  "1960-1970": calculateAverage(1960, 1970),
  "1970-1980": calculateAverage(1970, 1980),
  "1980-1990": calculateAverage(1980, 1990),
  "1990-2000": calculateAverage(1990, 2000),
  "2000-2010": calculateAverage(2000, 2010),
  "2010-2020": calculateAverage(2010, 2020),
  "2020-2024": calculateAverage(2020, 2024),
  "Last 10 years": calculateAverage(2014, 2024),
  "Last 20 years": calculateAverage(2004, 2024),
  "Overall (1960-2024)": calculateAverage(1960, 2024)
};

function calculateAverage(startYear, endYear) {
  let sum = 0;
  let count = 0;
  for (let year = startYear; year <= endYear; year++) {
    if (indiaInflationData[year] !== undefined) {
      sum += indiaInflationData[year];
      count++;
    }
  }
  return count > 0 ? Math.round((sum / count) * 100) / 100 : 0;
}

// Get inflation rate for a specific year
function getInflationRate(year) {
  return indiaInflationData[year] || null;
}

// Get inflation data for a range of years
function getInflationRange(startYear, endYear) {
  const data = {};
  for (let year = startYear; year <= endYear; year++) {
    if (indiaInflationData[year] !== undefined) {
      data[year] = indiaInflationData[year];
    }
  }
  return data;
}

// Get recent inflation trends
function getRecentTrends(years = 10) {
  const currentYear = new Date().getFullYear();
  const startYear = currentYear - years;
  return getInflationRange(startYear, currentYear);
}

// Notable inflation periods in India
const notableInflationPeriods = {
  "1973-1974 Oil Crisis": {
    years: "1973-1974",
    avgInflation: 22.4,
    description: "First oil shock led to severe inflation"
  },
  "1979-1981 Second Oil Crisis": {
    years: "1979-1981",
    avgInflation: 10.6,
    description: "Second oil crisis and drought conditions"
  },
  "1990-1991 Economic Crisis": {
    years: "1990-1991",
    avgInflation: 11.45,
    description: "Balance of payments crisis period"
  },
  "2008-2010 Global Financial Crisis": {
    years: "2008-2010",
    avgInflation: 10.4,
    description: "Global financial crisis and food inflation"
  },
  "2010-2013 High Inflation Period": {
    years: "2010-2013",
    avgInflation: 10.3,
    description: "Persistent high inflation due to supply constraints"
  }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    indiaInflationData,
    inflationPeriods,
    getInflationRate,
    getInflationRange,
    getRecentTrends,
    notableInflationPeriods,
    calculateAverage
  };
}
