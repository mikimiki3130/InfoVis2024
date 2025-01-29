import pandas as pd
import json

# Excelファイルを読み込む（最初の行を無視し、2行目と3行目をヘッダーとして扱う）
file_path = 'data.xlsx'  # Excelファイルのパスを指定してください
df = pd.read_excel(file_path, header=[0, 1])

# 列名に余分な空白がある場合に備えて、MultiIndexの各レベルをトリミング
df.columns = pd.MultiIndex.from_tuples(
    [(str(col[0]).strip(), str(col[1]).strip()) for col in df.columns]
)

# '月'列を正しく指定（MultiIndexの場合はタプルでアクセス）
month_col = ('Unnamed: 0_level_0', '月')

# 空白行を削除（'月'列がNaNの場合を削除）
df = df[df[month_col].notna()]

# JSON形式に変換するためのデータを準備
json_data = []

# 各行（各月）ごとのデータを整理
for _, row in df.iterrows():
    month = row[month_col]  # 月の値を取得
    for region in df.columns.get_level_values(0).unique():
        if region == 'Unnamed: 0_level_0':  # 月列をスキップ
            continue
        entry = {"region": region, "month": int(month)}
        
        # 各変数ごとの値を追加
        for variable in df.columns.get_level_values(1).unique():
            if (region, variable) in df.columns:
                entry[variable] = row[(region, variable)]
        
        json_data.append(entry)

# JSONデータをファイルに保存
output_file = 'data.json'
with open(output_file, 'w', encoding='utf-8') as f:
    json.dump(json_data, f, ensure_ascii=False, indent=4)

print(f"JSON形式に変換し、{output_file} に保存しました。")
