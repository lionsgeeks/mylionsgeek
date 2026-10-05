import base64  
import os  
with open('scratch/b64.txt', 'r', encoding='utf-8') as f:  
    b64_content = f.read().replace('\n', '').replace('\r', '').strip()  
decoded_code = base64.b64decode(b64_content).decode('utf-8')  
for target_path in [r'c:\project\pro\my-lionsgeek\resources\js\pages\admin\training\components\TrainingProgramme.jsx', r'c:\project\LionsGeek\resources\js\pages\admin\training\components\TrainingProgramme.jsx']:  
    os.makedirs(os.path.dirname(target_path), exist_ok=True)  
    with open(target_path, 'w', encoding='utf-8') as f:  
        f.write(decoded_code)  
print('FILE_WRITTEN_SUCCESSFULLY') 
