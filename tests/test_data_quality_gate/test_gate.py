import unittest
import json
import os
import subprocess
import sys

class TestDataQualityGate(unittest.TestCase):
    def setUp(self):
        self.script_path = os.path.join(os.path.dirname(__file__), '../../scripts/data_quality_gate.py')
        self.test_json_path = os.path.join(os.path.dirname(__file__), 'test_temp.json')
        self.report_json_path = os.path.join(os.path.dirname(__file__), 'test_report.json')
        self.report_html_path = os.path.join(os.path.dirname(__file__), 'test_report.html')

    def tearDown(self):
        for path in [self.test_json_path, self.report_json_path, self.report_html_path]:
            if os.path.exists(path):
                os.remove(path)

    def run_gate(self, data):
        with open(self.test_json_path, 'w') as f:
            json.dump(data, f)

        cmd = [sys.executable, self.script_path, self.test_json_path,
               '--json-report', self.report_json_path, '--html-report', self.report_html_path]

        result = subprocess.run(cmd, capture_output=True, text=True)

        if os.path.exists(self.report_json_path):
            with open(self.report_json_path, 'r') as f:
                report = json.load(f)
        else:
            report = None

        return result.returncode, report

    def test_valid_feature_collection(self):
        data = {
            "type": "FeatureCollection",
            "features": [
                {
                    "type": "Feature",
                    "properties": {"id": "1", "name": "Valid", "category": "Test"},
                    "geometry": {"type": "Point", "coordinates": [7.0, 51.0]}
                }
            ]
        }
        code, report = self.run_gate(data)
        self.assertEqual(code, 0)
        self.assertEqual(len(report['errors']), 0)

    def test_missing_mandatory_fields(self):
        data = {
            "type": "FeatureCollection",
            "features": [
                {
                    "type": "Feature",
                    "properties": {"id": "1", "name": ""}, # missing category, empty name
                    "geometry": {"type": "Point", "coordinates": [7.0, 51.0]}
                }
            ]
        }
        code, report = self.run_gate(data)
        self.assertEqual(code, 1)
        self.assertEqual(len(report['errors']), 1)
        self.assertIn("name, category", report['errors'][0]['message'])

    def test_outside_bbox(self):
        data = {
            "type": "FeatureCollection",
            "features": [
                {
                    "type": "Feature",
                    "properties": {"id": "1", "name": "Valid", "category": "Test"},
                    "geometry": {"type": "Point", "coordinates": [1.0, 1.0]}
                }
            ]
        }
        code, report = self.run_gate(data)
        self.assertEqual(code, 1)
        self.assertEqual(len(report['errors']), 1)
        self.assertIn("outside NRW Bounding Box", report['errors'][0]['message'])

    def test_invalid_geometry(self):
        data = {
            "type": "FeatureCollection",
            "features": [
                {
                    "type": "Feature",
                    "properties": {"id": "1", "name": "Valid", "category": "Test"},
                    "geometry": {"type": "Polygon", "coordinates": [[[1,1], [2,2]]]} # Needs 4 points, closed
                }
            ]
        }
        code, report = self.run_gate(data)
        self.assertEqual(code, 1)
        self.assertTrue(any("requires at least 4 positions" in err['message'] for err in report['errors']))

    def test_null_geometry(self):
        data = {
            "type": "FeatureCollection",
            "features": [
                {
                    "type": "Feature",
                    "properties": {"id": "1", "name": "Valid", "category": "Test"},
                    "geometry": None
                }
            ]
        }
        code, report = self.run_gate(data)
        self.assertEqual(code, 1)
        self.assertTrue(any("null geometry is not allowed" in err['message'] for err in report['errors']))

    def test_extreme_large_integer_coordinates(self):
        # Extremely large integers are valid in JSON but could overflow float conversion
        # The parser will parse it as a large int.
        large_int = 10**400
        data = {
            "type": "FeatureCollection",
            "features": [
                {
                    "type": "Feature",
                    "properties": {"id": "1", "name": "Valid", "category": "Test"},
                    "geometry": {"type": "Point", "coordinates": [large_int, large_int]}
                }
            ]
        }
        code, report = self.run_gate(data)
        self.assertEqual(code, 1)
        # Should gracefully fail bounding box check, not crash
        self.assertTrue(any("Coordinates outside NRW Bounding Box" in err['message'] for err in report['errors']))

if __name__ == '__main__':
    unittest.main()
