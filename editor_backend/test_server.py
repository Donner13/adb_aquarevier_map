import unittest
import threading
import http.server
import socketserver
import time
import requests
import json
import os
import shutil
import tempfile

# We will monkeypatch DIRECTORY in server.py before starting the server
import server

class TestEditorBackend(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        # Create a temporary directory for test files to avoid overwriting real data
        cls.test_dir = tempfile.mkdtemp()

        # Write dummy initial files so encrypt_geojson_file can read contacts.geojson if needed, though POST overwrites it

        with open(os.path.join(cls.test_dir, 'contacts.geojson'), 'w') as f:
            f.write("{}")
        with open(os.path.join(cls.test_dir, 'encrypt_contacts.js'), 'w') as f:
            f.write("const fs = require('fs'); fs.writeFileSync('contacts.enc', 'dummy');")

        # Monkeypatch the server's DIRECTORY
        server.DIRECTORY = cls.test_dir

        socketserver.TCPServer.allow_reuse_address = True
        cls.HTTPD = socketserver.TCPServer(("127.0.0.1", int(os.environ.get("PORT", server.PORT))), server.CustomHTTPRequestHandler)

        cls.SERVER_THREAD = threading.Thread(target=cls.HTTPD.serve_forever)
        cls.SERVER_THREAD.daemon = True
        cls.SERVER_THREAD.start()
        time.sleep(1) # wait for server to start

    @classmethod
    def tearDownClass(cls):
        if cls.HTTPD:
            cls.HTTPD.shutdown()
            cls.HTTPD.server_close()

        # Clean up temporary directory
        shutil.rmtree(cls.test_dir)

    def test_contacts_endpoint(self):
        url = f"http://127.0.0.1:{server.PORT}/api/contacts"
        payload = {
            "type": "FeatureCollection",
            "styleSettings": {
                "groupColors": {"TestGroup": "#ffffff"},
                "groupNames": {"TestGroup": "Test Group"}
            },
            "features": [
                {
                    "type": "Feature",
                    "id": "test-1",
                    "geometry": {"type": "Point", "coordinates": [0, 0]},
                    "properties": {
                        "name": "Test Contact",
                        "group": "TestGroup"
                    }
                }
            ]
        }

        response = requests.post(url, json=payload, auth=(server.EDITOR_USER, server.EDITOR_PASSWORD))
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["status"], "success")

        # Verify files were created in temp dir
        self.assertTrue(os.path.exists(os.path.join(self.test_dir, "contacts.geojson")))
        self.assertTrue(os.path.exists(os.path.join(self.test_dir, "contacts_anonymized.geojson")))
        self.assertTrue(os.path.exists(os.path.join(self.test_dir, "contacts.enc")))

        # Check content of contacts.geojson
        with open(os.path.join(self.test_dir, "contacts.geojson"), "r") as f:
            saved_data = json.load(f)
            self.assertEqual(saved_data["features"][0]["properties"]["name"], "Test Contact")

    def test_deploy_endpoint_dry_run(self):
        # Set DRY_RUN
        os.environ["DRY_RUN"] = "true"
        url = f"http://127.0.0.1:{server.PORT}/api/deploy"

        response = requests.post(url, auth=(server.EDITOR_USER, server.EDITOR_PASSWORD))
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["status"], "success")
        self.assertIn("DRY RUN", data["output"])

    def test_requires_auth(self):
        url = f"http://127.0.0.1:{server.PORT}/api/deploy"
        response = requests.post(url)  # no credentials
        self.assertEqual(response.status_code, 401)

if __name__ == "__main__":
    unittest.main()
