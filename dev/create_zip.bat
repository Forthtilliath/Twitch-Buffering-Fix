@ECHO OFF
setlocal EnableDelayedExpansion

REM Nom du fichier manifest
SET manifest=manifest.json
SET chaine=""version""
SET appName=Twitch_Buffering_Fix
SET extension=.zip

REM On recherche le numéro de version
for /f "tokens=2 delims=:," %%z in ('type "!manifest!"^|findstr /l /c:"!chaine!"') do (
    SET version=%%z
    REM On supprime les guillemets
    SET version=!version:"=!
    SET version=!version: =!
    goto :getZipName
)

:getZipName
REM Nom de l'archive
SET zipName=..\archives\%appName%-v%version%%extension%

REM Création de l'archive
tar -cf !zipName! !listFiles!
goto :createArchive7z

:createArchiveZip
tar -cv --exclude=app/images --exclude=create_zip.bat -f !zipName! *

:createArchive7z
"%PROGRAMFILES%/7-zip/7z" a !zipName! * -x^^!app/images -x^^!create_*.bat