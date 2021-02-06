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
goto :createArchive2


:getListFiles
REM Liste des fichiers à mettre dans l'archive
SET listFiles=app/icons/*
SET listFiles=%listFiles% assets/scripts/*
SET listFiles=%listFiles% assets/styles/*
SET listFiles=%listFiles% manifest.json
SET listFiles=%listFiles% popup.html

:createArchive
REM Création de l'archive
tar -cf !zipName! !listFiles!

:createArchive2
tar -cv --exclude=app/images --exclude=create_zip.bat -f !zipName! *