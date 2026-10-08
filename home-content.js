/* Home sections content (journey, deliverables, before vs after) */
window.HOME_CONTENT = {
 "journey": [
  {
   "id": "j1",
   "track": "start",
   "go": "rules",
   "t": "Understand the Business Problem",
   "d": "Read the domain primer on the Home page. Write down, in one line, what the trading desk wants to decide about prices, portfolios, orders, trades and trader P&L."
  },
  {
   "id": "j2",
   "track": "start",
   "go": "datadict",
   "t": "Explore the Dataset",
   "d": "Open all 13 tables: the dimensions (exchange, sector, company, trader, portfolio, calendar) and the facts (daily prices, dividends, splits, orders, trades, positions, trade P&L). 8 companies, 500 trades."
  },
  {
   "id": "j3",
   "track": "data",
   "go": "model",
   "t": "Build the Data Model",
   "d": "Load the small dimensions first, then the facts. fact_trades links back to fact_orders, and the P&L table is derived last from the sell trades."
  },
  {
   "id": "j4",
   "track": "data",
   "go": "sql",
   "t": "Clean & Validate the Data",
   "d": "Check row counts and keys, the suspect-volume flag on daily prices, and the imputed limit price on every MARKET order."
  },
  {
   "id": "j5",
   "track": "build",
   "go": "editor",
   "t": "Write SQL Queries",
   "d": "Load the 13 tables into MySQL and write the KPI queries: returns, volatility, portfolio value, order fill rate, fees and realized P&L."
  },
  {
   "id": "j6",
   "track": "build",
   "go": "kpis",
   "t": "Create KPIs",
   "d": "Build the KPI list starting with market and pricing KPIs, then portfolio, order execution and trader P&L KPIs."
  },
  {
   "id": "j7",
   "track": "dash",
   "go": "dashboards",
   "t": "Build the Tableau Dashboard",
   "d": "Tableau–SQL: connect Tableau to MySQL (not to the Excel file) and build the Executive, Market & Pricing, Portfolio, Order & Execution, Trade & Fee, Trader P&L and Dividends pages."
  },
  {
   "id": "j8",
   "track": "dash",
   "go": "dashboards",
   "t": "Build the Power BI Dashboard",
   "d": "Power BI–SQL: the same dashboards on the same MySQL source, with a proper Date table and the DAX measures from the KPI list."
  },
  {
   "id": "j9",
   "track": "qa",
   "go": "sql",
   "t": "Perform QA",
   "d": "Reconcile every KPI between SQL, Tableau and Power BI. Document every number that didn't match and why."
  },
  {
   "id": "j10",
   "track": "present",
   "go": "interview",
   "t": "Present Your Business Insights",
   "d": "Build the final deck (problem → data → model → KPIs → dashboards → insights → recommendations), then drill the interview questions."
  }
 ],
 "deliverables": [
  {
   "id": "d1",
   "t": "Excel KPI workbook",
   "d": "The core KPIs built with formulas and pivots on the raw export.",
   "where": "KPI List"
  },
  {
   "id": "d2",
   "t": "MySQL database",
   "d": "All 13 tables loaded with keys, row counts verified, 0 orphan keys.",
   "where": "Data Model"
  },
  {
   "id": "d3",
   "t": "SQL script",
   "d": "KPI queries plus the validation and QA queries from the SQL & QA Lab.",
   "where": "SQL & QA Lab"
  },
  {
   "id": "d4",
   "t": "Tableau dashboard",
   "d": "Executive, Market, Portfolio, Orders, Trades, Trader P&L and Dividends pages, connected to MySQL.",
   "where": "Sample Dashboards"
  },
  {
   "id": "d5",
   "t": "Power BI dashboard",
   "d": "The same pages in Power BI, with a Date table and DAX measures.",
   "where": "Sample Dashboards"
  },
  {
   "id": "d6",
   "t": "QA reconciliation sheet",
   "d": "Every KPI: SQL value vs Tableau vs Power BI, with the reason for any gap.",
   "where": "SQL & QA Lab"
  },
  {
   "id": "d7",
   "t": "Final presentation deck",
   "d": "The business story with insights and recommendations, rehearsed as a 90-second pitch.",
   "where": "Interview Prep"
  }
 ],
 "before": [
  "Prices, orders, trades and positions in separate files",
  "Split-unadjusted prices make returns look wrong",
  "No single view of trader P&L after fees",
  "Every report pulled by hand from a different export"
 ],
 "after": [
  "MySQL market data mart (13 tables)",
  "Validated pricing, portfolio, execution and P&L KPIs",
  "Trader and portfolio performance side by side",
  "Tableau & Power BI dashboards reconciled with SQL"
 ]
};
