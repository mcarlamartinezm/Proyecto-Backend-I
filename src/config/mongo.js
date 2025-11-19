import mongoose from 'mongoose';

const connectMongoDB = async (uri) => {
  try {
    const mongoUri = uri ?? process.env.MONGO_URI ?? process.env.URI_MONGODB;
    if (!mongoUri) throw new Error('No se encontró MONGO_URI / URI_MONGODB en .env');

    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log("Conectado con MongoDB");
  } catch (error) {
    console.error("Error al conectar a MongoDB:", error.message);
    throw error; 
  }
};

export default connectMongoDB;
