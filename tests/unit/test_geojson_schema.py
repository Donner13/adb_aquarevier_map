import unittest
import threading
import socketserver
import time
import requests
import json
import os
import shutil
import tempfile
import sys
from unittest.mock import patch

# Add the parent directory of editor_backend to sys.path to allow imports
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

import editor_backend.server as server

class TestGeoJSONSchemaValidation(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.test_dir = tempfile.mkdtemp()
        server.DIRECTORY = cls.test_dir
        socketserver.TCPServer.allow_reuse_address = True
        # Use port 0 to bind to an arbitrary available port
        cls.HTTPD = socketserver.TCPServer(("127.0.0.1", 0), server.CustomHTTPRequestHandler)
        cls.port = cls.HTTPD.server_address[1]
        cls.SERVER_THREAD = threading.Thread(target=cls.HTTPD.serve_forever)
        cls.SERVER_THREAD.daemon = True
        cls.SERVER_THREAD.start()
        time.sleep(0.5)

    @classmethod
    def tearDownClass(cls):
        if cls.HTTPD:
            cls.HTTPD.shutdown()
            cls.HTTPD.server_close()
        shutil.rmtree(cls.test_dir)

    def _post_payload(self, payload):
        url = f"http://127.0.0.1:{self.port}/api/contacts"
        return requests.post(url, json=payload, auth=(server.EDITOR_USER, server.EDITOR_PASSWORD))

    @patch('editor_backend.server.encrypt_geojson_file', return_value=True)
    def test_valid_geojson(self, mock_encrypt):
        payload = {
            "type": "FeatureCollection",
            "features": [
                {
                    "type": "Feature",
                    "geometry": {"type": "Point", "coordinates": [8.0, 51.0]},
                    "properties": {}
                }
            ]
        }
        resp = self._post_payload(payload)
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.json()["status"], "success")

    def test_invalid_type(self):
        payload = {
            "type": "Feature",
            "features": []
        }
        resp = self._post_payload(payload)
        self.assertEqual(resp.status_code, 400)
        self.assertIn("Invalid GeoJSON FeatureCollection", resp.json()["message"])

    def test_missing_features(self):
        payload = {
            "type": "FeatureCollection"
        }
        resp = self._post_payload(payload)
        self.assertEqual(resp.status_code, 400)
        self.assertIn("Invalid GeoJSON FeatureCollection", resp.json()["message"])

    def test_features_not_list(self):
        payload = {
            "type": "FeatureCollection",
            "features": {}
        }
        resp = self._post_payload(payload)
        self.assertEqual(resp.status_code, 400)
        self.assertIn("Invalid GeoJSON FeatureCollection", resp.json()["message"])

    def test_invalid_coordinates_not_list(self):
        payload = {
            "type": "FeatureCollection",
            "features": [
                {
                    "type": "Feature",
                    "geometry": {"type": "Point", "coordinates": "8.0, 51.0"},
                    "properties": {}
                }
            ]
        }
        resp = self._post_payload(payload)
        self.assertEqual(resp.status_code, 400)
        self.assertIn("Invalid geometry coordinates", resp.json()["message"])

    def test_invalid_coordinates_too_short(self):
        payload = {
            "type": "FeatureCollection",
            "features": [
                {
                    "type": "Feature",
                    "geometry": {"type": "Point", "coordinates": [8.0]},
                    "properties": {}
                }
            ]
        }
        resp = self._post_payload(payload)
        self.assertEqual(resp.status_code, 400)
        self.assertIn("Invalid geometry coordinates", resp.json()["message"])

    def test_invalid_coordinates_type(self):
        payload = {
            "type": "FeatureCollection",
            "features": [
                {
                    "type": "Feature",
                    "geometry": {"type": "Point", "coordinates": ["8.0", "51.0"]},
                    "properties": {}
                }
            ]
        }
        resp = self._post_payload(payload)
        self.assertEqual(resp.status_code, 400)
        self.assertIn("Invalid geometry coordinates", resp.json()["message"])

    def test_missing_coordinates(self):
        payload = {
            "type": "FeatureCollection",
            "features": [
                {
                    "type": "Feature",
                    "geometry": {"type": "Point"},
                    "properties": {}
                }
            ]
        }
        resp = self._post_payload(payload)
        self.assertEqual(resp.status_code, 400)
        self.assertIn("Invalid geometry coordinates", resp.json()["message"])



    def test_missing_feature_properties(self):
        payload = {
            "type": "FeatureCollection",
            "features": [
                {
                    "type": "Feature",
                    "geometry": {"type": "Point", "coordinates": [8.0, 51.0]}
                }
            ]
        }
        resp = self._post_payload(payload)
        self.assertEqual(resp.status_code, 400)
        self.assertIn("Invalid GeoJSON Feature", resp.json()["message"])

    def test_invalid_feature_type(self):
        payload = {
            "type": "FeatureCollection",
            "features": [
                {
                    "type": "InvalidType",
                    "geometry": {"type": "Point", "coordinates": [8.0, 51.0]},
                    "properties": {}
                }
            ]
        }
        resp = self._post_payload(payload)
        self.assertEqual(resp.status_code, 400)
        self.assertIn("Invalid GeoJSON Feature", resp.json()["message"])

if __name__ == '__main__':
    unittest.main()
