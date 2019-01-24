#!/bin/bash

# update script

git fetch origin master
git reset --hard FETCH_HEAD
cd windbot
git fetch origin master
git reset --hard FETCH_HEAD
xbuild /property:Configuration=Release /property:TargetFrameworkVersion="v4.5"
cd ../ygopro
git fetch origin server
git reset --hard FETCH_HEAD
git submodule foreach git fetch origin master
git submodule foreach git reset --hard FETCH_HEAD
~/premake5 gmake
cd build
make config=release
cd ../
strip ygopro
cd ../
