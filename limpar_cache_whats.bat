@echo off
setlocal

REM === Caminho da pasta do WhatsEletron no AppData ===
set BASEDIR=%APPDATA%\whats-eletron\Partitions

echo =====================================
echo  Limpando cache do WhatsEletron...
echo  (sem deslogar o WhatsApp)
echo =====================================
echo.

REM Percorre todas as pastas whatsapp*
for /d %%D in ("%BASEDIR%\whatsapp*") do (
    echo Limpando %%D...

    rmdir /s /q "%%D\Cache" 2>nul
    rmdir /s /q "%%D\Code Cache" 2>nul
    rmdir /s /q "%%D\GPUCache" 2>nul
    rmdir /s /q "%%D\DawnCache" 2>nul
    rmdir /s /q "%%D\DawnGraphiteCache" 2>nul
    rmdir /s /q "%%D\DawnWebGPUCache" 2>nul
    rmdir /s /q "%%D\VideoDecodeStats" 2>nul
    rmdir /s /q "%%D\blob_storage" 2>nul
    rmdir /s /q "%%D\Network" 2>nul
    rmdir /s /q "%%D\Service Worker" 2>nul
)

echo.
echo =====================================
echo  Limpeza concluída com sucesso!
echo  Seus logins continuam preservados.
echo =====================================

pause
endlocal
