const mongoose = require('mongoose');
const MONGODB_URI = 'mongodb+srv://mwaqar7615_db_user:RxbImKsWIQw4mugR@cluster0.xrjlzk3.mongodb.net/super_store_erp?appName=Cluster0';

async function run() {
  await mongoose.connect(MONGODB_URI);
  const db = mongoose.connection.db;
  const carts = await db.collection('carts').find({}).toArray();
  console.log(JSON.stringify(carts, null, 2));
  process.exit(0);
}
run();
