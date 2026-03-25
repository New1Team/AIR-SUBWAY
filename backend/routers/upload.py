from pyspark.sql import SparkSession, Row
from fastapi import APIRouter, Depends
import pandas as pd
import os
from core.settings import settings
from core.constants import db_properties
from database.spark_session import get_spark
from schemas.spark_schema import FileList

router = APIRouter(
    prefix="/spark",
    tags=["spark"]
)

# 파일마다 컬럼 정할 수 있게 만들었습니다.
# 사용방법은 md로 넣어둘게요.
@router.post('/file_upload')
def read(fileCon: FileList, spark: SparkSession = Depends(get_spark)):
  current_path = os.path.dirname(os.path.abspath(__file__))
  data_path = os.path.join(current_path, "data")
  # all_files = os.listdir(data_path)
  for file_name, mappings in fileCon.file.items():
    file_path = os.path.join(data_path, file_name)
    if not os.path.exists(file_path):
      continue
    print(f"처리 중인 파일: {file_path}")

  df = pd.read_csv(file_path, encoding="utf8", header=0, thousands=',', quotechar='"', skipinitialspace=True)
  df.columns = df.columns.str.strip()
  cols = [m.source_col for m in mappings]
  newCols = {m.source_col: m.target_col for m in mappings}
  df2 = df[cols].copy()
  df2 = df2.rename(columns=newCols)
  print("df2:  ",df2)
  sDf = spark.createDataFrame(df2)
      
  # 테이블 생성 및 적재
  try:
    sDf.write.jdbc(
        url=f"{settings.db_url}?useUnicode=true&characterEncoding=UTF-8&sessionVariables=sql_mode='ANSI_QUOTES'",
        table="holiday_check",
        mode="overwrite",
        # 처음 테이블 생성 때는 overwrite, 추가할 땐 아래 append문
        properties=db_properties
    )
    print(f"{file_name} 적재 완료")
  except Exception as e:
    print(f" 적재실패: {e}")

  check_df = spark.read.jdbc(settings.db_url, table="coordinate", properties=db_properties)
  print("개수 ", check_df.count())
  check_df.show()
  return {'message': '적재 성공'}