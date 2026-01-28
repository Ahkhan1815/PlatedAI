from datetime import datetime, timezone
from bson import ObjectId
from werkzeug.security import generate_password_hash, check_password_hash


class User:
    def __init__(self, email, password_hash, _id=None, name='', created_at=None, allergies=None, health_conditions=None):
        self.email = email
        self.password_hash = password_hash
        self._id = str(_id) if _id else None
        self.name = name or ''
        self.created_at = created_at or datetime.now(timezone.utc)
        self.allergies = allergies or []
        self.health_conditions = health_conditions or []

    @staticmethod
    def create(email, password, name='', allergies=None, health_conditions=None):
        return User(
            email=email,
            password_hash=generate_password_hash(password),
            name=name,
            allergies=allergies or [],
            health_conditions=health_conditions or []
        )

    def verify_password(self, password):
        return check_password_hash(self.password_hash, password)

    def to_mongo(self):
        return {
            'email': self.email,
            'password': self.password_hash,
            'name': self.name,
            'created_at': self.created_at,
            'allergies': self.allergies,
            'health_conditions': self.health_conditions
        }

    def to_safe_dict(self):
        return {
            '_id': self._id,
            'email': self.email,
            'name': self.name,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'allergies': self.allergies,
            'health_conditions': self.health_conditions
        }

    @staticmethod
    def from_mongo(doc):
        if not doc:
            return None
        return User(
            email=doc.get('email'),
            password_hash=doc.get('password'),
            _id=doc.get('_id'),
            name=doc.get('name', ''),
            created_at=doc.get('created_at'),
            allergies=doc.get('allergies', []),
            health_conditions=doc.get('health_conditions', [])
        )
