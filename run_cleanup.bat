@echo off
cd /d "C:\Users\Vithal Kerkar\OneDrive\Desktop\InternHop"
call "inthack_env\Scripts\activate.bat"
python manage.py cleanup_opportunities
