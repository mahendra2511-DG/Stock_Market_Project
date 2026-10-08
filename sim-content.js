/* Job Simulator content: every number comes from this project's own answer keys and gotchas. */
window.SIM_CONTENT = {
 "site": "ALPHA Stock Analytics",
 "intro": {
  "incident": "Real alerts from ALPHA risk, trading and finance leaders, each built on a trap this project teaches. Check the evidence, pick the root cause and the fix, then write the reply you would send.",
  "broken": "A junior analyst built this Trading Executive Overview from the 13-table trading model. Find every tile that uses a wrong formula, grain or currency before it reaches leadership.",
  "stakeholder": "ALPHA stakeholders rarely ask precise questions. Pick the clarifying questions that turn a vague request into a clear KPI spec, and skip the ones that waste their time."
 },
 "incidents": [
  {
   "id": "i1",
   "lvl": "Easy",
   "title": "“All 500 orders have bad data!”",
   "from": "Suresh Pillai · Risk Officer",
   "time": "Mon 9:20 AM",
   "msg": "The data quality report says 100% of our orders have an imputed limit price. That means every one of our 500 orders has a made-up value. Should I stop the QA sign-off until the order data is fixed?",
   "metric": [
    [
     "Imputed Limit Price Rate",
     "100%"
    ],
    [
     "Orders affected",
     "500 of 500"
    ]
   ],
   "evidence": [
    {
     "id": "e1",
     "rel": true,
     "t": "Orders by order type",
     "sql": "SELECT order_type, COUNT(*) FROM fact_orders GROUP BY order_type;",
     "res": [
      [
       "MARKET",
       "500"
      ],
      [
       "any other type",
       "0"
      ]
     ],
     "note": "Every single order is a MARKET order."
    },
    {
     "id": "e2",
     "rel": true,
     "t": "Imputed flag count",
     "sql": "SELECT COUNT(*) FROM fact_orders WHERE limit_price_imputed = TRUE;",
     "res": [
      [
       "flagged orders",
       "500"
      ],
      [
       "total orders",
       "500"
      ]
     ],
     "note": "The flagged orders are exactly the same 500 market orders."
    },
    {
     "id": "e3",
     "rel": true,
     "t": "Data dictionary: limit_price_imputed",
     "sql": "-- Expected nulls → fact_orders",
     "res": [
      [
       "limit_price_imputed",
       "TRUE on every row"
      ],
      [
       "reason",
       "MARKET orders have no stated limit price"
      ],
      [
       "meaning",
       "filled by convention, not missing data"
      ]
     ],
     "note": "A market order buys or sells at the current price, so there is no limit price to store."
    },
    {
     "id": "e4",
     "rel": false,
     "t": "Suspect volume rows",
     "sql": "SELECT COUNT(*) FROM fact_daily_prices WHERE is_volume_suspect = TRUE;",
     "res": [
      [
       "suspect rows",
       "about 42"
      ],
      [
       "all price rows",
       "1,032"
      ]
     ],
     "note": "This is a flag on market price data, a different table. It doesn't explain the order flag."
    }
   ],
   "causes": [
    [
     "c1",
     "The order feed lost the limit prices during loading"
    ],
    [
     "c2",
     "All 500 orders are MARKET orders, which have no limit price, so the field is filled by convention",
     true
    ],
    [
     "c3",
     "Traders typed wrong limit prices"
    ],
    [
     "c4",
     "fact_orders has duplicate order_ids"
    ],
    [
     "c5",
     "The flag was copied from fact_daily_prices"
    ]
   ],
   "fixes": [
    [
     "f1",
     "Keep all rows, label the 100% as expected for market orders, and always check order_type before calling the flag a data-quality issue",
     true
    ],
    [
     "f2",
     "Delete the 500 flagged orders"
    ],
    [
     "f3",
     "Fill limit_price with the average trade price"
    ],
    [
     "f4",
     "Stop QA sign-off until a new file arrives"
    ]
   ],
   "answer": "Root cause: no data problem. All 500 orders are MARKET orders, and a market order has no limit price, so limit_price_imputed is TRUE on every row <b>by design</b>. Order Fill Rate is still 100%.",
   "tell": "“The order data is fine. All 500 orders are market orders, so there is no real limit price to store and the flag is set by convention. QA sign-off can go ahead. I've added a note to the report so this doesn't look like an error again.”"
  },
  {
   "id": "i2",
   "lvl": "Easy",
   "title": "“Our win rate fell to 42.4%”",
   "from": "Vikram Rao · Head of Trading",
   "time": "Tue 10:45 AM",
   "msg": "The new trader scorecard says our trade win rate is 42.4%. Last week's deck said 88.7%. Did the desks suddenly start losing money?",
   "metric": [
    [
     "New scorecard",
     "42.4%"
    ],
    [
     "Last week's deck",
     "88.7%"
    ]
   ],
   "evidence": [
    {
     "id": "e1",
     "rel": true,
     "t": "Trades by side",
     "sql": "SELECT side, COUNT(*) FROM fact_trades GROUP BY side;",
     "res": [
      [
       "Buy",
       "261"
      ],
      [
       "Sell",
       "239"
      ],
      [
       "Total",
       "500"
      ]
     ],
     "note": "Only sell trades close a position. A buy trade can't be a win or a loss yet."
    },
    {
     "id": "e2",
     "rel": true,
     "t": "Rows and wins in the P&L table",
     "sql": "SELECT COUNT(*) AS closed_trades, SUM(win_flag) AS wins\nFROM fact_trades_pnl_kpi;",
     "res": [
      [
       "closed_trades",
       "239"
      ],
      [
       "wins",
       "212"
      ],
      [
       "losses",
       "27"
      ]
     ],
     "note": "212 ÷ 239 = 88.7%. The scorecard used 212 ÷ 500 = 42.4%."
    },
    {
     "id": "e3",
     "rel": true,
     "t": "KPI definition: Trade Win Rate",
     "sql": "-- KPI List → P&L",
     "res": [
      [
       "formula",
       "SUM(win_flag) ÷ COUNT(*)"
      ],
      [
       "table",
       "fact_trades_pnl_kpi"
      ],
      [
       "grain",
       "1 row per SELL trade that closes a position"
      ]
     ],
     "note": "The denominator is closed trades, not all trades."
    },
    {
     "id": "e4",
     "rel": false,
     "t": "Order fill rate",
     "sql": "SELECT SUM(status = 'FILLED') / COUNT(*) FROM fact_orders;",
     "res": [
      [
       "FILLED orders",
       "500"
      ],
      [
       "all orders",
       "500"
      ],
      [
       "fill rate",
       "100%"
      ]
     ],
     "note": "Every order was executed. Fill rate is a different KPI and doesn't explain the win rate."
    }
   ],
   "causes": [
    [
     "c1",
     "The desks really started losing more trades"
    ],
    [
     "c2",
     "win_flag was loaded with wrong values"
    ],
    [
     "c3",
     "Wins were divided by all 500 trades, including 261 buy trades that can't be a win or a loss",
     true
    ],
    [
     "c4",
     "Fees were not subtracted"
    ],
    [
     "c5",
     "Some orders were not filled"
    ]
   ],
   "fixes": [
    [
     "f1",
     "Win rate = SUM(win_flag) ÷ COUNT(*) on fact_trades_pnl_kpi → 88.7%, shown next to Average Return % per Trade (0.27%)",
     true
    ],
    [
     "f2",
     "Divide wins by the number of orders"
    ],
    [
     "f3",
     "Count buy trades as losses"
    ],
    [
     "f4",
     "Remove the win rate tile"
    ]
   ],
   "answer": "Root cause: wrong denominator. 212 wins were divided by all 500 trades (261 of them are buys). Win rate uses closed sell trades only: 212 ÷ 239 = <b>88.7%</b>.",
   "tell": "“Nothing changed on the desks. The new scorecard divided wins by every trade, including buys that haven't been closed yet. The real win rate is still 88.7%. I've fixed the formula.”"
  },
  {
   "id": "i3",
   "lvl": "Medium",
   "title": "“Our portfolios grew by 60.79M”",
   "from": "Ananya Desai · Portfolio Manager",
   "time": "Wed 3:10 PM",
   "msg": "The dashboard shows 60.79M of realized profit. I want to tell clients that our 10 portfolios are now worth 60.79M more than when we started. Can I say that?",
   "metric": [
    [
     "Total Realized Profit",
     "60.79M"
    ]
   ],
   "evidence": [
    {
     "id": "e1",
     "rel": true,
     "t": "Which trades are in the P&L table",
     "sql": "SELECT COUNT(*) FROM fact_trades_pnl_kpi;\nSELECT COUNT(*) FROM fact_trades WHERE side = 'Sell';",
     "res": [
      [
       "rows in fact_trades_pnl_kpi",
       "239"
      ],
      [
       "sell trades",
       "239"
      ],
      [
       "all trades",
       "500"
      ]
     ],
     "note": "The P&L table has one row per sell trade only."
    },
    {
     "id": "e2",
     "rel": true,
     "t": "How the P&L table joins",
     "sql": "-- Join Guide\nfact_trades[trade_id] = fact_trades_pnl_kpi[sell_trade_id]",
     "res": [
      [
       "joins on",
       "sell_trade_id"
      ],
      [
       "grain",
       "1 row per SELL trade that closes a position"
      ],
      [
       "buy trades in table",
       "none"
      ]
     ],
     "note": "Profit is booked only when a position is sold."
    },
    {
     "id": "e3",
     "rel": true,
     "t": "Positions still held",
     "sql": "SELECT COUNT(*) FROM fact_positions_snapshot;",
     "res": [
      [
       "open position rows",
       "10"
      ],
      [
       "portfolios",
       "10"
      ],
      [
       "KPI for these",
       "Unrealized Gain/Loss = (Current Price − Buy Price) × Quantity"
      ]
     ],
     "note": "Open positions can be up or down. None of that is inside realized profit."
    },
    {
     "id": "e4",
     "rel": false,
     "t": "Average daily trading volume",
     "sql": "SELECT AVG(volume) FROM fact_daily_prices;",
     "res": [
      [
       "avg daily volume",
       "25,415"
      ],
      [
       "price rows",
       "1,032"
      ]
     ],
     "note": "Market activity, not the value of our portfolios."
    }
   ],
   "causes": [
    [
     "c1",
     "Realized profit was double counted"
    ],
    [
     "c2",
     "Realized profit only covers closed (sold) positions. It says nothing about gains or losses on the positions still held",
     true
    ],
    [
     "c3",
     "Buy trades were left out of the P&L table by mistake"
    ],
    [
     "c4",
     "The positions snapshot is missing dates"
    ],
    [
     "c5",
     "Fees were not included"
    ]
   ],
   "fixes": [
    [
     "f1",
     "Show realized profit (fact_trades_pnl_kpi) and Portfolio Value / Unrealized Gain/Loss (fact_positions_snapshot) side by side, clearly labelled",
     true
    ],
    [
     "f2",
     "Add buy trades to fact_trades_pnl_kpi"
    ],
    [
     "f3",
     "Sum fact_positions_snapshot over every date to get growth"
    ],
    [
     "f4",
     "Call realized profit “portfolio growth” on the dashboard"
    ]
   ],
   "answer": "Root cause: realized profit is not portfolio growth. It comes from the 239 sell trades that closed positions. Open positions in fact_positions_snapshot can be <b>up or down</b>, so portfolio value change needs the unrealized side too.",
   "tell": "“60.79M is profit we booked by selling. It doesn't tell us what the positions we still hold are worth. I'll show realized profit and current portfolio value side by side so the client message is accurate.”"
  },
  {
   "id": "i4",
   "lvl": "Advanced",
   "title": "“HDFCBANK is our best stock at $15.53M”",
   "from": "Meera Krishnan · CFO",
   "time": "Thu 6:15 PM",
   "msg": "The board pack says our best stock is HDFCBANK with $15.53M realized profit, well ahead of PFE at $9.49M, and IT is the top sector at $20.13M. Total is $60.79M. Can I quote these dollar figures to our US investors?",
   "metric": [
    [
     "HDFCBANK realized profit",
     "$15.53M"
    ],
    [
     "Total realized profit",
     "$60.79M"
    ]
   ],
   "evidence": [
    {
     "id": "e1",
     "rel": true,
     "t": "Realized profit by exchange and top stock",
     "sql": "SELECT x.exchange_name, x.currency, c.ticker, SUM(p.realized_profit)\nFROM fact_trades_pnl_kpi p\nJOIN dim_company c  ON p.company_id = c.company_id\nJOIN dim_exchange x ON c.exchange_id = x.exchange_id\nGROUP BY ROLLUP(x.exchange_name, x.currency, c.ticker);",
     "res": [
      [
       "NSE total (INR): HDFCBANK, INFY, RELIANCE, TCS",
       "40.29M"
      ],
      [
       "NASDAQ total (USD): PFE, AMZN, MSFT, AAPL",
       "20.50M"
      ],
      [
       "HDFCBANK (NSE, INR)",
       "15.53M"
      ],
      [
       "PFE (NASDAQ, USD)",
       "9.49M"
      ]
     ],
     "note": "NSE: 15.53 + 10.67 + 7.78 + 6.31 = 40.29M (INR). NASDAQ: 9.49 + 7.86 + 2.22 + 0.93 = 20.50M (USD)."
    },
    {
     "id": "e2",
     "rel": true,
     "t": "Data dictionary: dim_exchange",
     "sql": "-- Data Dictionary → dim_exchange",
     "res": [
      [
       "NSE",
       "India · INR"
      ],
      [
       "NASDAQ",
       "USA · USD"
      ]
     ],
     "note": "Each company's prices and trades are in its own exchange's currency."
    },
    {
     "id": "e3",
     "rel": true,
     "t": "Tables in the model",
     "sql": "-- Data Model → TABLES",
     "res": [
      [
       "tables",
       "13"
      ],
      [
       "FX / currency rate table",
       "none"
      ]
     ],
     "note": "There is no table to convert rupees to dollars, so no conversion ever happened."
    },
    {
     "id": "e4",
     "rel": false,
     "t": "Trade win rate",
     "sql": "SELECT SUM(win_flag) / COUNT(*) FROM fact_trades_pnl_kpi;",
     "res": [
      [
       "win rate",
       "88.7%"
      ],
      [
       "wins / closed trades",
       "212 / 239"
      ]
     ],
     "note": "A ratio, the same in any currency. It doesn't explain the ranking."
    }
   ],
   "causes": [
    [
     "c1",
     "HDFCBANK really is the most profitable stock in dollars"
    ],
    [
     "c2",
     "Some sell trades were matched to the wrong buy trades"
    ],
    [
     "c3",
     "INR profits from the 4 NSE companies were added to USD profits from the 4 NASDAQ companies as if they were the same currency",
     true
    ],
    [
     "c4",
     "Fees were counted twice"
    ],
    [
     "c5",
     "The sector mapping in dim_company is wrong"
    ]
   ],
   "fixes": [
    [
     "f1",
     "Add an FX rate table (by currency and date), convert every amount to one reporting currency before summing or ranking, and until then report NSE (INR) and NASDAQ (USD) separately",
     true
    ],
    [
     "f2",
     "Divide the total by 2"
    ],
    [
     "f3",
     "Remove the NSE companies from the dashboard"
    ],
    [
     "f4",
     "Keep the numbers and just put a $ sign on all of them"
    ]
   ],
   "answer": "Root cause: no currency conversion. 40.29M of the 60.79M comes from NSE stocks in <b>INR</b> and 20.50M from NASDAQ stocks in <b>USD</b>. They were added and ranked as if both were dollars, so HDFCBANK's “$15.53M” and IT's “$20.13M” are not real dollar figures.",
   "tell": "“Please don't quote those dollar figures yet. Our NSE profits are in rupees and were added to the NASDAQ dollars without conversion. I'll show NSE in INR and NASDAQ in USD separately now, and a converted total once we add an FX rate table.”"
  }
 ],
 "broken": {
  "from": "Head of Trading",
  "brief": "“A junior analyst built this for tomorrow's leadership review. Something feels off. Flag every number you would NOT present, then submit.”",
  "title": "ALPHA · Trading Executive Overview · 181-day dataset",
  "tiles": [
   {
    "id": "t1",
    "label": "Total Orders Placed",
    "val": "500",
    "bad": false,
    "why": "Correct: COUNT(order_id) on fact_orders."
   },
   {
    "id": "t2",
    "label": "Order Fill Rate",
    "val": "100%",
    "bad": false,
    "why": "Correct: all 500 orders have status FILLED."
   },
   {
    "id": "t3",
    "label": "Trade Win Rate",
    "val": "42.4%",
    "bad": true,
    "why": "212 wins ÷ all 500 trades, including 261 buys that can't win or lose. Correct: SUM(win_flag) ÷ COUNT(*) on fact_trades_pnl_kpi = 212 ÷ 239 = 88.7%."
   },
   {
    "id": "t4",
    "label": "Bad Order Data",
    "val": "100%",
    "bad": true,
    "why": "This is the Imputed Limit Price Rate. All 500 orders are MARKET orders, so the flag is TRUE by convention. It is expected, not bad data."
   },
   {
    "id": "t5",
    "label": "Avg Return % / Trade",
    "val": "0.27%",
    "bad": false,
    "why": "Correct: AVERAGE(return_pct) on fact_trades_pnl_kpi."
   },
   {
    "id": "t6",
    "label": "Companies Tracked",
    "val": "1,032",
    "bad": true,
    "why": "COUNT(company_id) on fact_daily_prices counts price rows, not companies. Correct: COUNT(DISTINCT company_id) = 8."
   },
   {
    "id": "t7",
    "label": "Suspect Volume Rate",
    "val": "≈4%",
    "bad": false,
    "why": "Correct: about 42 of 1,032 price rows have is_volume_suspect = TRUE. A watchlist, not rows to delete."
   },
   {
    "id": "t8",
    "label": "Total Exchanges",
    "val": "8",
    "bad": true,
    "why": "COUNT(exchange_id) on dim_company counts one row per company (8), not distinct exchanges. Correct: COUNT(DISTINCT exchange_id) on dim_exchange = 2 (NSE and NASDAQ)."
   },
   {
    "id": "t9",
    "label": "Avg Daily Volume",
    "val": "25,415",
    "bad": false,
    "why": "Correct: AVG(volume) on fact_daily_prices, with suspect rows kept in."
   },
   {
    "id": "t10",
    "label": "Closed Trades",
    "val": "500",
    "bad": true,
    "why": "Counted every row in fact_trades. Only sell trades close a position. Correct: COUNT(*) on fact_trades_pnl_kpi = 239."
   }
  ],
  "chart": {
   "title": "Realized profit by sector ($M)",
   "bars": [
    [
     "Information Technology",
     "$20.13M",
     90
    ],
    [
     "Financials",
     "$15.53M",
     69
    ],
    [
     "Healthcare",
     "$9.49M",
     42
    ],
    [
     "Consumer Discretionary",
     "$7.86M",
     35
    ],
    [
     "Energy",
     "$7.78M",
     35
    ]
   ],
   "bad": true,
   "why": "INR and USD profits were added together. IT = INFY 10.67M + TCS 6.31M (NSE, INR) + MSFT 2.22M + AAPL 0.93M (NASDAQ, USD), and Financials is only HDFCBANK (INR). Convert to one currency first, or show NSE and NASDAQ separately."
  }
 },
 "stakeholders": [
  {
   "id": "s1",
   "who": "Vikram Rao · Head of Trading",
   "ask": "I need a dashboard to see how my desks are doing.",
   "qs": [
    [
     "What decision will this dashboard help you make?",
     "obj",
     18,
     "How much capital to give each desk and which traders need coaching."
    ],
    [
     "Who will use it: you, the 4 desk heads, or the traders too?",
     "scope",
     14,
     "Me and the 4 desk heads: Momentum, Alpha, Discretionary and Quant."
    ],
    [
     "What does 'doing well' mean: realized profit, win rate, or return per trade?",
     "metric",
     18,
     "All three together as a scorecard. Never rank on win rate alone."
    ],
    [
     "Should NSE and NASDAQ trades be shown together or separately?",
     "scope",
     10,
     "Separately until we have a currency conversion. Rupees and dollars can't be added."
    ],
    [
     "Which period, and do you want a trend?",
     "time",
     16,
     "The full 181 days in the dataset, by month."
    ],
    [
     "Should win rate use only closed (sell) trades?",
     "rules",
     14,
     "Yes. Buys aren't wins or losses until they are sold."
    ],
    [
     "Should profit be shown after fees?",
     "rules",
     12,
     "Yes, realized profit already subtracts allocated fees. Show total fees as well."
    ],
    [
     "How often should it refresh?",
     "time",
     6,
     "Daily is enough."
    ],
    [
     "Which colour theme do you like?",
     "bad",
     -8,
     "Whatever is readable. (A question for later, not for scoping.)"
    ],
    [
     "Should I put every column on the dashboard?",
     "bad",
     -8,
     "No, only what supports the decision."
    ],
    [
     "Can I use the Excel file instead of the database?",
     "bad",
     -6,
     "Use the SQL database, so QA can reconcile."
    ]
   ]
  },
  {
   "id": "s2",
   "who": "Ananya Desai · Portfolio Manager",
   "ask": "Show me how my portfolios are performing.",
   "qs": [
    [
     "What will you do differently depending on the answer?",
     "obj",
     18,
     "Rebalance any portfolio that is too concentrated or lagging."
    ],
    [
     "Do you mean realized profit, unrealized gain/loss, or both?",
     "metric",
     18,
     "Both, clearly labelled. Clients care about the total picture."
    ],
    [
     "All 10 portfolios, or only the ones you manage?",
     "scope",
     14,
     "All 10, with a filter for mine."
    ],
    [
     "Do you want Position Concentration as a risk flag?",
     "metric",
     12,
     "Yes, the share of value in the single largest position."
    ],
    [
     "Which period: since inception or a set window?",
     "time",
     16,
     "Since inception for return %, and monthly for the trend."
    ],
    [
     "Should portfolio value use only the latest snapshot date?",
     "rules",
     14,
     "Yes. Never add snapshots across dates; holdings would be counted many times."
    ],
    [
     "Should price returns use the split-adjusted close?",
     "rules",
     8,
     "Yes. Raw close shows a fake drop on a split date."
    ],
    [
     "Do you need it by company and sector too?",
     "scope",
     6,
     "By company yes, sector as a summary."
    ],
    [
     "Can I add a stock news ticker?",
     "bad",
     -8,
     "Not needed for this decision."
    ],
    [
     "Should I build it in Excel, Tableau and Power BI?",
     "bad",
     -6,
     "One tool is enough for this question."
    ],
    [
     "Do you want a 3D pie chart?",
     "bad",
     -8,
     "No."
    ]
   ]
  },
  {
   "id": "s3",
   "who": "Meera Krishnan · CFO",
   "ask": "Give me the profit number for the board.",
   "qs": [
    [
     "Is this for a decision or for reporting?",
     "obj",
     18,
     "Reporting to the board and to investors."
    ],
    [
     "Realized profit only, or also unrealized gains on open positions?",
     "metric",
     18,
     "Realized as the headline, unrealized shown separately."
    ],
    [
     "Which reporting currency: INR or USD?",
     "metric",
     12,
     "USD for the investor pack, INR for the Indian entity."
    ],
    [
     "Which FX rate: rate on the trade date or at period end?",
     "rules",
     14,
     "Trade-date rate for realized profit. We'll need an FX rate table."
    ],
    [
     "Which period?",
     "time",
     16,
     "The full period in the dataset, with a monthly view."
    ],
    [
     "Should profit be net of trading fees?",
     "rules",
     14,
     "Yes, net of allocated fees."
    ],
    [
     "Do you need it by sector and portfolio, or only the total?",
     "scope",
     10,
     "Total, plus sector and portfolio after conversion."
    ],
    [
     "Should both exchanges be in scope?",
     "scope",
     8,
     "Yes, all 8 companies on NSE and NASDAQ."
    ],
    [
     "Can I round everything to billions?",
     "bad",
     -4,
     "Millions are clearer at this size."
    ],
    [
     "Should I add order fill rate to the profit number?",
     "bad",
     -8,
     "No. Fill rate is an operations KPI, not money."
    ],
    [
     "Can I skip QA to deliver faster?",
     "bad",
     -10,
     "No. Board numbers must reconcile."
    ]
   ]
  }
 ]
};
