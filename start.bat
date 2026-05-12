@echo off
echo 启动商机跟踪管理程序...

:: 启动后端服务
start "FastAPI Server" python server.py

:: 等待后端启动
timeout /t 3 /nobreak > nul

:: 启动前端服务
cd frontend
npm install
npm run dev

:: 返回上级目录
cd ..
pause
