import axios from 'axios';

export interface ChartDataPoint {
  low: number;
  open: number;
  high: number;
  close: number;
  volume: number;
  timestamp: number;
  date: string;
}


export async function fetchMarketData(
  symbol: string,
  interval: string = '1d', //1h, 15m, 1w 
  period: string = '2mo'
): Promise<ChartDataPoint[]> {
  try {
    // Calculate periods based on current time
    const now = new Date();
    const twoMonthsAgo = new Date();
    twoMonthsAgo.setMonth(now.getMonth() - 2);
    
    const url = `https://query2.finance.yahoo.com/v8/finance/chart/${symbol}-USD`;
    const params = {
      period1: Math.floor(twoMonthsAgo.getTime() / 1000),
      period2: Math.floor(now.getTime() / 1000),
      interval: interval,
      includePrePost: 'true',
      events: 'div|split|earn',
      lang: 'en-US',
      region: 'US'
    };
    
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36',
      'Accept': 'application/json, text/javascript, */*; q=0.01',
      'Accept-Language': 'en-US,en;q=0.9',
      'Connection': 'keep-alive',
      'Referer': 'https://finance.yahoo.com',
      'DNT': '1'
    };
    
    const response = await axios.get(url, { params, headers });
    
    if (response.status === 200) {
      const data = response.data;
      const quote = data.chart.result[0].indicators.quote[0];
      const timestamps = data.chart.result[0].timestamp;
      
      const processedData: ChartDataPoint[] = timestamps.map((timestamp: number, index: number) => {
        return {
          low: quote.low[index] || null,
          open: quote.open[index] || null,
          high: quote.high[index] || null,
          close: quote.close[index] || null,
          volume: quote.volume[index] || 0,
          timestamp: timestamp,
          date: new Date(timestamp * 1000).toISOString().split('T')[0]
        };
      }).filter((point: ChartDataPoint) => 
        point.low !== null && point.open !== null && 
        point.high !== null && point.close !== null
      );
      
      return processedData;
    } else {
      throw new Error(`Yahoo Finance API responded with status: ${response.status}`);
    }
  } catch (error) {
    console.error('Error fetching chart data:', error);
    throw error;
  }
} 