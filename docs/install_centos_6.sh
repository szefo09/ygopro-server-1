#!/bin/bash

# install script for CentOS 7

sudo -E systemctl stop firewalld

sudo -E yum update -y
sudo -E yum install epel-release yum-utils -y
sudo -E rpm --import "http://keyserver.ubuntu.com/pks/lookup?op=get&search=0x3FA7E0328081BFF6A14DA29AA6A19B38D3D831EF"
curl https://download.mono-project.com/repo/centos6-stable.repo | sudo -E tee /etc/yum.repos.d/mono-centos6-stable.repo
curl --silent --location https://rpm.nodesource.com/setup_10.x | sudo -E bash -
sudo -E yum install nodejs git gcc gcc-c++ sqlite-devel readline-devel openssl-devel wget mono-complete -y
sudo -E npm install pm2 -g

mkdir lib
cd lib

wget https://nchc.dl.sourceforge.net/project/p7zip/p7zip/16.02/p7zip_16.02_src_all.tar.bz2 --no-check-certificate
tar jxvf p7zip_16.02_src_all.tar.bz2
cd p7zip_16.02
sudo -E make all3 install
cd ..

wget http://download.redis.io/releases/redis-4.0.9.tar.gz --no-check-certificate
tar xzfv redis-4.0.9.tar.gz
cd redis-4.0.9
make
sudo -E make install
sudo -E cp -rf src/redis-server /usr/bin/
cd ..
pm2 start redis-server

wget 'http://www.lua.org/ftp/lua-5.3.4.tar.gz' --no-check-certificate
tar zxf lua-5.3.4.tar.gz
cd lua-5.3.4
sudo -E make linux test install
cd ..

wget -O - https://github.com/premake/premake-core/releases/download/v5.0.0-alpha12/premake-5.0.0-alpha12-linux.tar.gz | tar zfx -
sudo -E cp -rf premake5 /usr/bin/

wget 'https://github.com/libevent/libevent/releases/download/release-2.0.22-stable/libevent-2.0.22-stable.tar.gz' -O libevent-2.0.22-stable.tar.gz --no-check-certificate
tar xf libevent-2.0.22-stable.tar.gz
cd libevent-2.0.22-stable/
./configure
make
sudo -E make install
sudo -E ln -s /usr/local/lib/libevent-2.0.so.5 /usr/lib/libevent-2.0.so.5
sudo -E ln -s /usr/local/lib/libevent-2.0.so.5 /usr/lib64/libevent-2.0.so.5
sudo -E ln -s /usr/local/lib/libevent_pthreads-2.0.so.5 /usr/lib/libevent_pthreads-2.0.so.5
sudo -E ln -s /usr/local/lib/libevent_pthreads-2.0.so.5 /usr/lib64/libevent_pthreads-2.0.so.5
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
premake5 gmake
cd build/
make config=release
cd ..
ln -s bin/release/ygopro ./
strip ygopro
mkdir replay
cd ..

git clone https://github.com/purerosefallen/windbot
cd windbot
yes | xbuild /property:Configuration=Release
ln -s bin/Release/WindBot.exe .
ln -s ../ygopro/cards.cdb .
pm2 start pm2.json
cd ..

pm2 start ygopro-server.js
pm2 start ygopro-webhook.js

pm2 save
sudo -E pm2 startup
