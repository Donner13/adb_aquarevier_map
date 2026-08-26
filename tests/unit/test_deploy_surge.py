import sys
import os
import unittest
from unittest.mock import patch, MagicMock

# Ensure project root is in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

class TestDeploySurge(unittest.TestCase):
    @patch("subprocess.run")
    @patch("subprocess.Popen")
    def test_popen_does_not_use_shell(self, mock_popen, mock_run):
        # Mock subprocess.run return value for vendor assets
        mock_run_instance = MagicMock()
        mock_run_instance.returncode = 0
        mock_run_instance.stdout = "Vendor build success"
        mock_run.return_value = mock_run_instance

        # Mock Popen instance
        mock_popen_instance = MagicMock()
        mock_popen_instance.stdout.read.return_value = ""
        mock_popen_instance.poll.return_value = 0
        mock_popen_instance.returncode = 0
        mock_popen.return_value = mock_popen_instance

        # Import deploy_surge module dynamically
        if "deploy_surge" in sys.modules:
            del sys.modules["deploy_surge"]
        import deploy_surge

        # Check Popen call kwargs
        self.assertTrue(mock_popen.called)
        kwargs = mock_popen.call_args.kwargs
        self.assertNotIn("shell", kwargs, "shell parameter should not be passed to Popen")
        self.assertFalse(kwargs.get("shell", False), "shell parameter should not be True")

if __name__ == "__main__":
    unittest.main()
