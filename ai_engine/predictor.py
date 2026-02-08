import pandas as pd
import json
import sys
import os

def predict_demand(data):
    feedbacks = data.get('feedbacks', [])
    waste = data.get('waste', [])
    attendance = data.get('attendance', [])
    student_count = data.get('student_count', 200) # Default to 200 if not provided
    
    if not feedbacks:
        return {
            "meal_name": "No Data",
            "demand_percentage": 0,
            "cook_quantity": 0,
            "reason": "No feedback data available yet."
        }

    df_feed = pd.DataFrame(feedbacks)
    
    # Calculate average rating and popularity
    meal_stats = df_feed.groupby('mealName').agg({
        'rating': 'mean',
        'id': 'count'
    }).rename(columns={'id': 'vote_count'})
    
    # Find the "Top Performing" meal
    top_meal_name = meal_stats['rating'].idxmax()
    top_rating = meal_stats.loc[top_meal_name, 'rating']
    
    # Calculate Participation Rate (Simulated if attendance is empty)
    if attendance:
        df_att = pd.DataFrame(attendance)
        # Filter for the top meal type (e.g., if it's Lunch, how many came?)
        # For simplicity, we'll use a general participation rate
        presents = df_att.groupby('dateStr')['studentId'].nunique().mean()
        participation_rate = (presents / student_count) if student_count > 0 else 0.5
    else:
        # Fallback based on rating: High rating = High participation
        participation_rate = (top_rating / 5.0) * 0.95 

    demand_pct = round(participation_rate * 100)
    
    # Recommended Cook Quantity
    avg_portion = 0.4 # 400g per student
    base_quantity = (student_count * participation_rate) * avg_portion
    
    # Buffer based on waste (if waste > 10kg, reduce buffer)
    recent_waste = sum([item['amount'] for item in waste[-3:]]) / 3 if waste else 5
    buffer = 5 if recent_waste < 10 else 2
    
    cook_qty = round(base_quantity + buffer)

    return {
        "meal_name": top_meal_name,
        "demand_percentage": demand_pct,
        "cook_quantity": cook_qty,
        "rating": round(top_rating, 1),
        "reason": f"Highest rated meal ({round(top_rating, 1)}★) with strong participation trends."
    }

if __name__ == "__main__":
    try:
        if len(sys.argv) > 1:
            input_file = sys.argv[1]
            with open(input_file, 'r') as f:
                input_data = json.load(f)
            result = predict_demand(input_data)
            print(json.dumps(result))
        else:
            print(json.dumps({"error": "No input file provided"}))
    except Exception as e:
        print(json.dumps({"error": str(e)}))
