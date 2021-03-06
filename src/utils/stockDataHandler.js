import dateformat from 'dateformat';

/**
 * Last closing value for the stock
 * @param stockData
 * @return adjusted last closing price
 */
export function currentClosingPrice(stockData) {
  // index based on Quandl api
  const ADJUSTED_CLOSE_INDEX = 11;

  // NOTE: reponse received from Quandl is from the earliest available date
  // for compatibility with highstock 
  return stockData[stockData.length-1][ADJUSTED_CLOSE_INDEX];
}

/**
 * Since quandl does not provides real time value, price variation
 * is calculated from the closing values of last 2 days
 * @param stockData
 * @return price change to 2 decimals
 */
export function currentPriceChange(stockData) {
  let currentClosePrice = currentClosingPrice(stockData);
  let previousClosePrice = previousClosingPrice(stockData);
  
  return (currentClosePrice - previousClosePrice).toFixed(2);
}

/**
 * Daily price change for the stock
 * @param stockData
 * @return string of daily percent change
 */
export function dailyPercentChange(stockData) {
  const priceVariation = currentPriceChange(stockData);
  const previousClosePrice = previousClosingPrice(stockData);

  let percentChange = (priceVariation / previousClosePrice) * 100;
  percentChange = (percentChange).toFixed(2);

  return percentChange;
}

/**
 * Removes additional text in stock name added by Quandl
 * @param name stock name
 */
export function formattedStockName(stockName) {
  return stockName.slice(0, stockName.indexOf('(') - 1);
}

export function getRequiredStockProps(stocks) {
  if (!stocks) {
    return null;
  }

  return new Promise((resolve, reject) => {
    resolve(stocks.map(stock => {
      const stockData = convertStockDataToHighstockFormat(stock.dataset.data);
      return {
        name: stock.dataset.dataset_code,
        data: stockData
      };
    })); 
  });
}

export function getStockCodesFromProps(stocks) {
  return stocks.map(stock => {
    return stock.dataset.dataset_code;
  });
}

/**
 * Determine if stock data already rendered.
 * @param stockCodes array of stock codes already rendered
 * @param newStockCode
 * @return 'true' if stock already rendered on chart, 'false' otherwise  
 */
export function isStockPresent(stockCodes, newStockCode) {
  return stockCodes.includes(newStockCode);
}

/**
 * Helper to check if stock data is empty
 * @param stocks array of stocks data 
 * @return 'true' if stocks array is empty, 'false' otherwise
 */
export function isStockListEmpty(stocks) {
  return stocks.length === 0;
}

/**
 * Format time received from Quandl
 * @param date Date received in UTC format
 * @return time in long format
 */
export function lastUpdateTime(date) {
  let formattedDate = correctedDate(date);
  formattedDate = new Date(formattedDate);

  return dateformat(formattedDate, 'dddd, mmmm dS, yyyy, h:MM TT Z');
}

export function previousClosingPrice(stockData) {
  // index based on Quandl api
  const ADJUSTED_CLOSE_INDEX = 11;
  return stockData[stockData.length-2][ADJUSTED_CLOSE_INDEX];
}

/**
 * Gives adjusted closing price from Quandl api reponse data.
 * @param stockData object containing daily stock data
 * @return closing price
 */
function closingPrice(stock) {
  // NOTE: Stock closing index is specific to quandl's api response
  const STOCK_CLOSING_PRICE_INDEX = 11;
  return stock[STOCK_CLOSING_PRICE_INDEX];
}

/**
 * Converts stock data from api response to HighChart library format for rendering
 * @param stockData Array containing stock data for a period of time
 * @return array of stockdata in Highstock data format
 */
function convertStockDataToHighstockFormat(stockData) {
  return stockData.map(stock => {
    const date = stockDate(stock);
    const closePrice = closingPrice(stock);

    return [date, closePrice];
  });
}

/**
 * Changes date format from 2018-03-27T21:46:11.036Z to 2018-03-27T21:46:11Z
 * @param date in ??? format
 * @return date in UTC format
 */
function correctedDate(date) {
  // Except 'Z', dont need the last 4 chars
  // TODO: Better soln ?
  let utcDate = date.slice(0, date.length-5) + 'Z';
  return utcDate;
}

/**
 * Gives date in Unix time from Quandl api reponse data.
 * @param stockData array containing daily stock data
 * @return Unix Date
 */
function stockDate(stockData) {
  // NOTE: Date index is specific to quandl's api response
  const DATE_INDEX = 0;
  return Date.parse(stockData[DATE_INDEX]);
}

export function getStockItemProperties(item) {
  const stockName = formattedStockName(item.dataset.name);
  const stockCode = item.dataset.dataset_code;
  const currentValue = currentClosingPrice(item.dataset.data);
  const priceChange = currentPriceChange(item.dataset.data);
  const percentChange = dailyPercentChange(item.dataset.data);
  const lastUpdated = lastUpdateTime(item.dataset.refreshed_at);
  const previousClose = previousClosingPrice(item.dataset.data);
  const variation = priceChange > 0 ? 'positive' : 'negative';

  return {
    stockName,
    stockCode,
    currentValue,
    priceChange,
    percentChange,
    lastUpdated,
    previousClose,
    variation
  };
}
