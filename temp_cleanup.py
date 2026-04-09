import os
import shutil

user_dir = 'F:/bigsinger/lottery/src/user'
api_dir = 'F:/bigsinger/lottery/src/api'

# Delete api directory
if os.path.exists(api_dir):
    shutil.rmtree(api_dir)
    print('Deleted api directory')

# Delete extra files in user directory
for f in ['.gitignore', '.gitkeep', '.htaccess', 'README.md', 'example.json.example']:
    path = os.path.join(user_dir, f)
    if os.path.exists(path):
        os.remove(path)
        print(f'Deleted {f}')

# List remaining files
print('Remaining files in user directory:')
for f in os.listdir(user_dir):
    print(f)