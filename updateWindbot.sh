#!/bin/bash
echo "updating Windbot"
cd /home/pi/server/ygopro-server
git clone https://github.com/szefo09/windbot.git --recursive
cd windbot
git reset --hard
git pull
xbuild /property:Configuration=Release /property:TargetFrameworkVersion="v4.5"
ln -s bin/Release/WindBot.exe .
#ln -s ../ygopro/cards.cdb .
cd ..
chmod -R 777 /home/pi/server/*
sudo pm2 restart windbot-server
