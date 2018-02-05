set yyyy=%date:~6,4%
set mm=%date:~3,2%
set dd=%date:~0,2%

set h=%time:~0,2%
set m=%time:~3,2%

echo d|xcopy %CD% "%CD%\..\site archive\%yyyy%.%mm%.%dd% %h%-%m%" /E /q
