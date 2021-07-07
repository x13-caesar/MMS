import json
from bean import Vendor

class VendorDao():
    def __init__(self, session):
        self.session = session

    def get_vendors(self):
        result = self.session.query(Vendor).all()
        json_result = json.dumps([r.to_json() for r in result])
        return json_result

