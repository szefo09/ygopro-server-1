#!/bin/bash

echo "updating Ygopro"
#sudo pm2 stop 0 1 2 3 
cd /home/pi/server/ygopro-server
#rm -rf ygopro
git clone https://github.com/purerosefallen/ygopro --branch=server
cd ygopro
git reset --hard
git pull
git clone https://github.com/szefo09/script.git
cd script
git reset --hard
git pull
cd ..
git clone https://github.com/Fluorohydride/ygopro-core.git ocgcore
cd ocgcore
git reset --hard
git pull
cd ..
cd ..
./update.sh
cd ygopro
#git submodule foreach git checkout master
premake4 gmake
cd build/
make -j5 config=release
cd ..
ln -s bin/release/ygopro ./
strip ygopro
mkdir replay
mkdir expansions
cd ..
chmod -R 777 /home/pi/server/*
cd /home/pi/server/ygopro-server
#sudo pm2 restart 0 1 2 3

