#!/bin/bash
echo "updating"
cd /home/pi/server/ygopro-server
mkdir update
cd update
git clone https://github.com/Fluorohydride/ygopro-scripts.git --recursive
git clone https://github.com/Fluorohydride/ygopro-pre-script.git --recursive -b master
git clone https://github.com/Ygoproco/Live2017Links.git --recursive -b master
git clone https://github.com/szefo09/cdb.git -b master
git clone https://github.com/moecube/ygopro-database.git -b master
#git clone https://github.com/Smile-DK/ygopro-scripts.git -b master
cd ygopro-scripts
git reset --hard
git pull
cd ..
cd ygopro-pre-script
git reset --hard
git pull
cd ..
cd Live2017Links
git reset --hard
git pull
cd ..
cd cdb
git reset --hard
git pull
cd ..
cd ygopro-database
git reset --hard
git pull
cd ..

echo "copying"
mkdir target
# rm -rf Live2017Links/script
rm -rf Live2017Links/fitsetcode.cdb
cp -u Live2017Links/*.cdb target
cp -u ygopro-database/locales/en-US/*.cdb target
cp -u ygopro-database/locales/en-US/*.conf target
cp -f cdb/*.cdb target/
cp -f cdb/*.conf target/
cp -u Live2017Links/lflist.conf target
#cp -u Live2017Links/strings.conf target
cp -n Live2017Links/script/c*.lua target
cp -f ygopro-pre-script/**/**/*.lua target
cp -f ygopro-pre-script/**/**/**/*.lua target
cp -f ygopro-pre-script/**/**/**/**/*.lua target
cp -f ygopro-scripts/*.lua target
cp -f cdb/*.lua target
cp -u target/*.cdb /home/pi/server/ygopro-server/updateYGOPro2
cp -u target/*.conf /home/pi/server/ygopro-server/updateYGOPro2
cp -u target/cards.cdb /home/pi/server/ygopro-server/ygopro
cp -u target/strings.conf /home/pi/server/ygopro-server/ygopro
rm -rf target/cards.cdb
mv -f target/*.lua /home/pi/server/ygopro-server/ygopro/script
rm -rf /home/pi/server/ygopro-server/ygopro/expansions/*
#mkdir -p /home/pi/server/ygopro-server/ygopro/expansions/official
#mv target/official.cdb /home/pi/server/ygopro-server/ygopro/expansions/official/
mv -f target/*.cdb /home/pi/server/ygopro-server/ygopro/expansions
mv -f target/lflist.conf /home/pi/server/ygopro-server/ygopro
mv -f target/strings.conf /home/pi/server/ygopro-server/ygopro
#rm -rf Live2017Links
#rm -rf ygopro-pre-script
#rm -rf ygopro-scripts
#rm -rf target
chmod -R 777 /home/pi/server/*
cd /home/pi/server/ygopro-server/updateYGOPro2
git add --all
git commit -m "autoUpdate"
git push
cd /home/pi/server/ygopro-server/ygopro/script
git add --all
git commit -m "autoUpdate"
git push
cd /home/pi/server/ygopro-server
#rm -rf update
echo "done"
