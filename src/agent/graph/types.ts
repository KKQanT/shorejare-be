import { HumanMessage, BaseMessage, AIMessage } from '@langchain/core/messages';
import { Annotation, END } from '@langchain/langgraph';
import { ChartDataPoint } from 'src/utils/market-data.util';

export type MarketData = {
  symbol?: string;
  interval?: string;
  timeStart?: string;
  timeEnd?: string;
  data?: any;
};

export type TechnicalAnalysis = {
  indicators?: Record<string, any>;
};


export const AgentGlobalState = Annotation.Root({
  messages: Annotation<BaseMessage[]>({
    reducer: (x, y) => x.concat(y),
  }),
  marketData: Annotation<ChartDataPoint[]>({
    reducer: (x, y) => y ?? x ?? [],
    default: () => [],
  }),
  sender: Annotation<string>({
    reducer: (x, y) => y ?? x ?? "",
    default: () => "user",
  }),
});


export type RouterOutput = 'process_image' | 'reception_agent' 