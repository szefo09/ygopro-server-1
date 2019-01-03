#!/bin/bash

# install script for Ubnutu 16

sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys 3FA7E0328081BFF6A14DA29AA6A19B38D3D831EF
sudo apt-get install -y apt-transport-https
echo "deb http://download.mono-project.com/repo/ubuntu stable-trusty main" | sudo tee /etc/apt/sources.list.d/mono-official-stable.list
curl -sL https://deb.nodesource.com/setup_10.x | sudo bash -
sudo apt-get upgrade -y
sudo apt-get install -y curl git build-essential libreadline-dev libsqlite3-dev mono-complete nodejs firewalld
sudo npm install pm2 -g

sudo systemctl start firewalld
sudo firewall-cmd --zone=public --permanent --add-port=22/tcp
sudo firewall-cmd --zone=public --permanent --add-port=7210-7219/tcp
sudo firewall-cmd --reload

mkdir lib
cd lib

wget https://nchc.dl.sourceforge.net/project/p7zip/p7zip/16.02/p7zip_16.02_src_all.tar.bz2 --no-check-certificate
tar jxvf p7zip_16.02_src_all.tar.bz2
cd p7zip_16.02
sudo make all3 install
cd ..

wget http://download.redis.io/releases/redis-stable.tar.gz --no-check-certificate
tar xzfv redis-stable.tar.gz
cd redis-stable
make
sudo make install
sudo cp -rf src/redis-server /usr/bin/
cd ..
pm2 start redis-server

wget -O - https://github.com/premake/premake-core/releases/download/v5.0.0-alpha12/premake-5.0.0-alpha12-linux.tar.gz | tar zfx -
cp -rf premake5 ~

wget 'https://github.com/libevent/libevent/releases/download/release-2.0.22-stable/libevent-2.0.22-stable.tar.gz' -O libevent-2.0.22-stable.tar.gz --no-check-certificate
tar xf libevent-2.0.22-stable.tar.gz
cd libevent-2.0.22-stable/
./configure
make
sudo make install
sudo ln -s /usr/local/lib/libevent-2.0.so.5 /usr/lib/libevent-2.0.so.5
sudo ln -s /usr/local/lib/libevent-2.0.so.5 /usr/lib64/libevent-2.0.so.5
sudo ln -s /usr/local/lib/libevent_pthreads-2.0.so.5 /usr/lib/libevent_pthreads-2.0.so.5
sudo ln -s /usr/local/lib/libevent_pthreads-2.0.so.5 /usr/lib64/libevent_pthreads-2.0.so.5
cd ..

cd ..

git clone https://github.com/purerosefallen/ygopro-server ygopro-server
cd ygopro-server
npm install
cp -rf config_build config
mkdir decks decks_save replays

git clone https://github.com/purerosefallen/ygopro --branch=server --recursive
cd ygopro/
git submodule foreach git checkout master
~/premake5 gmake
cd build/
make config=release
cd ..
ln -s bin/release/ygopro ./
strip ygopro
mkdir replay
cd ..

git clone https://github.com/purerosefallen/windbot
cd windbot
xbuild /property:Configuration=Release /property:TargetFrameworkVersion="v4.5"
ln -s bin/Release/WindBot.exe .
ln -s ../ygopro/cards.cdb .
pm2 start pm2.json
cd ..

pm2 start ygopro-server.js
pm2 start ygopro-webhook.js
pm2 start restart.js

pm2 save
pm2 startup
