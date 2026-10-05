import base64, os

# Read lines 1-10 from b64.txt
with open('scratch/b64.txt', 'r', encoding='utf-8') as f:
    lines = [l.strip() for l in f if l.strip()]

base_code = ''
for l in lines[:10]:
    base_code += base64.b64decode(l).decode('utf-8')

# Now append the rest of component directly
with open('scratch/rest.txt', 'r', encoding='utf-8') as rf:
    rest_code = rf.read()

full_code = base_code + rest_code

paths = [
    r'C:\project\pro\my-lionsgeek\resources\js\pages\admin\training\components\TrainingProgramme.jsx',
    r'C:\project\LionsGeek\resources\js\pages\admin\training\components\TrainingProgramme.jsx'
]

for p in paths:
    if os.path.exists(os.path.dirname(p)):
        with open(p, 'w', encoding='utf-8') as out:
            out.write(full_code)
        print('SUCCESS WRITING TO:', p)
