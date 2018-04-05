#!/bin/bash
cd ~/ygopro-server
git pull origin master
cd windbot
git pull origin master
echo y | xbuild /property:Configuration=Release
cd ../ygopro
git pull origin master
cd script
git pull origin master
git reset --hard FETCH_HEAD
cd ..
premake4 gmake
cd build
make config=release
cd ..
strip ygopro
cd ~
