import base64, os

with open('scratch/tp.b64', 'r', encoding='utf-8') as f:
    b64_data = f.read().replace('\n', '').replace('\r', '').strip()

content = base64.b64decode(b64_data).decode('utf-8')

paths = [
    r'C:\project\pro\my-lionsgeek\resources\js\pages\admin\training\components\TrainingProgramme.jsx',
    r'C:\project\LionsGeek\resources\js\pages\admin\training\components\TrainingProgramme.jsx'
]

for p in paths:
    if os.path.exists(os.path.dirname(p)):
        with open(p, 'w', encoding='utf-8') as out:
            out.write(content)
        print('Successfully wrote TrainingProgramme.jsx to:', p)
