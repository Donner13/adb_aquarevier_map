import unittest
from unittest.mock import patch, MagicMock
import sys
import os

# Ensure repo root is on sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

class TestDeploySurge(unittest.TestCase):
    @patch('subprocess.run')
    @patch('subprocess.Popen')
    def test_popen_calls_without_shell_true(self, mock_popen, mock_run):
        mock_run_result = MagicMock()
        mock_run_result.returncode = 0
        mock_run_result.stdout = "Vendor assets built"
        mock_run_result.stderr = ""
        mock_run.return_value = mock_run_result

        mock_process = MagicMock()
        mock_process.stdout.read.return_value = ""
        mock_process.poll.return_value = 0
        mock_popen.return_value = mock_process

        import deploy_surge

        mock_popen.assert_called_once()
        _, kwargs = mock_popen.call_args
        self.assertNotIn('shell', kwargs)
        self.assertFalse(kwargs.get('shell', False))

if __name__ == '__main__':
    unittest.main()
