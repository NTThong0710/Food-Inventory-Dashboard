import joblib
import sklearn
print("Current sklearn version:", sklearn.__version__)
try:
    vectorizer = joblib.load('tfidf_vectorizer.pkl')
    print("Loaded vectorizer successfully.")
    print("Vectorizer attributes:", dir(vectorizer))
    if hasattr(vectorizer, 'idf_'):
        print("Has idf_")
    else:
        print("Does NOT have idf_")
except Exception as e:
    print("Error:", e)
