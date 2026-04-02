from pydantic import BaseModel
from typing import List, Dict

# 파일별 컬럼 매핑 모델
class ColsMapping(BaseModel):
  # 원본 컬럼명
  source_col:str
  # 변경할 컬럼명
  target_col:str
# 파일명, 매핑리스트 모델
class FileList(BaseModel):
  file: Dict[str, List[ColsMapping]]

class SearchRequest(BaseModel):
  keyword: str