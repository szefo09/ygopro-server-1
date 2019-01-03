#!/bin/bash
echo "updating"
cd /home/pi/server/ygopro-server
mkdir update
cd update
git clone https://github.com/Fluorohydride/ygopro-scripts.git --recursive
git clone https://github.com/Fluorohydride/ygopro-pre-script.git --recursive -b master
git clone https://github.com/Ygoproco/Live2017Links.git --recursive -b master
git clone https://github.com/szefo09/cdb.git -b master
echo "copying"
mkdir target
rm -rf Live2017Links/script
rm -rf Live2017Links/fitsetcode.cdb
cp -u Live2017Links/*.cdb target
mv -f cdb/*.cdb target/
mv -f cdb/*.conf target/
cp -u Live2017Links/lflist.conf target
cp -u ygopro-scripts/*.lua target
cp -u ygopro-pre-script/**/**/*.lua target
cp -u ygopro-pre-script/**/**/**/*.lua target
mv -f cdb/*.lua target/
cp -u target/cards.cdb /home/pi/server/ygopro-server/ygopro
cp -u target/strings.conf /home/pi/server/ygopro-server/ygopro
rm -rf target/cards.cdb
mv -f target/*.lua /home/pi/server/ygopro-server/ygopro/script
mkdir -p /home/pi/server/ygopro-server/ygopro/expansions/official
mv target/official.cdb /home/pi/server/ygopro-server/ygopro/expansions/official/
mv -f target/*.cdb /home/pi/server/ygopro-server/ygopro/expansions
mv -f target/lflist.conf /home/pi/server/ygopro-server/ygopro
#rm -rf Live2017Links
#rm -rf ygopro-pre-script
#rm -rf ygopro-scripts
#rm -rf target
#cd /home/pi/server/ygopro-server/ygopro/script
#git add *
#git commit -m "autoUpdate"
#git push
cd /home/pi/server/ygopro-server
rm -rf update
chmod -R 777 /home/pi/server/*
echo "done"
