@echo off
echo 🚀 INICIANDO SISTEMA COMPLETO FII INVESTMENT APP
echo.
echo 📡 Servidor API: http://localhost:3001
echo 🌐 Frontend: http://localhost:5173
echo.
echo ⚡ Pressione Ctrl+C para parar ambos os serviços
echo.

start "API Server" cmd /k "npm run dev:api"
timeout /t 3 /nobreak > nul
start "Frontend" cmd /k "npm run dev"

echo ✅ Serviços iniciados!
echo 📋 API Endpoints: http://localhost:3001/api
echo 🏥 Health Check: http://localhost:3001/api/health
echo.
pause 