import os

code_parts = []

def add(s):
    code_parts.append(s)

def save():
    full_code = ''.join(code_parts)
    paths = [
        r'C:\project\pro\my-lionsgeek\resources\js\pages\admin\training\components\TrainingProgramme.jsx',
        r'C:\project\LionsGeek\resources\js\pages\admin\training\components\TrainingProgramme.jsx'
    ]
    for p in paths:
        if os.path.exists(os.path.dirname(p)):
            with open(p, 'w', encoding='utf-8') as out:
                out.write(full_code)
            print('Successfully saved to:', p)

