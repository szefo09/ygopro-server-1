#!/bin/bash

# update script

git pull origin master
git reset --hard FETCH_HEAD
cd windbot
git pull origin master
git reset --hard FETCH_HEAD
echo y | xbuild /property:Configuration=Release
cd ../ygopro
git pull origin server
git reset --hard FETCH_HEAD
git submodule foreach git pull origin master
git submodule foreach git reset --hard FETCH_HEAD
premake5 gmake
cd build
make config=release
cd ../
strip ygopro
cd ../
