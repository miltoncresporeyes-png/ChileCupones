const { MongoMemoryServer } = require('mongodb-memory-server');

(async () => {
  // Create an instance with a fixed port
  const mongod = await MongoMemoryServer.create({
    instance: {
      port: 27017, // Force port 27017 so our other tools can find it
    }
  });

  const uri = mongod.getUri();
  console.log(`Local MongoDB started at: ${uri}`);
  console.log('Press Ctrl+C to stop.');

  // Keep it running
  process.on('SIGTERM', async () => {
    await mongod.stop();
    process.exit(0);
  });
})();
