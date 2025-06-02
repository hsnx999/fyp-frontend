/*
  # Add trend data function

  Creates a function to calculate trend data for patients and reports over different time intervals.

  1. Function Details
    - Name: get_trend_data
    - Parameters:
      - start_date: timestamp
      - trend_interval: text ('day', 'week', or 'month')
    - Returns: Table with date, patient count, and report count
*/

CREATE OR REPLACE FUNCTION get_trend_data(start_date timestamp, trend_interval text)
RETURNS TABLE (
  date text,
  patients bigint,
  reports bigint
) AS $$
BEGIN
  RETURN QUERY
  WITH intervals AS (
    SELECT
      date_trunc(trend_interval, dd)::date AS interval_date
    FROM generate_series(
      start_date::timestamp,
      now(),
      ('1 ' || trend_interval)::interval
    ) dd
  )
  SELECT
    to_char(i.interval_date, 'Mon DD') as date,
    count(DISTINCT p.id) as patients,
    count(DISTINCT r.id) as reports
  FROM intervals i
  LEFT JOIN patients p ON date_trunc(trend_interval, p.created_at::timestamp) = i.interval_date
  LEFT JOIN reports r ON date_trunc(trend_interval, r.created_at::timestamp) = i.interval_date
  GROUP BY i.interval_date
  ORDER BY i.interval_date;
END;
$$ LANGUAGE plpgsql;