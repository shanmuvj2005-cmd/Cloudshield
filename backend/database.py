import asyncio
import json
import os
import copy
import re
from typing import Dict, Any, List, Optional
from datetime import datetime
from backend.config import settings

class EmbeddedAsyncCursor:
    def __init__(self, items: List[Dict[str, Any]]):
        self._items = items
        self._sort_key = None
        self._sort_dir = 1
        self._skip = 0
        self._limit = None

    def sort(self, key_or_list, direction=1):
        if isinstance(key_or_list, list):
            if key_or_list:
                self._sort_key, self._sort_dir = key_or_list[0]
        else:
            self._sort_key = key_or_list
            self._sort_dir = direction
        return self

    def skip(self, n: int):
        self._skip = n
        return self

    def limit(self, n: int):
        self._limit = n
        return self

    async def to_list(self, length: Optional[int] = None) -> List[Dict[str, Any]]:
        result = list(self._items)
        if self._sort_key:
            reverse = self._sort_dir < 0
            def get_sort_val(doc):
                val = doc.get(self._sort_key)
                if val is None:
                    return ""
                return val
            result.sort(key=get_sort_val, reverse=reverse)
        
        if self._skip:
            result = result[self._skip:]
        
        limit_to_apply = self._limit if self._limit is not None else length
        if limit_to_apply is not None:
            result = result[:limit_to_apply]
            
        return copy.deepcopy(result)

    def __aiter__(self):
        self._iter_data = iter(self._items)
        return self

    async def __anext__(self):
        try:
            return next(self._iter_data)
        except StopIteration:
            raise StopAsyncIteration


class EmbeddedAsyncCollection:
    def __init__(self, name: str, parent_db):
        self.name = name
        self.db = parent_db
        self.docs: List[Dict[str, Any]] = []

    def _matches_filter(self, doc: Dict[str, Any], query: Dict[str, Any]) -> bool:
        if not query:
            return True
        for k, v in query.items():
            if k == "$or" and isinstance(v, list):
                if not any(self._matches_filter(doc, subq) for subq in v):
                    return False
                continue
            if k == "$and" and isinstance(v, list):
                if not all(self._matches_filter(doc, subq) for subq in v):
                    return False
                continue

            doc_val = doc.get(k)
            if isinstance(v, dict):
                # Handle operators: $in, $gt, $gte, $lt, $lte, $ne, $regex
                for op, op_val in v.items():
                    if op == "$in" and doc_val not in op_val:
                        return False
                    elif op == "$nin" and doc_val in op_val:
                        return False
                    elif op == "$ne" and doc_val == op_val:
                        return False
                    elif op == "$gt" and not (doc_val is not None and doc_val > op_val):
                        return False
                    elif op == "$gte" and not (doc_val is not None and doc_val >= op_val):
                        return False
                    elif op == "$lt" and not (doc_val is not None and doc_val < op_val):
                        return False
                    elif op == "$lte" and not (doc_val is not None and doc_val <= op_val):
                        return False
                    elif op == "$regex":
                        pattern = op_val
                        if not (isinstance(doc_val, str) and re.search(pattern, doc_val, re.IGNORECASE)):
                            return False
            else:
                if doc_val != v:
                    return False
        return True

    def find(self, query: Optional[Dict[str, Any]] = None, projection: Optional[Dict[str, Any]] = None):
        query = query or {}
        matched = [d for d in self.docs if self._matches_filter(d, query)]
        return EmbeddedAsyncCursor(matched)

    async def find_one(self, query: Optional[Dict[str, Any]] = None) -> Optional[Dict[str, Any]]:
        query = query or {}
        for d in self.docs:
            if self._matches_filter(d, query):
                return copy.deepcopy(d)
        return None

    async def insert_one(self, doc: Dict[str, Any]):
        doc_copy = copy.deepcopy(doc)
        if "id" not in doc_copy and "_id" not in doc_copy:
            import uuid
            doc_copy["id"] = str(uuid.uuid4())
        self.docs.append(doc_copy)
        self.db.schedule_save()
        return type("InsertResult", (), {"inserted_id": doc_copy.get("id") or doc_copy.get("_id")})()

    async def insert_many(self, docs: List[Dict[str, Any]]):
        ids = []
        for d in docs:
            res = await self.insert_one(d)
            ids.append(res.inserted_id)
        return type("InsertManyResult", (), {"inserted_ids": ids})()

    async def update_one(self, query: Dict[str, Any], update: Dict[str, Any]):
        for d in self.docs:
            if self._matches_filter(d, query):
                if "$set" in update:
                    for k, v in update["$set"].items():
                        d[k] = copy.deepcopy(v)
                else:
                    d.update(copy.deepcopy(update))
                self.db.schedule_save()
                return type("UpdateResult", (), {"matched_count": 1, "modified_count": 1})()
        return type("UpdateResult", (), {"matched_count": 0, "modified_count": 0})()

    async def delete_many(self, query: Dict[str, Any]):
        before = len(self.docs)
        self.docs = [d for d in self.docs if not self._matches_filter(d, query)]
        deleted = before - len(self.docs)
        if deleted > 0:
            self.db.schedule_save()
        return type("DeleteResult", (), {"deleted_count": deleted})()

    async def count_documents(self, query: Optional[Dict[str, Any]] = None) -> int:
        query = query or {}
        return sum(1 for d in self.docs if self._matches_filter(d, query))


