Install nodeJs

## Start API
cd server
npm.cmd install
npm.cmd run dev

## Start Web
cd client
npm.cmd install
npm.cmd run dev



# local
cd client
npm run dev   # or npm run build && serve dist with your server

# EC2 (after git push/pull)
cd client
npm install --include=dev
node ./node_modules/vite/bin/vite.js build

cd ../server
pm2 restart kss
