import json

with open('package.json', 'r') as f:
    data = json.load(f)

data['scripts']['test:unit'] = 'node tests/unit/test_layer_control.js'
data['scripts']['test'] = 'npm run vendor && npm run test:unit && playwright test'

with open('package.json', 'w') as f:
    json.dump(data, f, indent=2)
