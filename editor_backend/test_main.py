import os
import json
import tempfile
from unittest.mock import patch
from fastapi.testclient import TestClient

from main import app, DIRECTORY

client = TestClient(app)

@patch('main.DIRECTORY', new_callable=tempfile.mkdtemp)
def test_api_contacts_and_deploy(tmp_dir):
    # Load sample data
    geojson_data = {
        "type": "FeatureCollection",
        "features": [
            {
                "type": "Feature",
                "id": "1",
                "geometry": {"type": "Point", "coordinates": [6.0, 50.0]},
                "properties": {
                    "name": "Test User (Test Institution)",
                    "group": "Forschung"
                }
            }
        ]
    }

    # Touch contacts.geojson first because encrypt function needs it
    with open(os.path.join(tmp_dir, "contacts.geojson"), "w") as f:
        json.dump(geojson_data, f)

    # Authenticate with default credentials
    auth = ("florian", "AquaRevier2026")

    # Test POST /api/contacts
    response = client.post("/api/contacts", json=geojson_data, auth=auth)
    assert response.status_code == 200
    assert response.json()["status"] == "success"

    # Test file updates
    with open(os.path.join(tmp_dir, "contacts.geojson"), "r") as f:
        saved_data = json.load(f)
        assert saved_data["features"][0]["properties"]["name"] == "Test User (Test Institution)"

    with open(os.path.join(tmp_dir, "contacts_anonymized.geojson"), "r") as f:
        anon_data = json.load(f)
        assert anon_data["features"][0]["properties"]["name"] == "Test Institution"

    assert os.path.exists(os.path.join(tmp_dir, "contacts.enc"))

    # Test POST /api/deploy with dry_run to avoid git operations
    response = client.post("/api/deploy", json={"dry_run": True}, auth=auth)
    assert response.status_code == 200
    assert response.json()["status"] == "success"
