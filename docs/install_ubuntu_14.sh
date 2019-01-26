#!/bin/bash

export PROCESS_COUNT=$(grep -c "processor" /proc/cpuinfo)

sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys 3FA7E0328081BFF6A14DA29AA6A19B38D3D831EF
sudo apt-get install -y apt-transport-https curl wget
echo "deb http://download.mono-project.com/repo/ubuntu stable-trusty main" | sudo tee /etc/apt/sources.list.d/mono-official-stable.list
curl -sL https://deb.nodesource.com/setup_10.x | sudo bash -
sudo apt-get install -y git build-essential libreadline-dev libsqlite3-dev libevent-dev mono-complete nodejs redis-server
sudo npm install pm2 -g

wget -O - https://github.com/premake/premake-core/releases/download/v5.0.0-alpha13/premake-5.0.0-alpha13-linux.tar.gz | tar zfx -
cp -rf premake5 ~

git clone https://github.com/moecube/ygopro --branch=server --recursive
cd ygopro/
git submodule foreach git checkout master
~/premake5 gmake
git checkout -f
git submodule foreach git checkout -f
cd build/
make config=release -j$PROCESS_COUNT
cd ..
ln -s bin/release/ygopro ./
strip ygopro
cd ..

git clone https://github.com/purerosefallen/windbot
cd windbot
xbuild /property:Configuration=Release /property:TargetFrameworkVersion="v4.5"
ln -s bin/Release/WindBot.exe .
ln -s ../ygopro/cards.cdb .
cd ..

git clone https://github.com/purerosefallen/ygopro-server
cd ygopro-server
npm install
ln -s ../ygopro .
ln -s ../windbot .
mkdir config
cp data/default_config.json config/config.json
cd ..

