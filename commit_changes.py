import os
import subprocess

os.chdir('F:/bigsinger/lottery')

# Remove temp files
for f in ['temp_delete2.py', 'temp_git.py', 'commit_msg.txt']:
    if os.path.exists(f):
        os.remove(f)
        print(f'Removed {f}')

# Add all files
subprocess.run(['git', 'add', '-A'], check=True)

# Commit with message
commit_msg = """修复手机端渲染问题和移除PHP依赖

1. 修复手机端渲染不出来奖项的问题
   - 修改 app.js 的 initTurntable() 方法
   - 正确传入奖品列表到 draw() 方法

2. 移除PHP依赖，改用纯前端方案
   - 删除 src/api/api.php 文件
   - 简化 storage.js，移除 ServerStorageManager 类
   - 更新文档，移除PHP相关内容
   - 更新 README.md 和设计文档.md"""

subprocess.run(['git', 'commit', '-m', commit_msg], check=True)
print('Committed successfully')

# Push to remote
subprocess.run(['git', 'remote', 'add', 'origin', 'https://github.com/bigsinger/lottery.git'], capture_output=True)
subprocess.run(['git', 'push', '-u', 'origin', 'master', '--force'], check=True)
print('Pushed successfully')