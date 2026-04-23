import os
import pandas as pd
from datetime import datetime, timedelta
from supabase import create_client, Client

# Code rình bắt 2 cài Variable mà Github sẽ tự pass vào
url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_KEY")
supabase: Client = create_client(url, key)

print("Đang móc Database...")
response = supabase.table("inventory_transactions") \
    .select("ingredient_sku, quantity, created_at") \
    .in_("transaction_type", ["OUT_SALES", "OUT_SPOILAGE", "OUT_WASTE"]) \
    .execute()

raw_data = response.data

if not raw_data:
    print("Tạm hoãn! Kho hàng chưa từng có hạt gạo nào bay hơi.")
else:
    print("Vào việc! Xử lý Time Series...")
    df = pd.DataFrame(raw_data)
    df['date'] = pd.to_datetime(df['created_at']).dt.date
    daily_usage = df.groupby(['ingredient_sku', 'date'])['quantity'].sum().reset_index()
    
    upsert_records = []
    today = datetime.utcnow().date()
    future_dates = [(today + timedelta(days=i)) for i in range(1, 8)]
    
    unique_skus = daily_usage['ingredient_sku'].unique()
    
    for sku in unique_skus:
        sku_data = daily_usage[daily_usage['ingredient_sku'] == sku].sort_values('date')
        recent_avg = sku_data['quantity'].tail(14).mean()
        
        if pd.isna(recent_avg) or recent_avg == 0:
            continue
            
        margin = recent_avg * 0.15 
        
        for f_date in future_dates:
            upsert_records.append({
                "ingredient_sku": sku,
                "forecast_date": f_date.isoformat(),
                "predicted_quantity": round(recent_avg, 2),
                "confidence_lower": max(0, round(recent_avg - margin, 2)),
                "confidence_upper": round(recent_avg + margin, 2)
            })
            
    if upsert_records:
        supabase.table("ai_forecasts").upsert(upsert_records).execute()
        print(f"THÀNH CÔNG RỰC RỠ: Ẵm trọn {len(upsert_records)} dự báo nạp lên DB!")
