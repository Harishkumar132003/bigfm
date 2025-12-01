import pandas as pd
import sys
import os    

file_path = '/home/wizzgeeks/Downloads/step7_Market Share Analysis Nov 25.xlsx'
output_dir = "/home/wizzgeeks/Downloads/Split files"

os.makedirs(output_dir, exist_ok=True)
xls = pd.ExcelFile(file_path)

for sheet in xls.sheet_names:
    df = pd.read_excel(xls, sheet_name=sheet)
    out = os.path.join(output_dir, f"{sheet}.xlsx")  
    df.to_excel(out, index=False)
    print("Exported:", out)