class EmbeddedAsyncDatabase:
    def __init__(self, state_file_path: str):
        self.state_file_path = state_file_path
        self.collections: Dict[str, EmbeddedAsyncCollection] = {}
        self._load()

    def __getitem__(self, name: str) -> EmbeddedAsyncCollection:
        if name not in self.collections:
            self.collections[name] = EmbeddedAsyncCollection(name, self)
        return self.collections[name]

    def _load(self):
        if os.path.exists(self.state_file_path):
            try:
                with open(self.state_file_path, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    for coll_name, docs in data.items():
                        coll = self[coll_name]
                        coll.docs = docs
            except Exception as e:
                print(f"[EmbeddedDB] Warning: could not load state file {self.state_file_path}: {e}")

    def schedule_save(self):
        try:
            os.makedirs(os.path.dirname(self.state_file_path), exist_ok=True)
            data = {k: coll.docs for k, coll in self.collections.items()}
            with open(self.state_file_path, "w", encoding="utf-8") as f:
                json.dump(data, f, default=str, indent=2)
        except Exception as e:
            print(f"[EmbeddedDB] Error writing state: {e}")


class DatabaseManager:
    def __init__(self):
        self.mode: str = "uninitialized"  # "mongo" or "embedded"
        self.db = None
        self._mongo_client = None

    async def init(self):
        # Attempt connection to MongoDB first
        try:
            from motor.motor_asyncio import AsyncIOMotorClient
            client = AsyncIOMotorClient(settings.MONGODB_URI, serverSelectionTimeoutMS=1500)
            # ping server to test connectivity
            await client.admin.command('ping')
            self._mongo_client = client
            self.db = client[settings.DATABASE_NAME]
            self.mode = "mongo"
            print(f"[DatabaseManager] Connected successfully to Live MongoDB ({settings.MONGODB_URI})")
        except Exception as e:
            # Fallback smoothly to Embedded Async Database
            state_file = os.path.abspath(os.path.join(os.path.dirname(__file__), "data", "db_state.json"))
            self.db = EmbeddedAsyncDatabase(state_file)
            self.mode = "embedded"
            print(f"[DatabaseManager] MongoDB not available ({e}). Using Resilient Embedded In-Memory/JSON Database at {state_file}")

    def get_collection(self, name: str):
        if self.db is None:
            raise RuntimeError("Database not initialized. Call db_manager.init() first.")
        return self.db[name]

db_manager = DatabaseManager()
