@echo off
chcp 65001 > nul
echo ========================================================
echo   未来リビングラボ 展示用起動ランチャー
echo   VOICEVOX エンジン ＋ 対話アプリを同時起動します
echo ========================================================
echo.

:: 1. VOICEVOX エンジンの起動確認
echo [1/3] VOICEVOX エンジンを確認中...
curl -s -m 2 http://127.0.0.1:50021/version > nul 2>&1
if %errorlevel% neq 0 (
    echo VOICEVOX エンジンを起動しています...
    set ENGINE_PATH=%LOCALAPPDATA%\Programs\VOICEVOX\vv-engine\run.exe
    if exist "%ENGINE_PATH%" (
        start "" "%ENGINE_PATH%" --host 127.0.0.1 --port 50021 --cors_policy_mode all
        timeout /t 3 /nobreak > nul
    ) else (
        echo [警告] VOICEVOX エンジンが見つかりません。VOICEVOX アプリを手動で起動してください。
    )
) else (
    echo VOICEVOX エンジンは既に起動しています。
)

:: 2. ブラウザを開く
echo.
echo [2/3] 展示ブラウザを起動中...
timeout /t 2 /nobreak > nul
start http://localhost:3000

:: 3. Next.js アプリの起動
echo.
echo [3/3] 対話アプリ（ローカルサーバー）を起動します...
echo 終了するときは この黒い画面で Ctrl + C を押してください。
echo.
npm run dev

pause
