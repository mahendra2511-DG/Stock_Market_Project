(function () {
const esc = (s) => String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const lsGet = (k) => { try { return localStorage.getItem(k); } catch (e) { return null; } };
const lsSet = (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} };
try { if (typeof VIEW_LABELS === "object") VIEW_LABELS.editor = "SQL Practice Editor"; } catch (e) {}
/* ============================================================
   Live SQL Practice Editor (in-browser SQLite via sql.js) +
   "Today's 3 problems" daily challenge (DailySQL-style).
   ============================================================ */
const PRACTICE_PROBLEMS = [
 {
  "id": "e1",
  "topic": "Aggregations",
  "level": "Easy",
  "mins": 3,
  "t": "Row counts: fact tables",
  "tables": [
   "fact_daily_prices",
   "fact_orders",
   "fact_trades",
   "fact_trades_pnl_kpi",
   "fact_dividends"
  ],
  "task": "Return one row with the row count of fact_daily_prices, fact_orders, fact_trades, fact_trades_pnl_kpi and fact_dividends (columns: daily_prices, orders, trades, pnl_rows, dividends).",
  "hint": "Five scalar subqueries in one SELECT, each with COUNT(*).",
  "sol": "SELECT (SELECT COUNT(*) FROM fact_daily_prices) AS daily_prices,\n       (SELECT COUNT(*) FROM fact_orders) AS orders,\n       (SELECT COUNT(*) FROM fact_trades) AS trades,\n       (SELECT COUNT(*) FROM fact_trades_pnl_kpi) AS pnl_rows,\n       (SELECT COUNT(*) FROM fact_dividends) AS dividends;"
 },
 {
  "id": "e2",
  "topic": "Aggregations",
  "level": "Easy",
  "mins": 3,
  "t": "Orders by side",
  "tables": [
   "fact_orders"
  ],
  "task": "Number of orders and total quantity ordered for each side (BUY / SELL). Return side, orders, total_qty, most orders first.",
  "hint": "GROUP BY side with COUNT(*) and SUM(quantity).",
  "sol": "SELECT side, COUNT(*) AS orders, SUM(quantity) AS total_qty\nFROM fact_orders\nGROUP BY side\nORDER BY orders DESC;"
 },
 {
  "id": "e3",
  "topic": "Filtering",
  "level": "Easy",
  "mins": 3,
  "t": "Suspect-volume days by company",
  "tables": [
   "fact_daily_prices"
  ],
  "task": "Count the trading days flagged is_volume_suspect = 1 for each company_id. Return company_id and suspect_days, most first (ties: company_id A to Z).",
  "hint": "Filter the flag in WHERE, then GROUP BY company_id.",
  "sol": "SELECT company_id, COUNT(*) AS suspect_days\nFROM fact_daily_prices\nWHERE is_volume_suspect = 1\nGROUP BY company_id\nORDER BY suspect_days DESC, company_id;"
 },
 {
  "id": "e4",
  "topic": "Aggregations",
  "level": "Easy",
  "mins": 4,
  "t": "Price range per company",
  "tables": [
   "fact_daily_prices"
  ],
  "task": "For each company_id, the lowest low, the highest high and the price range (highest high minus lowest low), all rounded to 2 decimals. Return company_id, min_low, max_high, price_range, ordered by company_id.",
  "hint": "MIN(low), MAX(high) and their difference, grouped by company_id.",
  "sol": "SELECT company_id, ROUND(MIN(low), 2) AS min_low, ROUND(MAX(high), 2) AS max_high,\n       ROUND(MAX(high) - MIN(low), 2) AS price_range\nFROM fact_daily_prices\nGROUP BY company_id\nORDER BY company_id;"
 },
 {
  "id": "e5",
  "topic": "Aggregations",
  "level": "Easy",
  "mins": 3,
  "t": "Average daily volume",
  "tables": [
   "fact_daily_prices"
  ],
  "task": "Average daily volume per company_id, rounded to 0 decimals. Return company_id and avg_volume, highest first.",
  "hint": "ROUND(AVG(volume), 0) grouped by company_id.",
  "sol": "SELECT company_id, ROUND(AVG(volume), 0) AS avg_volume\nFROM fact_daily_prices\nGROUP BY company_id\nORDER BY avg_volume DESC, company_id;"
 },
 {
  "id": "e6",
  "topic": "Sorting & Limits",
  "level": "Easy",
  "mins": 3,
  "t": "Top 5 volume days",
  "tables": [
   "fact_daily_prices"
  ],
  "task": "The 5 rows with the highest volume in fact_daily_prices. Return date, company_id, volume (ties: earlier date first, then company_id).",
  "hint": "ORDER BY volume DESC with tie-breakers, then LIMIT 5.",
  "sol": "SELECT date, company_id, volume\nFROM fact_daily_prices\nORDER BY volume DESC, date, company_id\nLIMIT 5;"
 },
 {
  "id": "e7",
  "topic": "Conditional Logic",
  "level": "Easy",
  "mins": 4,
  "t": "Overall win rate",
  "tables": [
   "fact_trades_pnl_kpi"
  ],
  "task": "From the realized P&L table: number of closing sells, number of winning sells (win_flag = 1) and win rate % (1 decimal). Return sells, wins, win_rate_pct.",
  "hint": "SUM(win_flag) counts wins; multiply by 100.0 before dividing by COUNT(*).",
  "sol": "SELECT COUNT(*) AS sells, SUM(win_flag) AS wins,\n       ROUND(100.0 * SUM(win_flag) / COUNT(*), 1) AS win_rate_pct\nFROM fact_trades_pnl_kpi;"
 },
 {
  "id": "e8",
  "topic": "Dates",
  "level": "Easy",
  "mins": 4,
  "t": "Dividends by month",
  "tables": [
   "fact_dividends"
  ],
  "task": "Group dividends by month ('YYYY-MM' from date). Return div_month, payouts (row count) and total_dps (sum of dividend_per_share, 2 decimals), oldest month first.",
  "hint": "strftime('%Y-%m', date) gives the month key.",
  "sol": "SELECT strftime('%Y-%m', date) AS div_month, COUNT(*) AS payouts,\n       ROUND(SUM(dividend_per_share), 2) AS total_dps\nFROM fact_dividends\nGROUP BY div_month\nORDER BY div_month;"
 },
 {
  "id": "m1",
  "topic": "Joins",
  "level": "Medium",
  "mins": 6,
  "t": "Companies by sector and exchange",
  "tables": [
   "dim_company",
   "dim_sector",
   "dim_exchange"
  ],
  "task": "For each sector_name, the number of companies listed on NSE, on NASDAQ and in total. Return sector_name, nse, nasdaq, total, biggest total first (ties: sector_name A to Z).",
  "hint": "Join company to sector and exchange, then SUM(CASE WHEN exchange_name = 'NSE' THEN 1 ELSE 0 END) and the same for NASDAQ.",
  "sol": "SELECT s.sector_name,\n       SUM(CASE WHEN e.exchange_name = 'NSE' THEN 1 ELSE 0 END) AS nse,\n       SUM(CASE WHEN e.exchange_name = 'NASDAQ' THEN 1 ELSE 0 END) AS nasdaq,\n       COUNT(*) AS total\nFROM dim_company c\nJOIN dim_sector s ON s.sector_id = c.sector_id\nJOIN dim_exchange e ON e.exchange_id = c.exchange_id\nGROUP BY s.sector_name\nORDER BY total DESC, s.sector_name;"
 },
 {
  "id": "m2",
  "topic": "Joins",
  "level": "Medium",
  "mins": 6,
  "t": "Trading fees by desk",
  "tables": [
   "fact_trades",
   "dim_trader"
  ],
  "task": "For each trader desk: number of trades, total fees and average fee per trade (both 2 decimals). Return desk, trades, total_fees, avg_fee, highest total_fees first.",
  "hint": "Join fact_trades to dim_trader on trader_id, then group by desk.",
  "sol": "SELECT d.desk, COUNT(*) AS trades, ROUND(SUM(t.fees), 2) AS total_fees, ROUND(AVG(t.fees), 2) AS avg_fee\nFROM fact_trades t\nJOIN dim_trader d ON d.trader_id = t.trader_id\nGROUP BY d.desk\nORDER BY total_fees DESC;"
 },
 {
  "id": "m3",
  "topic": "Joins",
  "level": "Medium",
  "mins": 6,
  "t": "Realized P&L by portfolio",
  "tables": [
   "fact_trades_pnl_kpi",
   "dim_portfolio"
  ],
  "task": "Realized profit per portfolio. Return portfolio_name, manager, sells (row count) and realized_profit (sum, 2 decimals), highest profit first.",
  "hint": "Join on portfolio_id and SUM(realized_profit).",
  "sol": "SELECT p.portfolio_name, p.manager, COUNT(*) AS sells, ROUND(SUM(k.realized_profit), 2) AS realized_profit\nFROM fact_trades_pnl_kpi k\nJOIN dim_portfolio p ON p.portfolio_id = k.portfolio_id\nGROUP BY p.portfolio_id, p.portfolio_name, p.manager\nORDER BY realized_profit DESC;"
 },
 {
  "id": "m4",
  "topic": "Conditional Logic",
  "level": "Medium",
  "mins": 6,
  "t": "Win rate by ticker",
  "tables": [
   "fact_trades_pnl_kpi",
   "dim_company"
  ],
  "task": "Win rate % (win_flag = 1 share, 1 decimal) and average return_pct shown as a percent (return_pct × 100, 2 decimals) for each ticker. Return ticker, sells, win_rate_pct, avg_return_pct, highest win rate first (ties: ticker A to Z).",
  "hint": "return_pct is stored as a fraction (0.05 = 5%). AVG(win_flag) × 100 gives the win rate.",
  "sol": "SELECT c.ticker, COUNT(*) AS sells,\n       ROUND(100.0 * AVG(k.win_flag), 1) AS win_rate_pct,\n       ROUND(100.0 * AVG(k.return_pct), 2) AS avg_return_pct\nFROM fact_trades_pnl_kpi k\nJOIN dim_company c ON c.company_id = k.company_id\nGROUP BY c.ticker\nORDER BY win_rate_pct DESC, c.ticker;"
 },
 {
  "id": "m5",
  "topic": "Conditional Logic",
  "level": "Medium",
  "mins": 6,
  "t": "Suspect volume share by exchange",
  "tables": [
   "fact_daily_prices",
   "dim_company",
   "dim_exchange"
  ],
  "task": "For each exchange_name: total price rows, rows with is_volume_suspect = 1, and the suspect share % (2 decimals). Return exchange_name, price_rows, suspect_rows, suspect_pct, ordered by exchange_name.",
  "hint": "Go from prices to company to exchange; SUM(is_volume_suspect) counts the flagged rows.",
  "sol": "SELECT e.exchange_name, COUNT(*) AS price_rows, SUM(p.is_volume_suspect) AS suspect_rows,\n       ROUND(100.0 * SUM(p.is_volume_suspect) / COUNT(*), 2) AS suspect_pct\nFROM fact_daily_prices p\nJOIN dim_company c ON c.company_id = p.company_id\nJOIN dim_exchange e ON e.exchange_id = c.exchange_id\nGROUP BY e.exchange_name\nORDER BY e.exchange_name;"
 },
 {
  "id": "m6",
  "topic": "Joins",
  "level": "Medium",
  "mins": 6,
  "t": "Order to execution time",
  "tables": [
   "fact_orders",
   "fact_trades"
  ],
  "task": "Every order is filled by one trade. By side, how long does execution take? Return side, orders, avg_minutes_to_fill and max_minutes_to_fill (minutes between order_ts and trade_ts, 1 decimal), ordered by side.",
  "hint": "JOIN fact_trades on order_id; (julianday(trade_ts) - julianday(order_ts)) * 24 * 60 gives minutes.",
  "sol": "SELECT o.side, COUNT(*) AS orders,\n       ROUND(AVG((julianday(t.trade_ts) - julianday(o.order_ts)) * 24 * 60), 1) AS avg_minutes_to_fill,\n       ROUND(MAX((julianday(t.trade_ts) - julianday(o.order_ts)) * 24 * 60), 1) AS max_minutes_to_fill\nFROM fact_orders o\nJOIN fact_trades t ON t.order_id = o.order_id\nGROUP BY o.side\nORDER BY o.side;"
 },
 {
  "id": "m7",
  "topic": "Joins",
  "level": "Medium",
  "mins": 7,
  "t": "Value of position snapshots",
  "tables": [
   "fact_positions_snapshot",
   "fact_daily_prices",
   "dim_portfolio",
   "dim_company"
  ],
  "task": "Value each position snapshot at that company's close on the snapshot date. Return portfolio_name, ticker, date, quantity, close and market_value (quantity × close, 2 decimals), highest market_value first.",
  "hint": "Join prices on BOTH company_id and date; add portfolio and company for the names.",
  "sol": "SELECT pf.portfolio_name, c.ticker, s.date, s.quantity, p.close,\n       ROUND(s.quantity * p.close, 2) AS market_value\nFROM fact_positions_snapshot s\nJOIN fact_daily_prices p ON p.company_id = s.company_id AND p.date = s.date\nJOIN dim_portfolio pf ON pf.portfolio_id = s.portfolio_id\nJOIN dim_company c ON c.company_id = s.company_id\nORDER BY market_value DESC;"
 },
 {
  "id": "m8",
  "topic": "Joins",
  "level": "Medium",
  "mins": 7,
  "t": "Dividend yield on payout day",
  "tables": [
   "fact_dividends",
   "fact_daily_prices",
   "dim_company"
  ],
  "task": "For each dividend, the yield % = dividend_per_share ÷ close on the dividend date × 100 (2 decimals). Return ticker, date, dividend_per_share, close, yield_pct, highest yield first.",
  "hint": "Join prices on company_id and date, then 100.0 * dividend_per_share / close.",
  "sol": "SELECT c.ticker, d.date, d.dividend_per_share, p.close,\n       ROUND(100.0 * d.dividend_per_share / p.close, 2) AS yield_pct\nFROM fact_dividends d\nJOIN fact_daily_prices p ON p.company_id = d.company_id AND p.date = d.date\nJOIN dim_company c ON c.company_id = d.company_id\nORDER BY yield_pct DESC, c.ticker;"
 },
 {
  "id": "a1",
  "topic": "Window Functions",
  "level": "Advanced",
  "mins": 9,
  "t": "Daily return % with LAG (INFY)",
  "tables": [
   "fact_daily_prices",
   "dim_company"
  ],
  "task": "For ticker INFY, the first 10 trading days: date, close, prev_close (previous trading day's close) and return_pct = (close - prev_close) ÷ prev_close × 100, 2 decimals. The first day has NULL prev_close and return_pct. Oldest first.",
  "hint": "LAG(close) OVER (ORDER BY date) on INFY's rows; filter the ticker before the window runs.",
  "sol": "WITH d AS (\n  SELECT p.date, p.close, LAG(p.close) OVER (ORDER BY p.date) AS prev_close\n  FROM fact_daily_prices p\n  JOIN dim_company c ON c.company_id = p.company_id\n  WHERE c.ticker = 'INFY'\n)\nSELECT date, close, prev_close,\n       ROUND(100.0 * (close - prev_close) / prev_close, 2) AS return_pct\nFROM d\nORDER BY date\nLIMIT 10;"
 },
 {
  "id": "a2",
  "topic": "Window Functions",
  "level": "Advanced",
  "mins": 11,
  "t": "Volatility: biggest daily moves",
  "tables": [
   "fact_daily_prices",
   "dim_company"
  ],
  "task": "Using daily return % on close (LAG per company), for each ticker: max_gain_pct, max_drop_pct (the most negative return) and avg_abs_move_pct (average of the absolute return), all 2 decimals. Return ticker, max_gain_pct, max_drop_pct, avg_abs_move_pct, highest avg_abs_move_pct first.",
  "hint": "LAG(close) OVER (PARTITION BY company_id ORDER BY date) in a CTE; skip the NULL first day; ABS() for the average move.",
  "sol": "WITH r AS (\n  SELECT company_id,\n         100.0 * (close - LAG(close) OVER (PARTITION BY company_id ORDER BY date))\n               / LAG(close) OVER (PARTITION BY company_id ORDER BY date) AS ret\n  FROM fact_daily_prices\n)\nSELECT c.ticker, ROUND(MAX(r.ret), 2) AS max_gain_pct, ROUND(MIN(r.ret), 2) AS max_drop_pct,\n       ROUND(AVG(ABS(r.ret)), 2) AS avg_abs_move_pct\nFROM r\nJOIN dim_company c ON c.company_id = r.company_id\nWHERE r.ret IS NOT NULL\nGROUP BY c.ticker\nORDER BY avg_abs_move_pct DESC, c.ticker;"
 },
 {
  "id": "a3",
  "topic": "Window Functions",
  "level": "Advanced",
  "mins": 10,
  "t": "Running realized P&L by month",
  "tables": [
   "fact_trades_pnl_kpi"
  ],
  "task": "Realized profit per sell month ('YYYY-MM' from sell_date) and the running total, both 2 decimals. Return sell_month, sells, realized_profit, running_profit, oldest first.",
  "hint": "Group by month in a CTE, then SUM(...) OVER (ORDER BY sell_month).",
  "sol": "WITH m AS (\n  SELECT strftime('%Y-%m', sell_date) AS sell_month, COUNT(*) AS sells, SUM(realized_profit) AS pnl\n  FROM fact_trades_pnl_kpi\n  GROUP BY sell_month\n)\nSELECT sell_month, sells, ROUND(pnl, 2) AS realized_profit,\n       ROUND(SUM(pnl) OVER (ORDER BY sell_month), 2) AS running_profit\nFROM m\nORDER BY sell_month;"
 },
 {
  "id": "a4",
  "topic": "Window Functions",
  "level": "Advanced",
  "mins": 10,
  "t": "Rank traders by realized profit",
  "tables": [
   "fact_trades_pnl_kpi",
   "dim_trader"
  ],
  "task": "Rank traders by total realized profit with RANK() (highest = 1). Return rnk, trader_name, desk, sells and realized_profit (2 decimals) for the top 5 ranks.",
  "hint": "Aggregate per trader in a CTE, then RANK() OVER (ORDER BY profit DESC) and keep rnk <= 5.",
  "sol": "WITH t AS (\n  SELECT d.trader_name, d.desk, COUNT(*) AS sells, SUM(k.realized_profit) AS profit\n  FROM fact_trades_pnl_kpi k\n  JOIN dim_trader d ON d.trader_id = k.trader_id\n  GROUP BY d.trader_id, d.trader_name, d.desk\n), r AS (\n  SELECT RANK() OVER (ORDER BY profit DESC) AS rnk, trader_name, desk, sells, profit FROM t\n)\nSELECT rnk, trader_name, desk, sells, ROUND(profit, 2) AS realized_profit\nFROM r\nWHERE rnk <= 5\nORDER BY rnk, trader_name;"
 },
 {
  "id": "a5",
  "topic": "Subqueries",
  "level": "Advanced",
  "mins": 10,
  "t": "Split impact on the first trading day",
  "tables": [
   "fact_splits",
   "fact_daily_prices",
   "dim_company"
  ],
  "task": "For every company that appears in fact_splits, show the 2025-01-01 row: ticker, splits (number of split events), cumulative_factor, close, adjusted_close (2 decimals) and gap = close - adjusted_close (2 decimals). Order by ticker.",
  "hint": "adjusted_close = close ÷ cumulative_factor, and the factor is the product of all later split ratios. Use IN (SELECT company_id FROM fact_splits) and a correlated subquery for the split count.",
  "sol": "SELECT c.ticker,\n       (SELECT COUNT(*) FROM fact_splits s WHERE s.company_id = p.company_id) AS splits,\n       p.cumulative_factor, p.close, ROUND(p.adjusted_close, 2) AS adjusted_close,\n       ROUND(p.close - p.adjusted_close, 2) AS gap\nFROM fact_daily_prices p\nJOIN dim_company c ON c.company_id = p.company_id\nWHERE p.date = '2025-01-01'\n  AND p.company_id IN (SELECT company_id FROM fact_splits)\nORDER BY c.ticker;"
 },
 {
  "id": "a6",
  "topic": "Conditional Logic",
  "level": "Advanced",
  "mins": 9,
  "t": "Volume with and without suspect days",
  "tables": [
   "fact_daily_prices",
   "dim_company"
  ],
  "task": "For each ticker: suspect_days (is_volume_suspect = 1), avg_volume_all (all days) and avg_volume_clean (excluding suspect days), both 0 decimals, plus lift_pct = (clean ÷ all - 1) × 100, 2 decimals. Return ticker, suspect_days, avg_volume_all, avg_volume_clean, lift_pct, highest lift_pct first.",
  "hint": "AVG(CASE WHEN is_volume_suspect = 0 THEN volume END) ignores the NULLs from flagged rows. Compute the averages in a CTE so you can reuse them.",
  "sol": "WITH v AS (\n  SELECT c.ticker, SUM(p.is_volume_suspect) AS suspect_days,\n         AVG(p.volume) AS v_all,\n         AVG(CASE WHEN p.is_volume_suspect = 0 THEN p.volume END) AS v_clean\n  FROM fact_daily_prices p\n  JOIN dim_company c ON c.company_id = p.company_id\n  GROUP BY c.ticker\n)\nSELECT ticker, suspect_days, ROUND(v_all, 0) AS avg_volume_all, ROUND(v_clean, 0) AS avg_volume_clean,\n       ROUND(100.0 * (v_clean / v_all - 1), 2) AS lift_pct\nFROM v\nORDER BY lift_pct DESC, ticker;"
 },
 {
  "id": "a7",
  "topic": "CTEs & Unions",
  "level": "Advanced",
  "mins": 11,
  "t": "Data-quality scorecard",
  "tables": [
   "fact_trades",
   "fact_dividends",
   "fact_daily_prices",
   "fact_orders"
  ],
  "task": "Build a 4-row data-quality scorecard with columns check_name and issue_rows: 'orphan_trades' (is_orphan_trade = 1), 'orphan_dividends' (is_orphan_dividend = 1), 'suspect_volume_days' (is_volume_suspect = 1) and 'orders_without_trade' (orders with no matching order_id in fact_trades). Order by check_name.",
  "hint": "One SELECT per check, each returning a label and a count, glued together with UNION ALL. A zero is a valid (good) result.",
  "sol": "WITH checks AS (\n  SELECT 'orphan_trades' AS check_name, COUNT(*) AS issue_rows FROM fact_trades WHERE is_orphan_trade = 1\n  UNION ALL\n  SELECT 'orphan_dividends', COUNT(*) FROM fact_dividends WHERE is_orphan_dividend = 1\n  UNION ALL\n  SELECT 'suspect_volume_days', COUNT(*) FROM fact_daily_prices WHERE is_volume_suspect = 1\n  UNION ALL\n  SELECT 'orders_without_trade', COUNT(*) FROM fact_orders o\n  WHERE NOT EXISTS (SELECT 1 FROM fact_trades t WHERE t.order_id = o.order_id)\n)\nSELECT check_name, issue_rows\nFROM checks\nORDER BY check_name;"
 },
 {
  "id": "a8",
  "topic": "Dates",
  "level": "Advanced",
  "mins": 11,
  "t": "Monthly closing trend (MSFT)",
  "tables": [
   "fact_daily_prices",
   "dim_company"
  ],
  "task": "For ticker MSFT, the month-end close (close on the last trading day of each month), the previous month's month-end close and the month-over-month change % (2 decimals). Return close_month ('YYYY-MM'), month_end_close, prev_month_close, mom_change_pct, oldest first. January has NULL prev values.",
  "hint": "ROW_NUMBER() OVER (PARTITION BY month ORDER BY date DESC) = 1 picks the last trading day; then LAG over months.",
  "sol": "WITH d AS (\n  SELECT strftime('%Y-%m', p.date) AS close_month, p.close,\n         ROW_NUMBER() OVER (PARTITION BY strftime('%Y-%m', p.date) ORDER BY p.date DESC) AS rn\n  FROM fact_daily_prices p\n  JOIN dim_company c ON c.company_id = p.company_id\n  WHERE c.ticker = 'MSFT'\n), m AS (\n  SELECT close_month, close AS month_end_close,\n         LAG(close) OVER (ORDER BY close_month) AS prev_month_close\n  FROM d WHERE rn = 1\n)\nSELECT close_month, month_end_close, prev_month_close,\n       ROUND(100.0 * (month_end_close - prev_month_close) / prev_month_close, 2) AS mom_change_pct\nFROM m\nORDER BY close_month;"
 }
];
const ED_KEY = "alpha_stock_editor_v1";
let edDb = null, edLoading = null, edCur = null, psLevel = "All", psTopic = "All", psTable = "All";
function edState() { try { const s = JSON.parse(lsGet(ED_KEY)); return s && s.solved ? s : { solved: {}, drafts: {} }; } catch (e) { return { solved: {}, drafts: {} }; } }
function edSave(s) { lsSet(ED_KEY, JSON.stringify(s)); }
const localDay = (d) => { const x = d || new Date(); return new Date(x.getTime() - x.getTimezoneOffset() * 60000).toISOString().slice(0, 10); };
function todaysProblems() {
  const day = Math.floor((Date.now() - new Date().getTimezoneOffset() * 60000) / 86400000);
  const pick = (lv, k) => { const L = PRACTICE_PROBLEMS.filter(p => p.level === lv); return L[(day * k) % L.length]; };
  return [pick("Easy", 1), pick("Medium", 3), pick("Advanced", 5)];
}
function solveDays() { const st = edState(); return new Set(Object.values(st.solved)); }
function solveStreak() {
  const set = solveDays(); let n = 0; const d = new Date();
  if (!set.has(localDay(d))) d.setDate(d.getDate() - 1);           // streak survives until today ends
  while (set.has(localDay(d))) { n++; d.setDate(d.getDate() - 1); }
  return n;
}
function loadSqlEngine() {
  if (edDb) return Promise.resolve(edDb);
  if (edLoading) return edLoading;
  edLoading = new Promise((res, rej) => {
    const go = () => window.initSqlJs({}).then(SQL => {
      const db = new SQL.Database(); const T = window.PRACTICE_DB || {};
      db.run("BEGIN");
      Object.entries(T).forEach(([name, t]) => {
        const types = t.cols.map((c, i) => { const vals = t.rows.map(r => r[i]).filter(v => v !== null); if (!vals.length || typeof vals[0] !== "number") return "TEXT"; return vals.every(Number.isInteger) && !/inr|rate|pct/.test(c) ? "INTEGER" : "REAL"; });
        db.run(`CREATE TABLE ${name} (${t.cols.map((c, i) => `"${c}" ${types[i]}`).join(", ")})`);
        const st = db.prepare(`INSERT INTO ${name} VALUES (${t.cols.map(() => "?").join(",")})`);
        t.rows.forEach(r => st.run(r)); st.free();
      });
      db.run("COMMIT"); edDb = db; res(db);
    }).catch(rej);
    const eng = () => { if (window.initSqlJs) go(); else { const s = document.createElement("script"); s.src = "assets/vendor/sql-asm.js"; s.onload = go; s.onerror = () => rej(new Error("Could not load the SQL engine")); document.head.appendChild(s); } };
    loadPracticeData().then(eng).catch(rej);
  });
  return edLoading;
}
let pdLoading = null;
function loadPracticeData() {
  if (window.PRACTICE_DB) return Promise.resolve();
  if (!pdLoading) pdLoading = new Promise((res, rej) => { const s = document.createElement("script"); s.src = "assets/practice-db.js?v=" + (window.SITE_V || "1"); s.onload = () => { res(); renderProblemset(); }; s.onerror = () => { pdLoading = null; rej(new Error("Could not load the practice tables")); }; document.head.appendChild(s); });
  return pdLoading;
}
function edRun(sql) { const res = edDb.exec(sql); return res.length ? res[res.length - 1] : { columns: [], values: [] }; }
function edNorm(r, ordered) {
  const rows = r.values.map(row => row.map(v => v === null ? "∅" : (typeof v === "number" ? (Math.round(v * 100) / 100).toFixed(2) : String(v).trim())).join("¦"));
  return ordered ? rows : rows.slice().sort();
}
function edTable(r) {
  if (!r.columns.length) return `<div class="ed-empty">Query ran. No rows returned.</div>`;
  const head = `<tr>${r.columns.map(c => `<th>${esc(c)}</th>`).join("")}</tr>`;
  const body = r.values.slice(0, 200).map(row => `<tr>${row.map(v => `<td>${v === null ? '<span class="ed-null">NULL</span>' : esc(typeof v === "number" ? (Number.isInteger(v) ? v.toLocaleString("en-IN") : (Math.round(v * 100) / 100).toLocaleString("en-IN")) : v)}</td>`).join("")}</tr>`).join("");
  return `<div class="ed-rowcount">${r.values.length} row${r.values.length === 1 ? "" : "s"}${r.values.length > 200 ? " (showing 200)" : ""}</div><div class="ed-table-wrap"><table class="dtable ed-table"><thead>${head}</thead><tbody>${body}</tbody></table></div>`;
}
const lvlBadge = (l) => `<span class="lvl lvl-${l.toLowerCase()}">${l === "Medium" ? "Med." : l === "Advanced" ? "Hard" : l}</span>`;

/* ---------------- Problemset (browse) ---------------- */
function renderProblemset() {
  const rowsEl = document.getElementById("ps-rows"); if (!rowsEl) return;
  const st = edState(); const solvedN = Object.keys(st.solved).length; const today = todaysProblems();
  document.getElementById("ps-progress").textContent = `${solvedN} / ${PRACTICE_PROBLEMS.length} Solved`;
  document.getElementById("ps-streak").textContent = `${solveStreak()} day streak · ${today.filter(p => st.solved[p.id]).length}/3 of today's set`;
  document.getElementById("ps-today-sub").textContent = today.map(p => p.t).join(" · ");
  const topics = ["All", ...new Set(PRACTICE_PROBLEMS.map(p => p.topic))];
  document.getElementById("ps-topics").innerHTML = topics.map(t => `<button class="ps-chip ${t === psTopic ? "on" : ""}" data-topic="${esc(t)}">${t === "All" ? "All Topics" : esc(t)} <small>(${t === "All" ? PRACTICE_PROBLEMS.length : PRACTICE_PROBLEMS.filter(p => p.topic === t).length})</small></button>`).join("");
  const tabs = ["All", "fact_daily_prices", "dim_company", "fact_trades_pnl_kpi", "fact_orders", "fact_trades", "fact_dividends"];
  const tlabel = { All: "All Tables", fact_daily_prices: "Daily Prices", dim_company: "Companies", fact_trades_pnl_kpi: "Realized P&L", fact_orders: "Orders", fact_trades: "Trades", fact_dividends: "Dividends" };
  document.getElementById("ps-tables").innerHTML = tabs.map(t => `<button class="ps-disc ${t === psTable ? "on" : ""}" data-tab="${t}">${tlabel[t]}</button>`).join("");
  document.getElementById("ps-levels").innerHTML = ["All", "Easy", "Medium", "Advanced"].map(l => `<button class="${l === psLevel ? "on" : ""}" data-lv="${l}">${l === "Advanced" ? "Hard" : l}</button>`).join("");
  const q = (document.getElementById("ps-search").value || "").toLowerCase(); const stf = document.getElementById("ps-status").value;
  const list = PRACTICE_PROBLEMS.map((p, i) => ({ ...p, n: i + 1 })).filter(p => (psLevel === "All" || p.level === psLevel) && (psTopic === "All" || p.topic === psTopic) && (psTable === "All" || p.tables.includes(psTable))
    && (!q || (p.n + " " + p.t + " " + p.task).toLowerCase().includes(q)) && (stf === "all" || (stf === "done") === !!st.solved[p.id]));
  rowsEl.innerHTML = list.length ? list.map(p => `<tr data-open="${p.id}">
      <td>${st.solved[p.id] ? '<span class="ps-st done">✓</span>' : '<span class="ps-st"></span>'}</td>
      <td><div class="ps-title">${p.n}. ${esc(p.t)}${today.some(x => x.id === p.id) ? ' <span class="ps-todaytag">TODAY</span>' : ""}</div><div class="ps-tags"><span class="ps-tag2">▤ SQL</span>${p.tables.map(t => `<span class="ps-tag2 grey">${t}</span>`).join("")}</div></td>
      <td class="ps-time">${p.mins} min</td><td>${lvlBadge(p.level)}</td><td class="ps-arrow">→</td></tr>`).join("")
    : `<tr><td colspan="5" class="ed-empty">No problems match these filters.</td></tr>`;
  rowsEl.querySelectorAll("[data-open]").forEach(r => r.addEventListener("click", () => openProblem(r.dataset.open)));
  document.querySelectorAll("#ps-topics [data-topic]").forEach(b => b.addEventListener("click", () => { psTopic = b.dataset.topic; renderProblemset(); }));
  document.querySelectorAll("#ps-tables [data-tab]").forEach(b => b.addEventListener("click", () => { psTable = b.dataset.tab; renderProblemset(); }));
  document.querySelectorAll("#ps-levels [data-lv]").forEach(b => b.addEventListener("click", () => { psLevel = b.dataset.lv; renderProblemset(); }));
  renderCalendar();
  const tl = document.getElementById("ps-tablelist");
  if (tl && !window.PRACTICE_DB) { tl.innerHTML = '<div class="ps-tl"><span>Loading tables…</span></div>'; loadPracticeData().catch(() => {}); }
  else if (tl) tl.innerHTML = Object.entries(window.PRACTICE_DB || {}).map(([n, t]) => `<div class="ps-tl"><code>${n}</code><span>${t.rows.length} rows · ${t.cols.length} cols</span></div>`).join("");
}
function renderCalendar() {
  const w = document.getElementById("ps-cal"); if (!w) return;
  const days = solveDays(); const now = new Date(); const y = now.getFullYear(), m = now.getMonth();
  const first = new Date(y, m, 1).getDay(), n = new Date(y, m + 1, 0).getDate(); const todayN = now.getDate();
  let cells = ""; for (let i = 0; i < first; i++) cells += "<span></span>";
  for (let d = 1; d <= n; d++) { const key = localDay(new Date(y, m, d)); cells += `<span class="${d === todayN ? "today" : ""} ${days.has(key) ? "solved" : ""}">${d}</span>`; }
  let last7 = 0; for (let i = 0; i < 7; i++) { const d = new Date(); d.setDate(d.getDate() - i); if (days.has(localDay(d))) last7++; }
  const solvedToday = days.has(localDay());
  w.innerHTML = `<div class="ps-cal-head"><span class="ps-fire">🔥</span><div><strong>${now.toLocaleDateString("en-IN", { month: "long", year: "numeric" }).toUpperCase()}</strong><small>${days.size} days solved · ${solveStreak()} day streak</small></div><span class="ps-badge ${solvedToday ? "ok" : ""}">${solvedToday ? "Done today" : "Not yet today"}</span></div>
    <div class="ps-cal-grid">${["S", "M", "T", "W", "T", "F", "S"].map(x => `<b>${x}</b>`).join("")}${cells}</div>
    <div class="ps-cal-foot"><span>Last 7 days</span><strong>${last7} / 7 Days</strong></div><div class="ps-cal-bar"><i style="width:${Math.round(last7 / 7 * 100)}%"></i></div>`;
}

/* ---------------- Solve view ---------------- */
function renderSchema() {
  const w = document.getElementById("ed-schema"); if (!w) return;
  const T = window.PRACTICE_DB || {};
  w.innerHTML = Object.entries(T).map(([n, t]) => `<details ${edCur && edCur.tables.includes(n) ? "open" : ""}><summary><code>${n}</code> <span>${t.rows.length} rows</span></summary><div class="ed-cols">${t.cols.map(c => `<button class="ed-col" data-ins="${c}">${c}</button>`).join("")}</div></details>`).join("");
  w.querySelectorAll("[data-ins]").forEach(b => b.addEventListener("click", () => { const ta = document.getElementById("ed-sql"); const p = ta.selectionStart; ta.value = ta.value.slice(0, p) + b.dataset.ins + ta.value.slice(ta.selectionEnd); ta.focus(); ta.selectionStart = ta.selectionEnd = p + b.dataset.ins.length; }));
}
function showBrowse() { const b = document.getElementById("ed-browse"), s = document.getElementById("ed-solve"); if (!b) return; b.style.display = ""; s.style.display = "none"; renderProblemset(); }
function openProblem(id) {
  initEditor();
  edCur = PRACTICE_PROBLEMS.find(p => p.id === id) || PRACTICE_PROBLEMS[0];
  document.getElementById("ed-browse").style.display = "none"; document.getElementById("ed-solve").style.display = "";
  const st = edState(); const idx = PRACTICE_PROBLEMS.indexOf(edCur);
  document.getElementById("ed-pos").textContent = `Problem ${idx + 1} of ${PRACTICE_PROBLEMS.length} · ${edCur.topic}`;
  document.getElementById("ed-title").innerHTML = `${lvlBadge(edCur.level)} ${idx + 1}. ${esc(edCur.t)} <span class="ed-mins">⏱ ${edCur.mins} min</span>${st.solved[edCur.id] ? ' <span class="ps-badge ok">Solved</span>' : ""}`;
  document.getElementById("ed-task").textContent = edCur.task;
  document.getElementById("ed-tables").innerHTML = "Tables: " + edCur.tables.map(t => `<code>${t}</code>`).join(" ");
  document.getElementById("ed-sql").value = st.drafts[edCur.id] || `-- ${edCur.t}\nSELECT *\nFROM ${edCur.tables[0]}\nLIMIT 10;`;
  document.getElementById("ed-out").innerHTML = `<div class="ed-empty">Write your query, then press <kbd>Run</kbd> (Ctrl + Enter) and <kbd>Submit</kbd>.</div>`;
  document.getElementById("ed-msg").innerHTML = "";
  renderSchema(); window.scrollTo({ top: 0, behavior: "auto" });
}
function edMsg(kind, html) { document.getElementById("ed-msg").innerHTML = `<div class="ed-msg ${kind}">${html}</div>`; }
function initEditor() {
  const run = document.getElementById("ed-run"); if (!run) return;
  if (run._b) { if (document.getElementById("ed-solve").style.display === "none") renderProblemset(); return; }
  run._b = true;
  const ta = document.getElementById("ed-sql");
  const withDb = (fn) => { edMsg("info", "⏳ Loading the SQL engine (first time only)…"); loadSqlEngine().then(() => { document.getElementById("ed-msg").innerHTML = ""; fn(); }).catch(e => edMsg("bad", "⚠ " + esc(e.message) + ". Open the site from a web server (or check your connection)."));
  };
  const doRun = () => withDb(() => { const st = edState(); st.drafts[edCur.id] = ta.value; edSave(st);
    try { document.getElementById("ed-out").innerHTML = edTable(edRun(ta.value)); } catch (e) { edMsg("bad", "❌ " + esc(e.message)); } });
  run.addEventListener("click", doRun);
  ta.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") { e.preventDefault(); doRun(); }
    if (e.key === "Tab") { e.preventDefault(); const p = ta.selectionStart; ta.value = ta.value.slice(0, p) + "  " + ta.value.slice(ta.selectionEnd); ta.selectionStart = ta.selectionEnd = p + 2; }
  });
  document.getElementById("ed-check").addEventListener("click", () => withDb(() => {
    let mine;
    try { mine = edRun(ta.value); } catch (e) { edMsg("bad", "❌ Your query has an error: " + esc(e.message)); return; }
    const exp = edRun(edCur.sol); document.getElementById("ed-out").innerHTML = edTable(mine);
    const ordered = /order\s+by[^()]*;?\s*$/i.test(edCur.sol);
    const ok = mine.columns.length === exp.columns.length && JSON.stringify(edNorm(mine, ordered)) === JSON.stringify(edNorm(exp, ordered));
    if (ok) { const st = edState(); if (!st.solved[edCur.id]) st.solved[edCur.id] = localDay(); st.drafts[edCur.id] = ta.value; edSave(st);
      const t3 = todaysProblems(); const done = t3.filter(p => st.solved[p.id]).length;
      edMsg("good", `✅ Correct · ${done} of 3 today · 🔥 ${solveStreak()} day streak`); renderHeroCards(); }
    else edMsg("bad", `✗ Not quite. Expected ${exp.values.length} row(s) × ${exp.columns.length} column(s); you returned ${mine.values.length} × ${mine.columns.length}. ${mine.columns.length === exp.columns.length ? "Check your values, rounding and filters." : "Check the columns you SELECT."}`);
  }));
  document.getElementById("ed-hint").addEventListener("click", () => edMsg("info", "💡 " + esc(edCur.hint)));
  document.getElementById("ed-solution").addEventListener("click", () => { ta.value = edCur.sol; edMsg("info", "🔓 Solution loaded. Run it and compare with your approach."); });
  document.getElementById("ed-reset").addEventListener("click", () => { const st = edState(); delete st.drafts[edCur.id]; edSave(st); openProblem(edCur.id); });
  document.getElementById("ed-back").addEventListener("click", showBrowse);
  const step = (k) => { const i = PRACTICE_PROBLEMS.indexOf(edCur); openProblem(PRACTICE_PROBLEMS[(i + k + PRACTICE_PROBLEMS.length) % PRACTICE_PROBLEMS.length].id); };
  document.getElementById("ed-prev").addEventListener("click", () => step(-1));
  document.getElementById("ed-next").addEventListener("click", () => step(1));
  document.getElementById("ps-search").addEventListener("input", renderProblemset);
  document.getElementById("ps-status").addEventListener("change", renderProblemset);
  document.getElementById("ps-random").addEventListener("click", () => { const st = edState(); const L = PRACTICE_PROBLEMS.filter(p => !st.solved[p.id]); const pool = L.length ? L : PRACTICE_PROBLEMS; openProblem(pool[Math.floor(Math.random() * pool.length)].id); });
  document.getElementById("ps-today-go").addEventListener("click", () => { const st = edState(); const t = todaysProblems(); openProblem((t.find(p => !st.solved[p.id]) || t[0]).id); });
  renderProblemset();
}

/* ---------------- Hero floating cards (DailySQL-style) ---------------- */
function renderHeroCards() {}
function renderDailyCard() { renderHeroCards(); }
function renderIntegrity() {}
document.addEventListener("DOMContentLoaded", () => {
  renderHeroCards(); renderIntegrity();
  document.querySelectorAll("[data-scroll]").forEach(b => b.addEventListener("click", () => { const t = document.getElementById(b.dataset.scroll); if (t) t.scrollIntoView({ behavior: "smooth", block: "start" }); }));
  document.querySelectorAll('.ds-announce [data-goto="editor"]').forEach(b => b.addEventListener("click", () => switchView("editor")));
});

/* open the editor when its tab is chosen (the site's own switchView doesn't know about it) */
(function () {
  const orig = window.switchView;
  if (typeof orig === "function") window.switchView = function (v) { orig.apply(this, arguments); if (v === "editor") initEditor(); };
  document.addEventListener("click", (ev) => { const b = ev.target.closest && ev.target.closest('[data-view="editor"],[data-goto="editor"]'); if (b) setTimeout(initEditor, 0); });
})();

})();
