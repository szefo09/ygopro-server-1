#!/bin/bash
echo "updating Ygopro"
#sudo pm2 stop 0 1 2 3 
cd /home/pi/server/ygopro-server
#rm -rf ygopro
git clone https://github.com/purerosefallen/ygopro --branch=server --recursive
cd ygopro/
git reset --hard
git pull
git submodule foreach git checkout master
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
./update.sh
sudo pm2 restart 0 1 2 3

