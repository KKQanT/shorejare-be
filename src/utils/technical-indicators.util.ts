import { ChartDataPoint } from './market-data.util';

/**
 * Calculate Simple Moving Average (SMA)
 * @param data Array of price data points
 * @param period Number of periods to calculate SMA over
 * @param priceKey Which price point to use ('close', 'open', 'high', 'low')
 * @returns Array of SMA values aligned with input data (first (period-1) values will be null)
 */
export function calculateSMA(
  data: ChartDataPoint[],
  period: number = 14,
  priceKey: 'close' | 'open' | 'high' | 'low' = 'close'
): (number | null)[] {
  if (data.length < period) {
    return Array(data.length).fill(null);
  }

  const result: (number | null)[] = Array(period - 1).fill(null);
  
  for (let i = period - 1; i < data.length; i++) {
    let sum = 0;
    for (let j = 0; j < period; j++) {
      sum += data[i - j][priceKey];
    }
    result.push(sum / period);
  }
  
  return result;
}

/**
 * Calculate Relative Strength Index (RSI)
 * @param data Array of price data points
 * @param period Number of periods to calculate RSI over (typically 14)
 * @returns Array of RSI values aligned with input data (first (period) values will be null)
 */
export function calculateRSI(
  data: ChartDataPoint[],
  period: number = 14
): (number | null)[] {
  if (data.length < period + 1) {
    return Array(data.length).fill(null);
  }

  const result: (number | null)[] = Array(period).fill(null);
  const gains: number[] = [];
  const losses: number[] = [];
  
  // Calculate price changes
  for (let i = 1; i < data.length; i++) {
    const change = data[i].close - data[i - 1].close;
    gains.push(change > 0 ? change : 0);
    losses.push(change < 0 ? Math.abs(change) : 0);
  }
  
  // Calculate initial averages
  let avgGain = gains.slice(0, period).reduce((sum, gain) => sum + gain, 0) / period;
  let avgLoss = losses.slice(0, period).reduce((sum, loss) => sum + loss, 0) / period;
  
  // Calculate first RSI
  let rs = avgGain / avgLoss;
  let rsi = 100 - (100 / (1 + rs));
  result.push(rsi);
  
  // Calculate subsequent RSIs using smoothed averages
  for (let i = period; i < gains.length; i++) {
    avgGain = ((avgGain * (period - 1)) + gains[i]) / period;
    avgLoss = ((avgLoss * (period - 1)) + losses[i]) / period;
    
    rs = avgGain / avgLoss;
    rsi = 100 - (100 / (1 + rs));
    
    result.push(rsi);
  }
  
  return result;
}

/**
 * Calculate Moving Average Convergence Divergence (MACD)
 * @param data Array of price data points
 * @param fastPeriod Fast EMA period (typically 12)
 * @param slowPeriod Slow EMA period (typically 26)
 * @param signalPeriod Signal line period (typically 9)
 * @returns Object with MACD line, signal line, and histogram values
 */
export function calculateMACD(
  data: ChartDataPoint[],
  fastPeriod: number = 12,
  slowPeriod: number = 26,
  signalPeriod: number = 9
): { macd: (number | null)[], signal: (number | null)[], histogram: (number | null)[] } {
  const closePrices = data.map(d => d.close);
  const fastEMA = calculateEMA(closePrices, fastPeriod);
  const slowEMA = calculateEMA(closePrices, slowPeriod);
  
  // Calculate MACD line (fast EMA - slow EMA)
  const macdLine: (number | null)[] = [];
  for (let i = 0; i < closePrices.length; i++) {
    if (fastEMA[i] === null || slowEMA[i] === null) {
      macdLine.push(null);
    } else {
      macdLine.push((fastEMA[i] as number) - (slowEMA[i] as number));
    }
  }
  
  // Calculate signal line (EMA of MACD line)
  const validMacdValues = macdLine.filter((val): val is number => val !== null);
  const signalLine = calculateEMA(validMacdValues, signalPeriod);
  
  // Calculate histogram (MACD line - signal line)
  const histogram: (number | null)[] = Array(macdLine.length).fill(null);
  
  // Align signal line with macd line (handling offsets)
  const signalOffset = macdLine.length - signalLine.length;
  for (let i = 0; i < signalLine.length; i++) {
    const macdIndex = i + signalOffset;
    if (macdLine[macdIndex] !== null && signalLine[i] !== null) {
      histogram[macdIndex] = (macdLine[macdIndex] as number) - (signalLine[i] as number);
    }
  }
  
  return {
    macd: macdLine,
    signal: [...Array(signalOffset).fill(null), ...signalLine],
    histogram
  };
}

/**
 * Calculate Exponential Moving Average (EMA)
 * @param prices Array of price values
 * @param period Number of periods to calculate EMA over
 * @returns Array of EMA values
 */
export function calculateEMA(
  prices: number[],
  period: number
): (number | null)[] {
  if (prices.length < period) {
    return Array(prices.length).fill(null);
  }
  
  const result: (number | null)[] = Array(period - 1).fill(null);
  
  // Calculate initial SMA as the first EMA value
  const initialSMA = prices.slice(0, period).reduce((sum, price) => sum + price, 0) / period;
  result.push(initialSMA);
  
  // Calculate multiplier: 2 / (period + 1)
  const multiplier = 2 / (period + 1);
  
  // Calculate EMA for remaining prices
  for (let i = period; i < prices.length; i++) {
    const ema = (prices[i] - (result[result.length - 1] as number)) * multiplier + (result[result.length - 1] as number);
    result.push(ema);
  }
  
  return result;
}

/**
 * Calculate Bollinger Bands
 * @param data Array of price data points
 * @param period Number of periods for SMA (typically 20)
 * @param stdDevMultiplier Standard deviation multiplier (typically 2)
 * @returns Object with upper band, middle band (SMA), and lower band values
 */
export function calculateBollingerBands(
  data: ChartDataPoint[],
  period: number = 20,
  stdDevMultiplier: number = 2
): { upper: (number | null)[], middle: (number | null)[], lower: (number | null)[] } {
  const middle = calculateSMA(data, period);
  const upper: (number | null)[] = [];
  const lower: (number | null)[] = [];
  
  for (let i = 0; i < data.length; i++) {
    if (middle[i] === null) {
      upper.push(null);
      lower.push(null);
      continue;
    }
    
    // Calculate standard deviation
    let sum = 0;
    for (let j = 0; j < period; j++) {
      sum += Math.pow(data[i - j].close - (middle[i] as number), 2);
    }
    const stdDev = Math.sqrt(sum / period);
    
    upper.push((middle[i] as number) + (stdDevMultiplier * stdDev));
    lower.push((middle[i] as number) - (stdDevMultiplier * stdDev));
  }
  
  return { upper, middle, lower };
} 