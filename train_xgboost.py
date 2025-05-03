import os
import joblib
import numpy as np
import pandas as pd
import xgboost as xgb
import matplotlib.pyplot as plt
from sklearn.model_selection import train_test_split, RandomizedSearchCV
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import classification_report, confusion_matrix, f1_score
from imblearn.over_sampling import SMOTE
from collections import Counter
import json

# === Paths ===
script_dir = os.path.dirname(__file__)
csv_path = os.path.join(script_dir, "eco_dataset.csv")
model_dir = os.path.join(script_dir, "ml_model")
encoders_dir = os.path.join(model_dir, "xgb_encoders")
os.makedirs(encoders_dir, exist_ok=True)

# === Load and preprocess dataset ===
column_names = ["title", "material", "weight", "transport", "recyclability", "true_eco_score", "co2_emissions", "origin"]
df = pd.read_csv(csv_path, header=None, names=column_names, quotechar='"')
df = df[df["true_eco_score"].isin(["A+", "A", "B", "C", "D", "E", "F"])].dropna()

for col in ["material", "transport", "recyclability", "origin"]:
    df[col] = df[col].astype(str).str.title().str.strip()

df["weight"] = pd.to_numeric(df["weight"], errors="coerce")
df.dropna(subset=["weight"], inplace=True)
df["weight_log"] = np.log1p(df["weight"])
df["weight_bin"] = pd.cut(df["weight"], bins=[0, 0.5, 2, 10, 100], labels=[0, 1, 2, 3])

# === Feature interactions ===
df["material_transport"] = df["material"] + "_" + df["transport"]
df["origin_recycle"] = df["origin"] + "_" + df["recyclability"]

# === Encode features ===
encoders = {
    'material': LabelEncoder(),
    'transport': LabelEncoder(),
    'recyclability': LabelEncoder(),
    'origin': LabelEncoder(),
    'label': LabelEncoder(),
    'weight_bin': LabelEncoder(),
    'material_transport': LabelEncoder(),
    'origin_recycle': LabelEncoder()
}

for key in encoders:
    col_name = key if key != "label" else "true_eco_score"
    df[f"{key}_encoded"] = encoders[key].fit_transform(df[col_name].astype(str))

# === Features and target ===
X = df[[
    "material_encoded", "transport_encoded", "recyclability_encoded", "origin_encoded",
    "weight_log", "weight_bin_encoded",
    "material_transport_encoded", "origin_recycle_encoded"
]].astype(float)

y = df["label_encoded"]

# === Balance dataset ===
X_balanced, y_balanced = SMOTE(random_state=42).fit_resample(X, y)

# === Train/test split ===
X_train, X_test, y_train, y_test = train_test_split(
    X_balanced, y_balanced, test_size=0.2, random_state=42, stratify=y_balanced
)

# === Class weights ===
counter = Counter(y_balanced)
total = sum(counter.values())
class_weights = {k: total / v for k, v in counter.items()}
sample_weights = [class_weights[i] for i in y_train]

# === Base model ===
base_model = xgb.XGBClassifier(
    use_label_encoder=False,
    eval_metric="mlogloss",
    n_estimators=300,
    max_depth=7,
    learning_rate=0.08,
    subsample=0.85,
    colsample_bytree=0.85,
    random_state=42
)

# === Optional: Hyperparameter search ===
params = {
    "n_estimators": [200, 300, 400],
    "max_depth": [6, 7, 8],
    "learning_rate": [0.05, 0.08, 0.1],
    "subsample": [0.7, 0.85, 1.0],
    "colsample_bytree": [0.7, 0.85, 1.0]
}
search = RandomizedSearchCV(base_model, params, scoring="f1_macro", n_iter=10, cv=3, verbose=1)
search.fit(X_train, y_train, sample_weight=sample_weights)
model = search.best_estimator_

# === Evaluate model ===
y_pred = model.predict(X_test)
acc = model.score(X_test, y_test)
f1 = f1_score(y_test, y_pred, average="macro")
report = classification_report(y_test, y_pred, target_names=encoders['label'].classes_, output_dict=True)
print("✅ Accuracy:", acc)
print(classification_report(y_test, y_pred, target_names=encoders['label'].classes_))

# === Feature importance ===
importance = model.feature_importances_
feature_names = X.columns.tolist()

plt.figure(figsize=(6, 4))
plt.barh(feature_names, importance)
plt.xlabel("Feature Importance")
plt.title("XGBoost Feature Importance")
plt.tight_layout()
importance_path = os.path.join(model_dir, "xgb_feature_importance.png")
plt.savefig(importance_path)
plt.close()
print(f"✅ Feature importance plot saved at {importance_path}")

# === Save model and encoders ===
model.save_model(os.path.join(model_dir, "xgb_model.json"))
for name, encoder in encoders.items():
    joblib.dump(encoder, os.path.join(encoders_dir, f"{name}_encoder.pkl"))
print("✅ Model and encoders saved successfully!")

# === Save metrics ===
metrics = {
    "accuracy": round(acc, 4),
    "f1_score": round(f1, 4),
    "labels": list(encoders['label'].classes_),
    "confusion_matrix": confusion_matrix(y_test, y_pred).tolist(),
    "report": report,
    "per_class_f1": [round(report[label]["f1-score"], 4) for label in encoders['label'].classes_]
}
with open(os.path.join(model_dir, "xgb_metrics.json"), "w") as f:
    json.dump(metrics, f, indent=2)
print("✅ Saved model metrics to xgb_metrics.json")
