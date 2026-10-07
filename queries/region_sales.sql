-- 脱敏示例查询，不对应真实表结构。
-- 参数约束：start_date = end_date，region 必须来自区域字典。
SELECT
    stat_date,
    region,
    city,
    SUM(paid_sales_amount) AS paid_sales_amount,
    SUM(valid_sessions) AS valid_sessions,
    SUM(paid_orders) AS paid_orders
FROM demo_daily_city_metrics
WHERE stat_date BETWEEN :comparison_date AND :current_date
  AND region = :region
GROUP BY stat_date, region, city
ORDER BY stat_date, paid_sales_amount DESC;
